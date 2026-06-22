[**@atlas-chain/sdk v0.6.9**](../../index.md)

***

[@atlas-chain/sdk](../../index.md) / [query](../index.md) / and

# Function: and()

> **and**(`predicates`): [`Predicate`](../type-aliases/Predicate.md)

Defined in: [src/query/predicate.ts:41](https://github.com/atlas-chain/atlas-sdk-js/blob/0463276bc2e3407da08671d2bac33fc79aa732e1/src/query/predicate.ts#L41)

Creates an AND predicate

## Parameters

### predicates

[`Predicate`](../type-aliases/Predicate.md)[]

The predicates to combine

## Returns

[`Predicate`](../type-aliases/Predicate.md)

The AND predicate

## Example

```ts
const predicates = [eq("name", "John"), eq("age", 30)]
const result = and(predicates)
// result = { type: "and", predicates: [eq("name", "John"), eq("age", 30)] }
```
