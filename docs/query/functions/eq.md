[**@atlas-chain/sdk v0.6.9**](../../index.md)

***

[@atlas-chain/sdk](../../index.md) / [query](../index.md) / eq

# Function: eq()

> **eq**(`key`, `value`): [`Predicate`](../type-aliases/Predicate.md)

Defined in: [src/query/predicate.ts:55](https://github.com/atlas-chain/atlas-sdk-js/blob/0463276bc2e3407da08671d2bac33fc79aa732e1/src/query/predicate.ts#L55)

Creates an equality predicate

## Parameters

### key

`string`

The key to compare

### value

The value to compare

`string` | `number`

## Returns

[`Predicate`](../type-aliases/Predicate.md)

The equality predicate

## Example

```ts
const predicate = eq("name", "John")
// result = { type: "eq", key: "name", value: "John" }
```
