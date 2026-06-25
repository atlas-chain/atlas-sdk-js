[**@atlas-chain/sdk v0.6.11**](../../index.md)

***

[@atlas-chain/sdk](../../index.md) / [main](../index.md) / ArkivRpcSchema

# Type Alias: ArkivRpcSchema

> **ArkivRpcSchema** = \[\{ `Method`: `"arkiv_query"`; `Parameters?`: \[`string`, [`RpcQueryOptions`](RpcQueryOptions.md)\]; `ReturnType`: \{ `blockNumber`: `bigint`; `cursor`: `string`; `data`: [`RpcEntity`](RpcEntity.md)[]; \}; \}, \{ `Method`: `"arkiv_getBlockTiming"`; `Parameters?`: \[\]; `ReturnType`: \{ `current_block`: `bigint`; `current_block_time`: `number`; `duration`: `number`; \}; \}, \{ `Method`: `"arkiv_getEntityCount"`; `Parameters?`: \[\]; `ReturnType`: `number`; \}\]

Defined in: [src/types/rpcSchema.ts:59](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/types/rpcSchema.ts#L59)
