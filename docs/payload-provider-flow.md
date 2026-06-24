# Payload Provider Transaction Flow

This document describes the first SDK integration with the Atlas Payload Provider.
The current ARKIV contract remains unchanged in this version.

## Goal

Before the SDK sends a create or update transaction to the ARKIV RPC, it can submit
the entity payload bytes to a payload-provider service. The provider stores the
payload, returns metadata, and optionally returns an EIP-191 signature proving that
it received the exact payload.

The transaction still sends the original payload bytes inline to the current
contract. Provider data is additive and is returned to the caller.

## First Version Flow

```mermaid
sequenceDiagram
  participant App
  participant SDK
  participant Provider as Payload Provider
  participant RPC as ARKIV RPC
  participant Contract as Current Contract

  App->>SDK: createEntity/updateEntity/mutateEntities(payload, attrs, contentType, expiresIn)

  SDK->>SDK: Prepare operation inputs
  SDK->>SDK: Derive entityKey for creates
  SDK->>SDK: Base64 encode original payload bytes

  SDK->>Provider: POST /arkiv/payloads
  Note over SDK,Provider: payloadBase64 + contentType + attributes + expiresIn + entityKey

  Provider->>Provider: Validate payload, attrs, namespace
  Provider->>Provider: Compute payload id and checksum
  Provider->>Provider: Persist payload bytes
  Provider->>Provider: Sign receipt with EIP-191

  Provider-->>SDK: Payload metadata + full signature receipt

  SDK->>SDK: Verify provider receipt/signature
  SDK->>SDK: Keep receipt for return value

  SDK->>RPC: writeContract execute(ops)
  Note over SDK,RPC: Current version still sends original payload bytes in tx calldata

  RPC->>Contract: execute(ops)
  Contract->>Contract: Store entity payload + metadata on chain
  Contract-->>RPC: Transaction result

  RPC-->>SDK: Transaction hash
  SDK->>RPC: waitForTransactionReceipt(txHash)
  RPC-->>SDK: Transaction receipt

  SDK-->>App: entityKey, txHash, payload provider receipt/signature
```

## Data Movement

Conceptually, the same original payload bytes take two paths:

```text
Original payload bytes
   |
   |--> Payload Provider: stored bytes + signed receipt
   |
   |--> Current Contract: inline payload bytes, unchanged behavior
```

The provider path gives applications an external availability record immediately.
The contract path keeps existing RPC, query, and read behavior intact.

## Provider Submission

The SDK uses the ARKIV-aware provider endpoint:

```http
POST /arkiv/payloads
Content-Type: application/json
Authorization: Bearer <optional token>
```

The request includes:

- `namespace`, defaulting to `arkiv.entities`.
- `payloadBase64`, generated from the original `Uint8Array`.
- `contentType`.
- `attributes`.
- `expiresIn`.
- `entityKey`, derived for creates and supplied for updates.

The response includes:

- normalized ARKIV context,
- provider payload metadata,
- and, when signing is enabled, the full EIP-191 receipt signature.

## Return Values

When payload-provider mode is enabled, wallet actions return their normal
transaction data plus provider receipt data.

```ts
const result = await client.createEntity(...)

result.entityKey
result.txHash
result.payloadReceipt
```

For batched mutations:

```ts
const result = await client.mutateEntities(...)

result.txHash
result.createdEntities
result.updatedEntities
result.payloadReceipts
```

Each provider receipt is associated with a create or update operation and contains
the entity key, provider URL, normalized ARKIV context, payload metadata, and
signature verification result.

## Later Contract Version

After the contract supports detached payload references, the lower branch can
change from inline payload bytes to a compact provider reference:

```text
Original payload bytes
   |
   |--> Payload Provider: stored bytes + signed receipt
   |
   |--> Future Contract: provider reference + signature data
```

The first reference format can include the full signature. Later versions can
optimize it into a smaller payload id, checksum, message hash, and compact
signature format.
