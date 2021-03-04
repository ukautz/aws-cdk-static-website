# Blogstack: Static Website

An AWS CDK pattern / solution construct.

**This is experimental! Do not use in production**, I use it for my private blog.

Implements a static website, which will be deployed from a local directory to a bucket, that is provided behind a CloudFront CDN.

## Overview

The AWS infrastructure looks like that:

![Diagram](static-website.png)

## Usage

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
      domainName: 'your-domain.tld,
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

- _S3 bucket not as website_: In "website mode", an S3 bucket is public. I prefer the bucket to be completely transparent and not accessible, so this is the default. As a consequence, the fallback to `index.html` does not work. I mitigate that on the build site, by assuring all links point to specific documents, not folders that would require a fallback to said `index.html` document. To enable website mode use `websiteMode: true`
- _All (peer-)dependencies are pinned version_, as `@experimental` constructs are being used, interface changes in minor upgrades are expected. I plan to use [dependabot](https://dependabot.com/), or a more targeted implementation, to automatically build this (and all my other AWS CDK modules) whenever a new AWS CDK version is released.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
