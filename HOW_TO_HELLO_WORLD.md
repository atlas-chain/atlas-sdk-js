# How to build an Atlas "upload + download an image" hello-world

A step-by-step guide to storing a file on the [Atlas](https://atlas.arkiv-global.net/) network (an experimental [Arkiv](https://arkiv.network) data layer) and reading it back, using the official [`@atlas-chain/sdk`](https://github.com/atlas-chain/atlas-sdk-js).

If you just want it to work, copy [The whole thing in one file](#the-whole-thing-in-one-file) and jump to [Run it](#run-it). The sections before that exist to save you the hours of confusion they cost the first time.

---

## Read this first — 4 things that will trip you up

These aren't obvious from the SDK README, and each one looks like a different bug:

1. **Use `@atlas-chain/sdk`, not `@arkiv-network/sdk`.** They look almost identical and both have an `atlas`-ish chain. But the generic Arkiv SDK reads the new entity's key from a transaction **event log**, and **Atlas emits no logs** — so `createEntity` crashes with `Cannot read properties of undefined (reading 'topics')` *after the transaction already succeeded*. The Atlas SDK derives the key deterministically instead.

2. **The RPC URL bundled in the SDK is stale.** `@atlas-chain/sdk`'s `atlas` chain points at `https://atlas.arkiv-global.net/`, which now serves the HTML welcome page and answers JSON-RPC with **`405 Not Allowed`**. The live RPC is **`https://rpc.atlas.arkiv-global.net/`** — override the transport URL yourself.

3. **Atlas stores payload bytes off-chain.** Your image does **not** go on-chain. It's uploaded to a *payload provider* that returns an EIP-191 signed receipt; only that signed *reference* is written on-chain. Consequences:
   - You **must** configure a `payloadProvider` on the client, or `createEntity` throws `Payload provider is required for create and update operations`.
   - To read bytes back you need `getEntity(key, { hydratePayload: true })` — a plain read only gives you the reference.

4. **Uploads need an ingress bearer key; downloads don't.** The provider's upload endpoint is bearer-protected (`POST /arkiv/payloads` → `401 missing or malformed Authorization header`). The current public sandbox key is **`atlas-signer-pub-token`** — pass it as `bearerKey`. Reads (`GET /payloads/{id}/raw`) are open and need no key.

---

## The endpoints

| | |
|---|---|
| Chain id | `42069` |
| RPC | `https://rpc.atlas.arkiv-global.net/` |
| Faucet | `https://faucet.atlas.arkiv-global.net/` (browser proof-of-work) |
| Payload provider | `https://payload.atlas.arkiv-global.net` (reads public, uploads bearer-protected) |
| Scanner | `https://scanner.atlas.arkiv-global.net/` |

---

## Prerequisites

- **Node.js 20+** (this guide uses plain ESM JavaScript — no TypeScript toolchain needed).
- **An ingress bearer key** for the payload provider (for uploads). Current public sandbox key: `atlas-signer-pub-token`.
- A few minutes to fund a test account.

---

## Step 1 — Project setup

```bash
mkdir atlas-hello && cd atlas-hello
npm init -y
npm pkg set type=module
npm install @atlas-chain/sdk
```

## Step 2 — Get a funded account

You need an Ethereum-style key with a little test `GLM` to pay gas for the on-chain write.

```bash
# generate a key + address (one-off)
node -e "import('@atlas-chain/sdk/accounts').then(a=>{const k=a.generatePrivateKey();console.log('KEY ',k);console.log('ADDR',a.privateKeyToAccount(k).address)})"
```

Save the `KEY`, then fund the `ADDR`:
- open `https://faucet.atlas.arkiv-global.net/`, paste the address, solve the short proof-of-work, request funds.
- (The faucet's proof-of-work can also be solved headlessly from Node if you'd rather not open the browser.)

## Step 3 — Configure the client (the important part)

Two non-defaults: override the **RPC URL**, and pass a **`payloadProvider`** block.

```js
import { createWalletClient, http } from "@atlas-chain/sdk"
import { privateKeyToAccount } from "@atlas-chain/sdk/accounts"
import { atlas } from "@atlas-chain/sdk/chains"

const client = createWalletClient({
  chain: atlas,
  transport: http("https://rpc.atlas.arkiv-global.net/"), // <-- override the stale bundled URL
  account: privateKeyToAccount(process.env.ATLAS_PRIVATE_KEY),
  payloadProvider: {                                       // <-- required for create/update
    url: "https://payload.atlas.arkiv-global.net",
    namespace: "arkiv.entities",
    bearerKey: process.env.ATLAS_PAYLOAD_BEARER_KEY,       // <-- needed for uploads
  },
})
```

## Step 4 — Upload

The image bytes are a raw `Uint8Array`. No base64, no JSON wrapping — just hand `createEntity` the bytes and a MIME `contentType`.

```js
import { readFileSync } from "node:fs"
import { ExpirationTime } from "@atlas-chain/sdk/utils"

const imageBytes = new Uint8Array(readFileSync("./pic.png"))

const { entityKey, txHash } = await client.createEntity({
  payload: imageBytes,
  contentType: "image/png", // image/jpeg | image/webp | image/gif | image/svg+xml ...
  attributes: [{ key: "app", value: "atlas-hello" }], // optional, queryable metadata
  expiresIn: ExpirationTime.fromDays(1),
})
// `entityKey` is derived locally and returned immediately — no log parsing.
```

## Step 5 — Download

Reading needs `hydratePayload: true` so the SDK fetches the actual bytes from the provider (and checksum-verifies them) instead of just returning the on-chain reference.

```js
import { writeFileSync } from "node:fs"

const entity = await client.getEntity(entityKey, { hydratePayload: true })
writeFileSync("./downloaded.png", entity.payload) // entity.payload is a Uint8Array
```

> Reading is public, so a `createPublicClient({ chain, transport, payloadProvider: { url } })` (no `bearerKey`) is enough to download.

---

## The whole thing in one file

Save as `hello.mjs`, then `node hello.mjs ./pic.png`:

```js
import { readFileSync, writeFileSync } from "node:fs"
import { createHash } from "node:crypto"
import { createWalletClient, http, formatEther } from "@atlas-chain/sdk"
import { privateKeyToAccount } from "@atlas-chain/sdk/accounts"
import { atlas } from "@atlas-chain/sdk/chains"
import { ExpirationTime } from "@atlas-chain/sdk/utils"

const RPC = "https://rpc.atlas.arkiv-global.net/"
const sha = (b) => createHash("sha256").update(b).digest("hex")

const client = createWalletClient({
  chain: atlas,
  transport: http(RPC),
  account: privateKeyToAccount(process.env.ATLAS_PRIVATE_KEY),
  payloadProvider: {
    url: "https://payload.atlas.arkiv-global.net",
    namespace: "arkiv.entities",
    bearerKey: process.env.ATLAS_PAYLOAD_BEARER_KEY,
  },
})

const path = process.argv[2] ?? "./pic.png"
const bytes = new Uint8Array(readFileSync(path))
console.log("connected, chainId", await client.getChainId())
console.log("balance", formatEther(await client.getBalance({ address: client.account.address })), "GLM")

// upload
const { entityKey, txHash } = await client.createEntity({
  payload: bytes,
  contentType: "image/png",
  attributes: [{ key: "app", value: "atlas-hello" }],
  expiresIn: ExpirationTime.fromDays(1),
})
console.log("uploaded:", entityKey, txHash)

// download
const entity = await client.getEntity(entityKey, { hydratePayload: true })
writeFileSync("./downloaded.png", entity.payload)

// verify
console.log(sha(bytes) === sha(entity.payload) ? "✅ round-trip identical" : "❌ mismatch")
```

## Run it

```bash
# PowerShell
$env:ATLAS_PRIVATE_KEY="0x...your funded key..."
$env:ATLAS_PAYLOAD_BEARER_KEY="atlas-signer-pub-token"
node hello.mjs ./pic.png
```

```bash
# bash
export ATLAS_PRIVATE_KEY=0x...your funded key...
export ATLAS_PAYLOAD_BEARER_KEY=atlas-signer-pub-token
node hello.mjs ./pic.png
```

Expected tail: `✅ round-trip identical`.

---

## Troubleshooting (symptom → cause → fix)

| You see | Cause | Fix |
|---|---|---|
| `Cannot read properties of undefined (reading 'topics')` | Using `@arkiv-network/sdk` (reads key from a log Atlas never emits) | Switch to `@atlas-chain/sdk` |
| `405 Not Allowed` / HTML from the RPC | Hitting the stale bundled URL `atlas.arkiv-global.net` | Use `http("https://rpc.atlas.arkiv-global.net/")` |
| `Payload provider is required for create and update operations` | No `payloadProvider` on the client | Add the `payloadProvider` block (step 3) |
| `401 missing or malformed Authorization header` | Upload with no/invalid ingress key | Set a valid `bearerKey` / `ATLAS_PAYLOAD_BEARER_KEY` |
| Transaction reverts with `PayloadReferenceRequired` | Trying to send raw/inline payload bytes on-chain | Don't — let the SDK use the payload provider |
| `entity.payload` is `undefined` after a read | Forgot to hydrate | `getEntity(key, { hydratePayload: true })` |
| `Insufficient funds` / revert on create | Account has no `GLM` for gas | Fund the address via the faucet |
| `AttributesNotSorted` | Attribute keys not in ascending order | Sort attributes by `key`; names must be lowercase `a-z0-9_-.` |

## Notes & limits

- **Max payload:** 1 MiB per object (provider `/status` → `maxPayloadBytes`).
- **Attribute names** must be lowercase `Ident32` (`a–z` start, then `a–z 0–9 _ - .`), ≤ 32 bytes, and **sorted ascending**. CamelCase is fine *inside* a JSON payload, just not as an attribute key.
- **Determinism:** the entity key is `keccak256(chainId, registryAddress, owner, ownerNonce)`. Each create increments the owner nonce, so re-uploading the same image yields a new `entityKey` and `txHash` but the same content-addressed provider `payload id`.
- **Check liveness:** `GET https://payload.atlas.arkiv-global.net/status` shows `ingressProtected`, the signer address, and the newest payloads; `GET https://rpc.atlas.arkiv-global.net/` answers standard JSON-RPC (`eth_chainId` → `0xa455`).
- For the canonical minimal read/write snippets, see the [`sample/`](sample) directory.
