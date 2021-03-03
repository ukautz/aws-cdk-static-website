import { expect as expectCDK, countResources, haveResource, haveResourceLike } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as path from 'path';
import { assertSnapshot } from './utils';

import * as lib from '../lib/index';
import * as s3 from '@aws-cdk/aws-s3';
import { time } from 'console';
import { prependOnceListener } from 'process';

/*
 * Example test
 */
describe('Stack Website', () => {
  describe('Default', () => {
    // WHEN
    const stack = createTestStack();

    // THEN
    assertSnapshot(stack);
    assertBucket(stack);
    assertCloudFront(stack);
    assertDelegationRecord(stack);
  });

  describe('Storage', () => {
    describe('Bucket Name', () => {
      // WHEN
      const stack = createTestStack({
        bucket: 'my-bucket-name',
      });

      // THEN
      assertSnapshot(stack);
      assertBucket(stack, {
        BucketName: 'my-bucket-name',
      });
    });

    describe('Bucket Prefix', () => {
      // WHEN
      const stack = createTestStack({
        bucketContentPrefix: '/my/prefix/path',
      });

      // THEN
      assertSnapshot(stack);

      test('CloudFront delegates to prefix', () => {
        expectCDK(stack).to(
          haveResourceLike('AWS::CloudFront::Distribution', {
            DistributionConfig: {
              Origins: [
                {
                  OriginPath: '/my/prefix/path',
                },
              ],
            },
          })
        );
      });
    });

    describe('Custom Bucket', () => {
      // WHEN
      const stack = createTestStack({}, (stack) => ({
        bucket: new s3.Bucket(stack, 'Bucket', {
          bucketName: 'the-pre-existing-bucket',
        }),
      }));

      // THEN
      assertSnapshot(stack);
      assertBucket(stack, {
        BucketName: 'the-pre-existing-bucket',
      });
    });
  });

  describe('CDN', () => {
    describe('Cache Duration', () => {
      // WHEN
      const stack = createTestStack({
        cacheDuration: cdk.Duration.seconds(123),
      });

      // THEN
      assertSnapshot(stack);
      assertCloudFront(stack, {
        cacheDuration: 123,
      });
    });
    describe('Custom Error Page', () => {
      // WHEN
      const stack = createTestStack({
        errorPage: 'custom-error.html',
        errorCacheDuration: cdk.Duration.seconds(123),
      });

      // THEN
      assertSnapshot(stack);
      assertCloudFront(stack, {
        errorPage: 'custom-error.html',
        errorCacheDuration: 123,
      });
    });
  });

  describe('Website mode', () => {
    describe('Disabled', () => {
      // WHEN
      const stack = createTestStack({
        websiteMode: false,
      });

      // THEN
      assertSnapshot(stack);
      test('Bucket website configuration is NOT enabled', () => {
        expectCDK(stack).to(
          haveResource('AWS::S3::Bucket', {
            BucketEncryption: {
              ServerSideEncryptionConfiguration: [
                {
                  ServerSideEncryptionByDefault: {
                    SSEAlgorithm: 'AES256',
                  },
                },
              ],
            },
          })
        );
      });
      test('CloudFront uses S3 origin', () => {
        expectCDK(stack).to(
          haveResourceLike('AWS::CloudFront::Distribution', {
            DistributionConfig: {
              Origins: [
                {
                  S3OriginConfig: undefined,
                },
              ],
            },
          })
        );
      });
    });
    describe('Enabled', () => {
      // WHEN
      const stack = createTestStack({
        websiteMode: true,
      });

      // THEN
      assertSnapshot(stack);
      test('Bucket website configuration IS enabled', () => {
        expectCDK(stack).to(
          haveResource('AWS::S3::Bucket', {
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
          })
        );
      });
      test('CloudFront uses custom origin', () => {
        expectCDK(stack).to(
          haveResourceLike('AWS::CloudFront::Distribution', {
            DistributionConfig: {
              Origins: [
                {
                  CustomOriginConfig: undefined,
                },
              ],
            },
          })
        );
      });
    });
  });

  describe('Domain aliases', () => {
    // WHEN
    const stack = createTestStack({
      domainAliases: ['www.blog.acme.tld'],
    });

    // THEN
    assertSnapshot(stack);
    test('Used in certificate generation', () => {
      expectCDK(stack).to(
        haveResourceLike('AWS::CloudFormation::CustomResource', {
          DomainName: 'blog.acme.tld',
          SubjectAlternativeNames: ['www.blog.acme.tld'],
        })
      );
    });
    test('Used as CloudFront alias', () => {
      expectCDK(stack).to(
        haveResourceLike('AWS::CloudFront::Distribution', {
          DistributionConfig: {
            Aliases: ['blog.acme.tld', 'www.blog.acme.tld'],
          },
        })
      );
    });
  });
});

function createTestStack(
  props?: Partial<lib.StaticWebsiteProps>,
  generate?: (stack: cdk.Stack) => Partial<lib.StaticWebsiteProps>
): cdk.Stack {
  const stack = new cdk.Stack();
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

function assertBucket(stack: cdk.Stack, props?: any) {
  test('Bucket in place', () => {
    expectCDK(stack).to(countResources('AWS::S3::Bucket', 1));
  });
  if (props) {
    test('Bucket configured', () => {
      expectCDK(stack).to(haveResource('AWS::S3::Bucket', props));
    });
  }
}

function assertCloudFront(
  stack: cdk.Stack,
  opt?: { cacheDuration?: number; errorPage?: string; errorCacheDuration?: number }
) {
  describe('CDN Distribution', () => {
    test('Is in place', () => {
      expectCDK(stack).to(countResources('AWS::CloudFront::Distribution', 1));
    });
    test('Uses public domain', () => {
      expectCDK(stack).to(
        haveResourceLike('AWS::CloudFront::Distribution', {
          DistributionConfig: {
            Aliases: ['blog.acme.tld'],
          },
        })
      );
    });
    test('Has certificate', () => {
      expectCDK(stack).to(
        haveResourceLike('AWS::CloudFront::Distribution', {
          DistributionConfig: {
            ViewerCertificate: {
              SslSupportMethod: 'sni-only',
            },
          },
        })
      );
    });
    test('Limits cache duration', () => {
      expectCDK(stack).to(
        haveResourceLike('AWS::CloudFront::CachePolicy', {
          CachePolicyConfig: {
            DefaultTTL: opt?.cacheDuration ?? 3600,
          },
        })
      );
    });
    if (opt?.errorPage) {
      test('Custom error page for 404s', () => {
        expectCDK(stack).to(
          haveResourceLike('AWS::CloudFront::Distribution', {
            DistributionConfig: {
              CustomErrorResponses: [
                {
                  ErrorCode: 404,
                  ErrorCachingMinTTL: opt.errorCacheDuration,
                  ResponsePagePath: '/' + opt.errorPage,
                },
              ],
            },
          })
        );
      });
    }
  });
}

function assertDelegationRecord(stack: cdk.Stack) {
  describe('DNS Delegation Record', () => {
    test('Is in place', () => {
      expectCDK(stack).to(countResources('AWS::Route53::RecordSet', 1));
    });
    test('Use public domain', () => {
      expectCDK(stack).to(
        haveResource('AWS::Route53::RecordSet', {
          Name: 'blog.acme.tld.',
        })
      );
    });
  });
}
