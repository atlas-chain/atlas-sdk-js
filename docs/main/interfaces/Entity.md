[**@atlas-chain/sdk v0.6.11**](../../index.md)

***

[@atlas-chain/sdk](../../index.md) / [main](../index.md) / Entity

# Interface: Entity

Defined in: [src/types/entity.ts:16](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/types/entity.ts#L16)

## Properties

### attributes

> **attributes**: [`Attribute`](../type-aliases/Attribute.md)[]

Defined in: [src/types/entity.ts:28](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/types/entity.ts#L28)

***

### contentType

> **contentType**: [`MimeType`](../type-aliases/MimeType.md) \| `undefined`

Defined in: [src/types/entity.ts:18](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/types/entity.ts#L18)

***

### createdAtBlock

> **createdAtBlock**: `bigint` \| `undefined`

Defined in: [src/types/entity.ts:22](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/types/entity.ts#L22)

***

### creator

> **creator**: `` `0x${string}` `` \| `undefined`

Defined in: [src/types/entity.ts:20](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/types/entity.ts#L20)

***

### expiresAtBlock

> **expiresAtBlock**: `bigint` \| `undefined`

Defined in: [src/types/entity.ts:21](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/types/entity.ts#L21)

***

### key

> **key**: `` `0x${string}` ``

Defined in: [src/types/entity.ts:17](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/types/entity.ts#L17)

***

### lastModifiedAtBlock

> **lastModifiedAtBlock**: `bigint` \| `undefined`

Defined in: [src/types/entity.ts:23](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/types/entity.ts#L23)

***

### operationIndexInTransaction

> **operationIndexInTransaction**: `bigint` \| `undefined`

Defined in: [src/types/entity.ts:25](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/types/entity.ts#L25)

***

### owner

> **owner**: `` `0x${string}` `` \| `undefined`

Defined in: [src/types/entity.ts:19](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/types/entity.ts#L19)

***

### payload

> **payload**: `Uint8Array`\<`ArrayBufferLike`\> \| `undefined`

Defined in: [src/types/entity.ts:27](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/types/entity.ts#L27)

***

### payloadRef

> **payloadRef**: [`PayloadReferenceSummary`](../type-aliases/PayloadReferenceSummary.md) \| `undefined`

Defined in: [src/types/entity.ts:26](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/types/entity.ts#L26)

***

### transactionIndexInBlock

> **transactionIndexInBlock**: `bigint` \| `undefined`

Defined in: [src/types/entity.ts:24](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/types/entity.ts#L24)

## Methods

### toJson()

> **toJson**(): `unknown`

Defined in: [src/types/entity.ts:86](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/types/entity.ts#L86)

Parses the entity payload as JSON and returns the resulting object.
Throws an error if the payload is undefined, which may occur if the entity was not queried with the withPayload option.
Throws an error if the payload is empty or cannot be parsed as JSON.

#### Returns

`unknown`

The parsed JSON object from the entity payload.

***

### toText()

> **toText**(): `string`

Defined in: [src/types/entity.ts:64](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/types/entity.ts#L64)

Converts the entity payload from bytes to a string and returns it.
Throws an error if the payload is undefined, which may occur if the entity was not queried with the withPayload option.
Throws an error if the conversion from bytes to string fails.

#### Returns

`string`

The entity payload as a string.
