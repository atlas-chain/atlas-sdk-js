[**@atlas-chain/sdk v0.6.9**](../../index.md)

***

[@atlas-chain/sdk](../../index.md) / [query](../index.md) / lt

# Function: lt()

> **lt**(`key`, `value`): [`Predicate`](../type-aliases/Predicate.md)

Defined in: [src/query/predicate.ts:111](https://github.com/atlas-chain/atlas-sdk-js/blob/0463276bc2e3407da08671d2bac33fc79aa732e1/src/query/predicate.ts#L111)

Creates a less than predicate

## Parameters

### key

`string`

The key to compare

### value

The value to compare

`string` | `number`

## Returns

[`Predicate`](../type-aliases/Predicate.md)

The less than predicate

## Example

```ts
const predicate = lt("name", "John")
// result = { type: "lt", key: "name", value: "John" }
```
