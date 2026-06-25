[**@atlas-chain/sdk v0.6.11**](../../index.md)

***

[@atlas-chain/sdk](../../index.md) / [query](../index.md) / desc

# Function: desc()

> **desc**(`attributeName`, `attributeType`): [`OrderByAttribute`](../type-aliases/OrderByAttribute.md)

Defined in: [src/query/queryBuilder.ts:41](https://github.com/atlas-chain/atlas-sdk-js/blob/e1278b56b35a0b8422e6147e639a35ed04bc71f3/src/query/queryBuilder.ts#L41)

Helper function to create a descending order by attribute

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
const descAttribute = desc("name", "string")
```
