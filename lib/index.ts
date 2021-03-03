import * as cdk from '@aws-cdk/core';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as deployment from '@aws-cdk/aws-s3-deployment';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as route53 from '@aws-cdk/aws-route53';
import * as s3 from '@aws-cdk/aws-s3';
import * as targets from '@aws-cdk/aws-route53-targets';

const defaultCacheDuration = cdk.Duration.hours(1);
export interface StaticWebsiteProps {
  /**
   * The bucket which will contain the website contents.
   *
   * Optional, will be created otherwise. If
   */
  bucket?: string | s3.IBucket;

  /**
   * The prefix (path) where the contents can be found in the bucket
   */
  bucketContentPrefix?: string;

  /**
   * Certificate can be provided as:
   * - undefined - creates a new certificate (managed)
   * - string (arn) - loads existing certificate
   * - actual certificate - uses that
   *
   *  If provided in any way, HTTPS will be enforced
   */
  certificate?: string | acm.ICertificate;

  /**
   * Cache duration for CloudFront
   *
   * @default 1 hour
   */
  cacheDuration?: cdk.Duration;

  /**
   * Whether and which request cookies to use in cache key
   * - false: disabled, ignore cookies
   * - true: enabled (all cookies)
   * - string[]: allow list of cookie names
   *
   * @default false
   */
  cacheCookies?: boolean | string[];

  /**
   * Whether and which request headers to use in cache key
   * - false: disabled, ignore headers
   * - string[]: allow list of cookie names
   *
   * @default false
   */
  cacheHeaders?: false | string[];

  /**
   * Whether and which request query parameter to use in cache key
   * - false: disabled, ignore headers
   * - true: enabled (all request query parameter)
   * - string[]: allow list of cookie names
   *
   * @default false
   */
  cacheQuery?: false | string[];

  /**
   * The directory that contains the website contents that are to be published
   */
  directory: string;

  /**
   * The public domain name under which the website shall be accessible
   */
  domain: string;

  /**
   * Additional list of domain names.
   * MUST be in the same hosted zone as above!
   */
  domainAliases?: string[];

  /**
   * Object key of 404 error page in bucket
   */
  errorPage?: string;

  /**
   * Cache duration for custom 404 error pages
   *
   * @default 1 hour
   */
  errorCacheDuration?: cdk.Duration;

  /**
   * The hosted zone in which the A record for the domain, pointing to CloudFront, is to be created
   */
  hostedZone: route53.IHostedZone;

  /**
   * Object key of default index page in bucket
   *
   * @default index.html
   */
  indexPage?: string;

  /**
   * Whether to enable website mode, which allows to "link to directory that contain an index.html file",
   * but also requires the S3 bucket to be publicly accessible, hence no guarantees all traffic comes through CloudFront
   */
  websiteMode?: boolean;
}

const trimSlashes = (str: string): string => str.replace(/^\/+/, '').replace(/^\/+/, '');
export class StaticWebsite extends cdk.Construct {
  public readonly hostedZone: route53.IHostedZone;
  public readonly bucket: s3.IBucket;
  public readonly certificate: acm.ICertificate;
  public readonly distribution: cloudfront.IDistribution;
  public readonly record: route53.IRecordSet;

  constructor(scope: cdk.Construct, id: string, props: StaticWebsiteProps) {
    super(scope, id);

    this.hostedZone = props.hostedZone;
    this.bucket = this.loadBucket(props);
    this.certificate = this.loadCertificate(props);
    this.distribution = this.initDistribution(props);
    this.record = this.initRecord(props);
    this.uploadContents(props);
  }

  private initDistribution(props: StaticWebsiteProps): cloudfront.IDistribution {
    // default: no cookies, or generally headers or query parameters are used to build cache key. ONLY PATH
    const cachePolicy = new cloudfront.CachePolicy(this, 'DistributionCachePolicy', {
      cookieBehavior: !props.cacheCookies
        ? cloudfront.CacheCookieBehavior.none()
        : typeof props.cacheCookies === 'boolean'
        ? cloudfront.CacheCookieBehavior.all()
        : cloudfront.CacheCookieBehavior.allowList(...props.cacheCookies),
      headerBehavior: !props.cacheHeaders
        ? cloudfront.CacheHeaderBehavior.none()
        : cloudfront.CacheHeaderBehavior.allowList(...props.cacheHeaders),
      queryStringBehavior: !props.cacheQuery
        ? cloudfront.CacheQueryStringBehavior.none()
        : typeof props.cacheQuery === 'boolean'
        ? cloudfront.CacheQueryStringBehavior.all()
        : cloudfront.CacheQueryStringBehavior.allowList(...props.cacheQuery),
      defaultTtl: props.cacheDuration ?? defaultCacheDuration,
    });

    const asPath = (path?: string, prefixed?: boolean) =>
      path ? `/${(prefixed ? props.bucketContentPrefix ?? '' : '') + trimSlashes(path)}` : undefined;
    return new cloudfront.Distribution(this, 'Distribution', {
      domainNames: [props.domain].concat(...(props.domainAliases ?? [])),
      certificate: this.certificate,
      defaultRootObject: props.indexPage ?? 'index.html',
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket, {
          originPath: asPath(props.bucketContentPrefix),
        }),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
        cachePolicy,
      },
      errorResponses: props.errorPage
        ? [
            {
              httpStatus: 404,
              responsePagePath: asPath(props.errorPage, true),
              ttl: props.errorCacheDuration,
            },
          ]
        : undefined,
    });
  }

  private initRecord(props: StaticWebsiteProps): route53.IRecordSet {
    return new route53.ARecord(this, 'Record', {
      recordName: props.domain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution)),
      zone: this.hostedZone,
    });
  }

  private uploadContents(props: StaticWebsiteProps) {
    const asPrefix = (path?: string) => (path ? trimSlashes(path) : undefined);
    new deployment.BucketDeployment(this, 'Deployment', {
      sources: [deployment.Source.asset(props.directory)],
      destinationBucket: this.bucket,
      destinationKeyPrefix: asPrefix(props.bucketContentPrefix),
    });
  }

  private loadBucket(props: StaticWebsiteProps): s3.IBucket {
    if (!props.bucket || typeof props.bucket === 'string') {
      return new s3.Bucket(this, 'Bucket', {
        bucketName: props.bucket,

        // whether or not website configuration is enabled
        ...(props.websiteMode
          ? {
              publicReadAccess: true,
              websiteIndexDocument: props.indexPage ?? 'index.html',
              websiteErrorDocument: props.errorPage ?? 'error.html',
            }
          : {}),

        // enable encryption at rest of the blog contents - not that it is public anyway ..
        encryption: s3.BucketEncryption.S3_MANAGED,

        // Note: this bucket is intended to contain only contents build during deploy, so it can be safely removed
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });
    }
    return props.bucket;
  }

  private loadCertificate(props: StaticWebsiteProps): acm.ICertificate {
    if (typeof props.certificate === 'string') {
      acm.Certificate.fromCertificateArn(this, 'Certificate', props.certificate);
    } else if (props.certificate) {
      return props.certificate;
    }
    return new acm.DnsValidatedCertificate(this, 'Certificate', {
      domainName: props.domain,
      subjectAlternativeNames: props.domainAliases,
      hostedZone: this.hostedZone,
      region: 'us-east-1',
    });
  }
}
