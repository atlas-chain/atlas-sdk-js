[**@atlas-chain/sdk v0.6.11**](../../index.md)

***

[@atlas-chain/sdk](../../index.md) / [main](../index.md) / WalletArkivClientConfig

# Type Alias: WalletArkivClientConfig\<transport, chain, accountOrAddress, rpcSchema\>

> **WalletArkivClientConfig**\<`transport`, `chain`, `accountOrAddress`, `rpcSchema`\> = `WalletClientConfig`\<`transport`, `chain`, `accountOrAddress`, `rpcSchema`\> & `object`

Defined in: [src/clients/createWalletClient.ts:27](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/clients/createWalletClient.ts#L27)

## Type Declaration

### payloadProvider?

> `optional` **payloadProvider**: [`PayloadProviderConfig`](PayloadProviderConfig.md) \| `false`

## Type Parameters

### transport

`transport` *extends* `Transport`

### chain

`chain` *extends* `Chain` \| `undefined` = `undefined`

### accountOrAddress

`accountOrAddress` *extends* `Account` \| `Address` \| `undefined` = `undefined`

### rpcSchema

`rpcSchema` *extends* `RpcSchema` \| `undefined` = [`ArkivRpcSchema`](ArkivRpcSchema.md)
