[**@atlas-chain/sdk v0.6.9**](../../index.md)

***

[@atlas-chain/sdk](../../index.md) / [query](../index.md) / asc

# Function: asc()

> **asc**(`attributeName`, `attributeType`): [`OrderByAttribute`](../type-aliases/OrderByAttribute.md)

Defined in: [src/query/queryBuilder.ts:24](https://github.com/atlas-chain/atlas-sdk-js/blob/0463276bc2e3407da08671d2bac33fc79aa732e1/src/query/queryBuilder.ts#L24)

Helper function to create an ascending order by attribute

## Parameters

### attributeName

`string`

The name of the attribute to order by

### attributeType

The type of the attribute to order by (string or number)

`"string"` | `"number"`

## Returns

[`OrderByAttribute`](../type-aliases/OrderByAttribute.md)

Input for orderBy method

## Example

```ts
const ascAttribute = asc("name", "string")
```
