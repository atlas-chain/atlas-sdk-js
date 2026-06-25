# Payload Reference Only Plan

Atlas payload transport is moving to a reference-only model.

## Goals

- Create and update operations always upload payload bytes to an Atlas payload provider.
- Arkiv transactions carry signed payload-reference JSON, not raw payload bytes.
- `arkiv_query` never returns raw payload bytes.
- SDK callers can opt into automatic payload hydration through the payload provider.

## Write Path

The SDK requires `payloadProvider` configuration for `createEntity`, `updateEntity`,
and `mutateEntities` create/update operations.

For every create/update payload the SDK:

1. Derives or reads the entity key.
2. Generates a nonzero 32-byte reference nonce.
3. Uploads the raw payload to `POST /arkiv/payloads`.
4. Verifies the provider metadata, checksum, payload id, and EIP-191 receipt.
5. Sends `execute(Operation[])` with:
   - `contentType = application/vnd.atlas.payload-reference+json`
   - `payload = UTF-8 JSON bytes of the signed payload reference`

Inline create/update payloads are removed from the SDK API.

## Query Path

`arkiv_query` returns entity metadata and a lightweight `payloadRef` only:

```ts
type PayloadReferenceSummary = {
  provider: string
  id: string
  namespace: string
  contentType?: string
  checksum: string
  sizeBytes: number
  submittedAt?: string
}
```

The query response does not include raw payload bytes or the full signed reference
JSON. Clients fetch payload bodies from the payload provider when needed.

## SDK Hydration

SDK read helpers can hydrate payloads explicitly:

```ts
const result = await client.query("$all", {
  hydratePayloads: true,
  payloadProviderConcurrency: 5,
})
```

Hydration:

- fetches `GET /payloads/{id}/raw` from the configured payload provider,
- runs at most `payloadProviderConcurrency` downloads at once,
- defaults concurrency to `5`,
- clamps concurrency to a maximum of `32`,
- verifies both `sha256:<payload>` checksum and provider payload id before
  attaching bytes to `Entity.payload`.

Query builder compatibility:

```ts
const result = await client.buildQuery().where(...).withPayload().fetch()
```

`withPayload()` requests payload references from Arkiv RPC and hydrates payload
bytes from the configured payload provider.

## Legacy Inline Entities

Existing inline entities may still exist in old development state. Query should
not return inline payload bytes for them. They should be migrated by uploading the
raw bytes to a provider and updating the entity to a signed reference.
