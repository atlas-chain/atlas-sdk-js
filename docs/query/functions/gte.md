[**@atlas-chain/sdk v0.6.9**](../../index.md)

***

[@atlas-chain/sdk](../../index.md) / [query](../index.md) / gte

# Function: gte()

> **gte**(`key`, `value`): [`Predicate`](../type-aliases/Predicate.md)

Defined in: [src/query/predicate.ts:97](https://github.com/atlas-chain/atlas-sdk-js/blob/0463276bc2e3407da08671d2bac33fc79aa732e1/src/query/predicate.ts#L97)

Creates a greater than or equal predicate

## Parameters

### key

`string`

The key to compare

### value

The value to compare

`string` | `number`

## Returns

[`Predicate`](../type-aliases/Predicate.md)

The greater than or equal predicate

## Example

```ts
const predicate = gte("name", "John")
// result = { type: "gte", key: "name", value: "John" }
```
