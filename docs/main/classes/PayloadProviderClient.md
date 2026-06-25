[**@atlas-chain/sdk v0.6.11**](../../index.md)

***

[@atlas-chain/sdk](../../index.md) / [main](../index.md) / PayloadProviderClient

# Class: PayloadProviderClient

Defined in: [src/payloadProvider/client.ts:15](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/payloadProvider/client.ts#L15)

## Constructors

### Constructor

> **new PayloadProviderClient**(`config`): `PayloadProviderClient`

Defined in: [src/payloadProvider/client.ts:20](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/payloadProvider/client.ts#L20)

#### Parameters

##### config

`Pick`\<[`PayloadProviderConfig`](../type-aliases/PayloadProviderConfig.md), `"url"` \| `"bearerKey"` \| `"fetch"`\>

#### Returns

`PayloadProviderClient`

## Accessors

### url

#### Get Signature

> **get** **url**(): `string`

Defined in: [src/payloadProvider/client.ts:36](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/payloadProvider/client.ts#L36)

##### Returns

`string`

## Methods

### getRawPayload()

> **getRawPayload**(`id`): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

Defined in: [src/payloadProvider/client.ts:64](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/payloadProvider/client.ts#L64)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

***

### submitArkivPayload()

> **submitArkivPayload**(`input`): `Promise`\<[`SubmitArkivPayloadResponse`](../type-aliases/SubmitArkivPayloadResponse.md)\>

Defined in: [src/payloadProvider/client.ts:40](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/payloadProvider/client.ts#L40)

#### Parameters

##### input

[`SubmitArkivPayloadInput`](../type-aliases/SubmitArkivPayloadInput.md)

#### Returns

`Promise`\<[`SubmitArkivPayloadResponse`](../type-aliases/SubmitArkivPayloadResponse.md)\>
