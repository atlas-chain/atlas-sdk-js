[**@atlas-chain/sdk v0.6.9**](../../index.md)

***

[@atlas-chain/sdk](../../index.md) / [main](../index.md) / Entity

# Interface: Entity

Defined in: [src/types/entity.ts:14](https://github.com/atlas-chain/atlas-sdk-js/blob/0463276bc2e3407da08671d2bac33fc79aa732e1/src/types/entity.ts#L14)

## Properties

### attributes

> **attributes**: [`Attribute`](../type-aliases/Attribute.md)[]

Defined in: [src/types/entity.ts:25](https://github.com/atlas-chain/atlas-sdk-js/blob/0463276bc2e3407da08671d2bac33fc79aa732e1/src/types/entity.ts#L25)

***

### contentType

> **contentType**: [`MimeType`](../type-aliases/MimeType.md) \| `undefined`

Defined in: [src/types/entity.ts:16](https://github.com/atlas-chain/atlas-sdk-js/blob/0463276bc2e3407da08671d2bac33fc79aa732e1/src/types/entity.ts#L16)

***

### createdAtBlock

> **createdAtBlock**: `bigint` \| `undefined`

Defined in: [src/types/entity.ts:20](https://github.com/atlas-chain/atlas-sdk-js/blob/0463276bc2e3407da08671d2bac33fc79aa732e1/src/types/entity.ts#L20)

***

### creator

> **creator**: `` `0x${string}` `` \| `undefined`

Defined in: [src/types/entity.ts:18](https://github.com/atlas-chain/atlas-sdk-js/blob/0463276bc2e3407da08671d2bac33fc79aa732e1/src/types/entity.ts#L18)

***

### expiresAtBlock

> **expiresAtBlock**: `bigint` \| `undefined`

Defined in: [src/types/entity.ts:19](https://github.com/atlas-chain/atlas-sdk-js/blob/0463276bc2e3407da08671d2bac33fc79aa732e1/src/types/entity.ts#L19)

***

### key

> **key**: `` `0x${string}` ``

Defined in: [src/types/entity.ts:15](https://github.com/atlas-chain/atlas-sdk-js/blob/0463276bc2e3407da08671d2bac33fc79aa732e1/src/types/entity.ts#L15)

***

### lastModifiedAtBlock

> **lastModifiedAtBlock**: `bigint` \| `undefined`

Defined in: [src/types/entity.ts:21](https://github.com/atlas-chain/atlas-sdk-js/blob/0463276bc2e3407da08671d2bac33fc79aa732e1/src/types/entity.ts#L21)

***

### operationIndexInTransaction

> **operationIndexInTransaction**: `bigint` \| `undefined`

Defined in: [src/types/entity.ts:23](https://github.com/atlas-chain/atlas-sdk-js/blob/0463276bc2e3407da08671d2bac33fc79aa732e1/src/types/entity.ts#L23)

***

### owner

> **owner**: `` `0x${string}` `` \| `undefined`

Defined in: [src/types/entity.ts:17](https://github.com/atlas-chain/atlas-sdk-js/blob/0463276bc2e3407da08671d2bac33fc79aa732e1/src/types/entity.ts#L17)

***

### payload

> **payload**: `Uint8Array`\<`ArrayBufferLike`\> \| `undefined`

Defined in: [src/types/entity.ts:24](https://github.com/atlas-chain/atlas-sdk-js/blob/0463276bc2e3407da08671d2bac33fc79aa732e1/src/types/entity.ts#L24)

***

### transactionIndexInBlock

> **transactionIndexInBlock**: `bigint` \| `undefined`

Defined in: [src/types/entity.ts:22](https://github.com/atlas-chain/atlas-sdk-js/blob/0463276bc2e3407da08671d2bac33fc79aa732e1/src/types/entity.ts#L22)

## Methods

### toJson()

> **toJson**(): `any`

Defined in: [src/types/entity.ts:81](https://github.com/atlas-chain/atlas-sdk-js/blob/0463276bc2e3407da08671d2bac33fc79aa732e1/src/types/entity.ts#L81)

Parses the entity payload as JSON and returns the resulting object.
Throws an error if the payload is undefined, which may occur if the entity was not queried with the withPayload option.
Throws an error if the payload is empty or cannot be parsed as JSON.

#### Returns

`any`

The parsed JSON object from the entity payload.

***

### toText()

> **toText**(): `string`

Defined in: [src/types/entity.ts:59](https://github.com/atlas-chain/atlas-sdk-js/blob/0463276bc2e3407da08671d2bac33fc79aa732e1/src/types/entity.ts#L59)

Converts the entity payload from bytes to a string and returns it.
Throws an error if the payload is undefined, which may occur if the entity was not queried with the withPayload option.
Throws an error if the conversion from bytes to string fails.

#### Returns

`string`

The entity payload as a string.
