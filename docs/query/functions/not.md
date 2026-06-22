[**@atlas-chain/sdk v0.6.9**](../../index.md)

***

[@atlas-chain/sdk](../../index.md) / [query](../index.md) / not

# Function: not()

> **not**(`key`): [`Predicate`](../type-aliases/Predicate.md)

Defined in: [src/query/predicate.ts:138](https://github.com/atlas-chain/atlas-sdk-js/blob/0463276bc2e3407da08671d2bac33fc79aa732e1/src/query/predicate.ts#L138)

Creates a not predicate

## Parameters

### key

`string`

The key to compare

## Returns

[`Predicate`](../type-aliases/Predicate.md)

The not predicate

## Example

```ts
const predicate = not("name")
// result = { type: "not", key: "name", value: "" }
```
