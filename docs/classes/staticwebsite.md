[@ukautz/aws-cdk-static-website](../README.md) / StaticWebsite

# Class: StaticWebsite

A level 3 construct that implements a static website, consisting of:
- A publicly readable S3 bucket, that mirrors a local directory of HTML files and associated assets
- A CloudFront distribution, as a CDN in front of the S3 bucket
- A set of one or more Route53 records to route to the CloudFront
- An ACM certificate, that is associated with above CloudFront

## Hierarchy

- `Construct`

  ↳ **`StaticWebsite`**

## Table of contents

### Constructors

- [constructor](staticwebsite.md#constructor)

### Properties

- [bucket](staticwebsite.md#bucket)
- [certificate](staticwebsite.md#certificate)
- [distribution](staticwebsite.md#distribution)
- [hostedZone](staticwebsite.md#hostedzone)
- [node](staticwebsite.md#node)
- [records](staticwebsite.md#records)

### Methods

- [initBucket](staticwebsite.md#initbucket)
- [initDistribution](staticwebsite.md#initdistribution)
- [initRecords](staticwebsite.md#initrecords)
- [loadCertificate](staticwebsite.md#loadcertificate)
- [onPrepare](staticwebsite.md#onprepare)
- [onSynthesize](staticwebsite.md#onsynthesize)
- [onValidate](staticwebsite.md#onvalidate)
- [prepare](staticwebsite.md#prepare)
- [synthesize](staticwebsite.md#synthesize)
- [toString](staticwebsite.md#tostring)
- [uploadContents](staticwebsite.md#uploadcontents)
- [validate](staticwebsite.md#validate)
- [isConstruct](staticwebsite.md#isconstruct)

## Constructors

### constructor

• **new StaticWebsite**(`scope`, `id`, `props`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `scope` | `Construct` |
| `id` | `string` |
| `props` | [`StaticWebsiteProps`](../interfaces/staticwebsiteprops.md) |

#### Overrides

cdk.Construct.constructor

#### Defined in

[lib/index.ts:149](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L149)

## Properties

### bucket

• `Readonly` **bucket**: `Bucket`

The bucket in which the static website contents are in

#### Defined in

[lib/index.ts:134](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L134)

___

### certificate

• `Readonly` **certificate**: `ICertificate`

The certificate associated with the CloudFront that serves the static website

#### Defined in

[lib/index.ts:139](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L139)

___

### distribution

• `Readonly` **distribution**: `Distribution`

The CloudFront distribution that serves the static website

#### Defined in

[lib/index.ts:144](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L144)

___

### hostedZone

• `Readonly` **hostedZone**: `IHostedZone`

The hosted zone used for the static website

#### Defined in

[lib/index.ts:129](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L129)

___

### node

• `Readonly` **node**: `ConstructNode`

The construct tree node associated with this construct.

**`stability`** stable

#### Inherited from

cdk.Construct.node

#### Defined in

node_modules/@aws-cdk/core/lib/construct-compat.d.ts:77

___

### records

• `Readonly` **records**: `IRecordSet`[]

The DNS records for the domain and domain aliases that point to the CloudFront that serves the static website

#### Defined in

[lib/index.ts:149](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L149)

## Methods

### initBucket

▸ `Private` **initBucket**(`props`): `Bucket`

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`StaticWebsiteProps`](../interfaces/staticwebsiteprops.md) |

#### Returns

`Bucket`

#### Defined in

[lib/index.ts:229](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L229)

___

### initDistribution

▸ `Private` **initDistribution**(`props`): `Distribution`

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`StaticWebsiteProps`](../interfaces/staticwebsiteprops.md) |

#### Returns

`Distribution`

#### Defined in

[lib/index.ts:162](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L162)

___

### initRecords

▸ `Private` **initRecords**(`props`): `IRecordSet`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`StaticWebsiteProps`](../interfaces/staticwebsiteprops.md) |

#### Returns

`IRecordSet`[]

#### Defined in

[lib/index.ts:209](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L209)

___

### loadCertificate

▸ `Private` **loadCertificate**(`props`): `ICertificate`

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`StaticWebsiteProps`](../interfaces/staticwebsiteprops.md) |

#### Returns

`ICertificate`

#### Defined in

[lib/index.ts:244](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L244)

___

### onPrepare

▸ `Protected` **onPrepare**(): `void`

Perform final modifications before synthesis.

This method can be implemented by derived constructs in order to perform
final changes before synthesis. prepare() will be called after child
constructs have been prepared.

This is an advanced framework feature. Only use this if you
understand the implications.

**`stability`** stable

#### Returns

`void`

#### Inherited from

cdk.Construct.onPrepare

#### Defined in

node_modules/@aws-cdk/core/lib/construct-compat.d.ts:104

___

### onSynthesize

▸ `Protected` **onSynthesize**(`session`): `void`

Allows this construct to emit artifacts into the cloud assembly during synthesis.

This method is usually implemented by framework-level constructs such as `Stack` and `Asset`
as they participate in synthesizing the cloud assembly.

**`stability`** stable

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `session` | `ISynthesisSession` | The synthesis session. |

#### Returns

`void`

#### Inherited from

cdk.Construct.onSynthesize

#### Defined in

node_modules/@aws-cdk/core/lib/construct-compat.d.ts:114

___

### onValidate

▸ `Protected` **onValidate**(): `string`[]

Validate the current construct.

This method can be implemented by derived constructs in order to perform
validation logic. It is called on all constructs before synthesis.

**`stability`** stable

#### Returns

`string`[]

An array of validation error messages, or an empty array if the construct is valid.

#### Inherited from

cdk.Construct.onValidate

#### Defined in

node_modules/@aws-cdk/core/lib/construct-compat.d.ts:91

___

### prepare

▸ `Protected` **prepare**(): `void`

Perform final modifications before synthesis.

This method can be implemented by derived constructs in order to perform
final changes before synthesis. prepare() will be called after child
constructs have been prepared.

This is an advanced framework feature. Only use this if you
understand the implications.

**`stability`** stable

#### Returns

`void`

#### Inherited from

cdk.Construct.prepare

#### Defined in

node_modules/@aws-cdk/core/lib/construct-compat.d.ts:137

___

### synthesize

▸ `Protected` **synthesize**(`session`): `void`

Allows this construct to emit artifacts into the cloud assembly during synthesis.

This method is usually implemented by framework-level constructs such as `Stack` and `Asset`
as they participate in synthesizing the cloud assembly.

**`stability`** stable

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `session` | `ISynthesisSession` | The synthesis session. |

#### Returns

`void`

#### Inherited from

cdk.Construct.synthesize

#### Defined in

node_modules/@aws-cdk/core/lib/construct-compat.d.ts:147

___

### toString

▸ **toString**(): `string`

Returns a string representation of this construct.

**`stability`** stable

#### Returns

`string`

#### Inherited from

cdk.Construct.toString

#### Defined in

node_modules/constructs/lib/construct.d.ts:363

___

### uploadContents

▸ `Private` **uploadContents**(`props`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`StaticWebsiteProps`](../interfaces/staticwebsiteprops.md) |

#### Returns

`void`

#### Defined in

[lib/index.ts:220](https://github.com/ukautz/aws-cdk-static-website/blob/v1.0.0/lib/index.ts#L220)

___

### validate

▸ `Protected` **validate**(): `string`[]

Validate the current construct.

This method can be implemented by derived constructs in order to perform
validation logic. It is called on all constructs before synthesis.

**`stability`** stable

#### Returns

`string`[]

An array of validation error messages, or an empty array if the construct is valid.

#### Inherited from

cdk.Construct.validate

#### Defined in

node_modules/@aws-cdk/core/lib/construct-compat.d.ts:124

___

### isConstruct

▸ `Static` **isConstruct**(`x`): x is Construct

Return whether the given object is a Construct.

**`stability`** stable

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `any` |

#### Returns

x is Construct

#### Inherited from

cdk.Construct.isConstruct

#### Defined in

node_modules/@aws-cdk/core/lib/construct-compat.d.ts:71
