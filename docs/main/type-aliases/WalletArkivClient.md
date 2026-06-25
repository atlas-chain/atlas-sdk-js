[**@atlas-chain/sdk v0.6.11**](../../index.md)

***

[@atlas-chain/sdk](../../index.md) / [main](../index.md) / WalletArkivClient

# Type Alias: WalletArkivClient\<transport, chain, account, rpcSchema\>

> **WalletArkivClient**\<`transport`, `chain`, `account`, `rpcSchema`\> = `Prettify`\<`Client`\<`transport`, `chain`, `account`, `rpcSchema`, [`WalletArkivActions`](WalletArkivActions.md)\<`transport`, `chain`, `account`\>\>\>

Defined in: [src/clients/createWalletClient.ts:18](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/clients/createWalletClient.ts#L18)

## Type Parameters

### transport

`transport` *extends* `Transport` = `Transport`

### chain

`chain` *extends* `Chain` \| `undefined` = `Chain` \| `undefined`

### account

`account` *extends* `Account` \| `undefined` = `Account` \| `undefined`

### rpcSchema

`rpcSchema` *extends* `RpcSchema` \| `undefined` = [`ArkivRpcSchema`](ArkivRpcSchema.md)
