# Blogstack: Static Website

An AWS CDK pattern / solution construct.

**This is experimental! Do not use in production**, I use it for my private blog.

Implements a static website, which will be deployed from a local directory to a bucket, that is provided behind a CloudFront CDN.

## Overview

The AWS infrastructure looks like that:

![Diagram](static-website.png)

## Usage

**Note:** The NPM package is hosted on [Github packages](https://github.com/features/packages) as I do not consider it production ready and do not want to contribute to accidental installs… Read up how to use Github Packages hosted NPM packages if you want to use it. Read up how to use [Github Packages hosted NPM packages](https://docs.github.com/en/packages/guides/configuring-npm-for-use-with-github-packages#installing-a-package) if you want to use it

In your stack:

```typescript
import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import { StaticWebsite } from '@ukautz/aws-cdk-blogstack-static-website';

export class YourStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.Stack) {
    super(scope, id, props);

    // load or create a hosted zone
    const hostedZone = route53.HostedZone.fromLookup(this, 'id', {
      domainName: 'your-domain.tld',
    });

    // create all static website infra
    new StaticWebsite(this, 'StaticWebsite', {
      directory: '/path/to/where/your/contents/are',
      domain: 'blog.your-domain.tld',
      hostedZone,
    });
  }
}
```


## Notes

This is a very opinionated implementation:

- _Website Mode_: This module implements two behaviors that influence how website delivery from S3 is being done in regards to `index.html` files:
  - `websiteMode: false` (default): The S3 bucket is hidden and closed, that is: not accessible from anything but CloudFront. This can only be done if the S3 bucket website is _not _ configured as a [website](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-websiteconfiguration.html). The consequence is: URLs _must_ point to files, _not_ folders. As in: `https://yourdomain.tld/blog/` will _not_ work, it must be `https://yourdomain.tld/blog/index.html` (or whichever HTML document contains the blog)
  - `websiteMode: true`: The S3 bucket is openly (read) accessible by everyone, including CloudFront and the bucket is configured as a [website](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-websiteconfiguration.html), which means `index.html` is being used if the URL path points to a folder.
- _All (peer-)dependencies are pinned version_, as `@experimental` constructs are being used, interface changes in minor upgrades are expected. I run a [tooling](.github/workflows/aws-cdk-update.yml) once a week that runs all the tests and creates new releases, assuming AWS CDK has a new release

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
