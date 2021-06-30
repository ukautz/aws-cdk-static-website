[@ukautz/aws-cdk-static-website](../README.md) / StaticWebsiteProps

# Interface: StaticWebsiteProps

## Table of contents

### Properties

- [bucketContentPrefix](staticwebsiteprops.md#bucketcontentprefix)
- [cacheCookies](staticwebsiteprops.md#cachecookies)
- [cacheDuration](staticwebsiteprops.md#cacheduration)
- [cacheHeaders](staticwebsiteprops.md#cacheheaders)
- [cacheQuery](staticwebsiteprops.md#cachequery)
- [certificate](staticwebsiteprops.md#certificate)
- [directory](staticwebsiteprops.md#directory)
- [domain](staticwebsiteprops.md#domain)
- [domainAliases](staticwebsiteprops.md#domainaliases)
- [errorCacheDuration](staticwebsiteprops.md#errorcacheduration)
- [errorPage](staticwebsiteprops.md#errorpage)
- [hostedZone](staticwebsiteprops.md#hostedzone)
- [indexPage](staticwebsiteprops.md#indexpage)

## Properties

### bucketContentPrefix

• `Optional` **bucketContentPrefix**: `string`

The prefix (path) where the contents can be found in the bucket

**`default`** empty (no prefix)

#### Defined in

[lib/index.ts:18](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L18)

___

### cacheCookies

• `Optional` **cacheCookies**: `boolean` \| `string`[]

Whether and which request cookies to use in cache key

Can be:
- undefined or false: disabled, ignore cookies
- true: enabled (all cookies)
- string[]: allow list of cookie names

**`default`** false

#### Defined in

[lib/index.ts:49](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L49)

___

### cacheDuration

• `Optional` **cacheDuration**: `Duration`

Cache duration for CloudFront

**`default`** 1 hour

#### Defined in

[lib/index.ts:37](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L37)

___

### cacheHeaders

• `Optional` **cacheHeaders**: ``false`` \| `string`[]

Whether and which request headers to use in cache key

Can be:
- undefined or false: disabled, ignore headers
- string[]: allow list of cookie names

**`default`** false

#### Defined in

[lib/index.ts:60](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L60)

___

### cacheQuery

• `Optional` **cacheQuery**: ``false`` \| `string`[]

Whether and which request query parameter to use in cache key

Can be:
- undefined or false: disabled, ignore headers
- true: enabled (all request query parameter)
- string[]: allow list of cookie names

**`default`** false

#### Defined in

[lib/index.ts:72](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L72)

___

### certificate

• `Optional` **certificate**: `string` \| `ICertificate`

The certificate assigned to CloudFront distribution

Can be:
- undefined: new certificate will be created and maintained by the construct
- "arn:of:cert:..": loads existing certificate
- acm.ICertificate: uses provided certificate

 If provided in any way, HTTPS will be enforced

#### Defined in

[lib/index.ts:30](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L30)

___

### directory

• **directory**: `string`

The local directory that contains the website contents that are to be published

#### Defined in

[lib/index.ts:77](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L77)

___

### domain

• **domain**: `string`

The public domain name under which the website shall be accessible

#### Defined in

[lib/index.ts:82](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L82)

___

### domainAliases

• `Optional` **domainAliases**: `string`[]

Additional list of domain names.

Note: MUST be in the same hosted zone as domain!

#### Defined in

[lib/index.ts:89](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L89)

___

### errorCacheDuration

• `Optional` **errorCacheDuration**: `Duration`

Cache duration for custom 404 error pages

**`default`** 1 hour

#### Defined in

[lib/index.ts:101](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L101)

___

### errorPage

• `Optional` **errorPage**: `string`

Object key of 404 error page in bucket

#### Defined in

[lib/index.ts:94](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L94)

___

### hostedZone

• **hostedZone**: `IHostedZone`

The hosted zone in which the A record for the domain, pointing to CloudFront, is to be created

#### Defined in

[lib/index.ts:106](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L106)

___

### indexPage

• `Optional` **indexPage**: `string`

Object key of default index page in bucket

**`default`** index.html

#### Defined in

[lib/index.ts:113](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L113)
