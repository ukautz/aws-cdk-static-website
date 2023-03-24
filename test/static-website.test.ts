import * as cdk from 'aws-cdk-lib';
import { aws_route53 as route53 } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { IConstruct } from 'constructs';
import * as path from 'path';
import * as lib from '../lib/index';

/*
 * Example test
 */
describe('Stack Website', () => {
  describe('Default', () => {
    // WHEN
    const stack = createTestStack();
    const template = Template.fromStack(stack);

    // THEN
    assertSnapshot(stack);
    assertBucket(stack);
    assertCloudFront(template);
    assertDelegationRecord(template);
  });

  describe('Storage', () => {
    describe('Bucket Prefix', () => {
      // WHEN
      const stack = createTestStack({
        bucketContentPrefix: '/my/prefix/path',
      });
      const template = Template.fromStack(stack);

      // THEN
      assertSnapshot(stack);

      test('CloudFront delegates to prefix', () => {
        template.hasResourceProperties('AWS::CloudFront::Distribution', {
          DistributionConfig: {
            Origins: [
              {
                OriginPath: '/my/prefix/path',
              },
            ],
          },
        });
      });
    });
  });

  describe('CDN', () => {
    describe('Cache Duration', () => {
      // WHEN
      const stack = createTestStack({
        cacheDuration: cdk.Duration.seconds(123),
      });
      const template = Template.fromStack(stack);

      // THEN
      assertSnapshot(stack);
      assertCloudFront(template, {
        cacheDuration: 123,
      });
    });
    describe('Custom Error Page', () => {
      // WHEN
      const stack = createTestStack({
        errorPage: 'custom-error.html',
        errorCacheDuration: cdk.Duration.seconds(123),
      });
      const template = Template.fromStack(stack);

      // THEN
      assertSnapshot(stack);
      assertCloudFront(template, {
        errorPage: 'custom-error.html',
        errorCacheDuration: 123,
      });
    });
  });

  describe('Domain aliases', () => {
    // WHEN
    const stack = createTestStack({
      domainAliases: ['www.blog.acme.tld'],
    });
    const template = Template.fromStack(stack);

    // THEN
    assertSnapshot(stack);
    test('Used in certificate', () => {
      template.hasResourceProperties('AWS::CertificateManager::Certificate', {
        DomainName: 'blog.acme.tld',
        SubjectAlternativeNames: ['www.blog.acme.tld'],
      });
    });
    test('Used as CloudFront alias', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          Aliases: ['blog.acme.tld', 'www.blog.acme.tld'],
        },
      });
    });
    test('Has all delegation records', () => {
      template.resourceCountIs('AWS::Route53::RecordSet', 2);
    });
  });

  describe('Non us-east-1 region', () => {
    // WHEN
    const stack = createTestStack({}, undefined, 'us-east-2');
    const template = Template.fromStack(stack);

    // THEN
    assertSnapshot(stack);
    test('Lambda to manage certificate is created', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Handler: 'index.certificateRequestHandler',
      });
    });
    test('Custom resource that references certificate is created', () => {
      template.hasResourceProperties('AWS::CloudFormation::CustomResource', {
        DomainName: 'blog.acme.tld',
        Region: 'us-east-1',
      });
    });
    test('CloudFront is referencing certificate requestor', () => {
      const certificate = getChild(
        stack,
        'MyTestConstruct',
        'Certificate',
        'CertificateRequestorResource'
      ) as cdk.CustomResource;
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          Aliases: ['blog.acme.tld'],
          ViewerCertificate: {
            AcmCertificateArn: stack.resolve(certificate.getAtt('Arn')),
          },
        },
      });
    });
  });
});

function getChild(parent: IConstruct, ...names: string[]): IConstruct {
  const child = parent.node.findChild(names.shift() as string);
  return names.length ? getChild(child, ...names) : child;
}

function assertSnapshot(stack: cdk.Stack): void {
  const template = Template.fromStack(stack);
  it('Has consistent snapshot', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });
}

function createTestStack(
  props?: Partial<lib.StaticWebsiteProps>,
  generate?: (stack: cdk.Stack) => Partial<lib.StaticWebsiteProps>,
  region?: string
): cdk.Stack {
  const stack = new cdk.Stack(undefined, 'Stack', {
    env: {
      region: region || 'us-east-1',
    },
  });
  const hostedZone = new route53.HostedZone(stack, 'HostedZone', {
    zoneName: 'acme.tld',
  });
  new lib.StaticWebsite(stack, 'MyTestConstruct', {
    directory: path.join(__dirname, '__fixtures__'),
    domain: 'blog.acme.tld',
    hostedZone,
    ...props,
    ...(generate ? generate(stack) : {}),
  });
  return stack;
}

function assertBucket(stack: cdk.Stack) {
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::S3::Bucket', {
    WebsiteConfiguration: {
      ErrorDocument: 'error.html',
      IndexDocument: 'index.html',
    },
    BucketEncryption: {
      ServerSideEncryptionConfiguration: [
        {
          ServerSideEncryptionByDefault: {
            SSEAlgorithm: 'AES256',
          },
        },
      ],
    },
  });
}

function assertCloudFront(
  template: Template,
  opt?: { cacheDuration?: number; errorPage?: string; errorCacheDuration?: number }
) {
  describe('CDN Distribution', () => {
    test('Is in place', () => {
      template.resourceCountIs('AWS::CloudFront::Distribution', 1);
    });
    test('Uses public domain', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          Aliases: ['blog.acme.tld'],
        },
      });
    });
    test('Has certificate', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          ViewerCertificate: {
            SslSupportMethod: 'sni-only',
          },
        },
      });
    });
    test('Limits cache duration', () => {
      template.hasResourceProperties('AWS::CloudFront::CachePolicy', {
        CachePolicyConfig: {
          DefaultTTL: opt?.cacheDuration ?? 3600,
        },
      });
    });
    if (opt?.errorPage) {
      test('Custom error page for 404s', () => {
        template.hasResourceProperties('AWS::CloudFront::Distribution', {
          DistributionConfig: {
            CustomErrorResponses: [
              {
                ErrorCode: 404,
                ErrorCachingMinTTL: opt.errorCacheDuration,
                ResponsePagePath: '/' + opt.errorPage,
              },
            ],
          },
        });
      });
    }
  });
}

function assertDelegationRecord(template: Template) {
  describe('DNS Delegation Record', () => {
    test('Is in place', () => {
      template.resourceCountIs('AWS::Route53::RecordSet', 1);
    });
    test('Use public domain', () => {
      template.hasResourceProperties('AWS::Route53::RecordSet', {
        Name: 'blog.acme.tld.',
      });
    });
  });
}
