[**@atlas-chain/sdk v0.6.11**](../../index.md)

***

[@atlas-chain/sdk](../../index.md) / [query](../index.md) / eq

# Function: eq()

> **eq**(`key`, `value`): [`Predicate`](../type-aliases/Predicate.md)

Defined in: [src/query/predicate.ts:55](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/query/predicate.ts#L55)

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
