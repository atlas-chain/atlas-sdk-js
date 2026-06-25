import { describe, expect, jest, test } from "bun:test"
import { type Hex, hashMessage, parseSignature, toHex } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import type { ArkivClient } from "../clients/baseClient"
import {
  canonicalizePayloadReceipt,
  payloadProviderChecksum,
  payloadProviderPayloadId,
  setPayloadProviderConfig,
} from "../payloadProvider"
import { AttributeValueType } from "../types/attributes"
import {
  PAYLOAD_REFERENCE_CONTENT_TYPE,
  PAYLOAD_REFERENCE_PAYMENT,
  sendArkivTransaction,
} from "./arkivTransactions"

const ZERO_32 = `0x${"00".repeat(32)}` as Hex
const TX_HASH = `0x${"11".repeat(32)}` as Hex
const PROVIDER_PRIVATE_KEY =
  "0x0000000000000000000000000000000000000000000000000000000000000001" as const

describe("arkiv transaction encoding", () => {
  test("encodes numeric attributes as byte-aligned uint256 words", async () => {
    const client = createMockWalletClient()
    setSignedPayloadProvider(client, new Uint8Array(), "application/octet-stream")

    await sendArkivTransaction(client, {
      creates: [
        {
          payload: new Uint8Array(),
          contentType: "application/octet-stream",
          expiresIn: 120,
          attributes: [
            { key: "tiny", value: 10 },
            { key: "wide", value: 4095 },
            { key: "zero", value: 0 },
          ],
        },
      ],
    })

    const [{ args }] = client.writeContract.mock.calls[0]
    const [operations] = args
    const attributes = operations[0].attributes

    expect(attributes).toContainEqual({
      name: toHex("tiny", { size: 32 }),
      valueType: AttributeValueType.Uint,
      value: [toHex(10n, { size: 32 }), ZERO_32, ZERO_32, ZERO_32],
    })
    expect(attributes).toContainEqual({
      name: toHex("wide", { size: 32 }),
      valueType: AttributeValueType.Uint,
      value: [toHex(4095n, { size: 32 }), ZERO_32, ZERO_32, ZERO_32],
    })
    expect(attributes).toContainEqual({
      name: toHex("zero", { size: 32 }),
      valueType: AttributeValueType.Uint,
      value: [toHex(0n, { size: 32 }), ZERO_32, ZERO_32, ZERO_32],
    })
  })

  test("uploads create payload to configured provider before sending transaction", async () => {
    const client = createMockWalletClient()
    const calls: string[] = []
    const payload = new TextEncoder().encode("hello provider")
    const expectedPayloadId = payloadProviderPayloadId("arkiv.entities", payload)
    const expectedChecksum = payloadProviderChecksum(payload)

    client.writeContract.mockImplementation(async () => {
      calls.push("write")
      return TX_HASH
    })

    const fetchMock = jest.fn(async (_url: string, init?: RequestInit) => {
      calls.push("provider")
      const body = JSON.parse(init?.body as string)
      expect(body.nonce).toMatch(/^0x[0-9a-f]{64}$/)
      expect(body.payment).toBe(PAYLOAD_REFERENCE_PAYMENT)

      const submittedAt = "2026-06-24T00:00:00Z"
      const receipt = {
        service: "atlas-payload-provider",
        action: "payloadReceived",
        payloadId: expectedPayloadId,
        namespace: "arkiv.entities",
        checksum: expectedChecksum,
        sizeBytes: payload.length,
        submittedAt,
        nonce: body.nonce,
        payment: body.payment,
      }
      const signature = await signReceipt(receipt)

      return payloadProviderResponse({
        body,
        payload,
        contentType: "text/plain",
        submittedAt,
        signature,
      })
    })

    setPayloadProviderConfig(client, {
      url: "https://payload.example",
      fetch: fetchMock as unknown as typeof fetch,
    })

    const result = await sendArkivTransaction(client, {
      creates: [
        {
          payload,
          contentType: "text/plain",
          expiresIn: 120,
          attributes: [],
        },
      ],
    })

    expect(calls).toEqual(["provider", "write"])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(result.payloadReceipts).toHaveLength(1)
    expect(result.payloadReceipts[0].payload.id).toBe(expectedPayloadId)
    expect(result.payloadReceipts[0].operation).toBe("create")
    expect(result.payloadReceipts[0].payment).toBe(PAYLOAD_REFERENCE_PAYMENT)

    const [{ args }] = client.writeContract.mock.calls[0]
    const [operations] = args
    expect(decodeMime128(operations[0].contentType.data)).toBe(PAYLOAD_REFERENCE_CONTENT_TYPE)
    expect(JSON.parse(hexToUtf8(operations[0].payload)).id).toBe(expectedPayloadId)
  })

  test("uses signed payload reference as the transaction payload by default", async () => {
    const client = createMockWalletClient()
    const payload = new TextEncoder().encode("hello reference")
    const expectedPayloadId = payloadProviderPayloadId("arkiv.entities", payload)
    const expectedChecksum = payloadProviderChecksum(payload)

    const fetchMock = jest.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(init?.body as string)
      const submittedAt = "2026-06-24T00:00:00Z"
      const receipt = {
        service: "atlas-payload-provider",
        action: "payloadReceived",
        payloadId: expectedPayloadId,
        namespace: "arkiv.entities",
        checksum: expectedChecksum,
        sizeBytes: payload.length,
        submittedAt,
        nonce: body.nonce,
        payment: body.payment,
      }
      const signature = await signReceipt(receipt)

      return new Response(
        JSON.stringify({
          ok: true,
          created: true,
          arkiv: {
            namespace: "arkiv.entities",
            contentType: "text/plain",
            payloadEncoding: "base64",
            attributes: [],
            expiresIn: 120,
            entityKey: body.entityKey,
            nonce: body.nonce,
            payment: body.payment,
          },
          payload: {
            id: expectedPayloadId,
            namespace: "arkiv.entities",
            contentType: "text/plain",
            sizeBytes: payload.length,
            checksum: expectedChecksum,
            submittedAt,
            signature,
          },
        }),
        { status: 201 },
      )
    })

    setPayloadProviderConfig(client, {
      url: "https://payload.example",
      fetch: fetchMock as unknown as typeof fetch,
    })

    const result = await sendArkivTransaction(client, {
      creates: [
        {
          payload,
          contentType: "text/plain",
          expiresIn: 120,
          attributes: [],
        },
      ],
    })

    const [{ args }] = client.writeContract.mock.calls[0]
    const [operations] = args
    const reference = JSON.parse(hexToUtf8(operations[0].payload))

    expect(decodeMime128(operations[0].contentType.data)).toBe(PAYLOAD_REFERENCE_CONTENT_TYPE)
    expect(reference.kind).toBe("atlas.payloadReference")
    expect(reference.id).toBe(expectedPayloadId)
    expect(reference.nonce).toBe(result.payloadReceipts[0].nonce)
    expect(reference.payment).toBe(PAYLOAD_REFERENCE_PAYMENT)
    expect(reference.signature.receipt.nonce).toBe(reference.nonce)
    expect(reference.signature.receipt.payment).toBe(PAYLOAD_REFERENCE_PAYMENT)
    expect(result.payloadReceipts[0].reference).toEqual(reference)
  })

  test("does not send transaction when provider upload fails", async () => {
    const client = createMockWalletClient()
    const fetchMock = jest.fn(async () => new Response("nope", { status: 500 }))

    setPayloadProviderConfig(client, {
      url: "https://payload.example",
      verifyReceipt: false,
      fetch: fetchMock as unknown as typeof fetch,
    })

    await expect(
      sendArkivTransaction(client, {
        creates: [
          {
            payload: new TextEncoder().encode("will not be sent"),
            contentType: "text/plain",
            expiresIn: 120,
            attributes: [],
          },
        ],
      }),
    ).rejects.toThrow("500")

    expect(client.writeContract).not.toHaveBeenCalled()
  })
})

async function signReceipt(receipt: {
  service: string
  action: string
  payloadId: string
  namespace: string
  checksum: string
  sizeBytes: number
  submittedAt: string
  nonce?: Hex
  payment?: number
}) {
  const account = privateKeyToAccount(PROVIDER_PRIVATE_KEY)
  const messageBytes = new TextEncoder().encode(canonicalizePayloadReceipt(receipt))
  const packedSignature = await account.signMessage({ message: { raw: messageBytes } })
  const parsedSignature = parseSignature(packedSignature)
  const v =
    "v" in parsedSignature && parsedSignature.v !== undefined
      ? Number(parsedSignature.v)
      : parsedSignature.yParity + 27

  return {
    scheme: "eip191",
    signer: account.address,
    receipt,
    messageHash: hashMessage({ raw: messageBytes }),
    signature: packedSignature,
    r: parsedSignature.r,
    s: parsedSignature.s,
    v,
  }
}

function setSignedPayloadProvider(client: ArkivClient, payload: Uint8Array, contentType: string) {
  const fetchMock = jest.fn(async (_url: string, init?: RequestInit) => {
    const body = JSON.parse(init?.body as string)
    const submittedAt = "2026-06-24T00:00:00Z"
    const receipt = {
      service: "atlas-payload-provider",
      action: "payloadReceived",
      payloadId: payloadProviderPayloadId("arkiv.entities", payload),
      namespace: "arkiv.entities",
      checksum: payloadProviderChecksum(payload),
      sizeBytes: payload.length,
      submittedAt,
      nonce: body.nonce,
      payment: body.payment,
    }
    const signature = await signReceipt(receipt)
    return payloadProviderResponse({ body, payload, contentType, submittedAt, signature })
  })

  setPayloadProviderConfig(client, {
    url: "https://payload.example",
    fetch: fetchMock as unknown as typeof fetch,
  })
}

function payloadProviderResponse({
  body,
  payload,
  contentType,
  submittedAt,
  signature,
}: {
  body: { entityKey: Hex; nonce: Hex; payment: number }
  payload: Uint8Array
  contentType: string
  submittedAt: string
  signature: Awaited<ReturnType<typeof signReceipt>>
}) {
  return new Response(
    JSON.stringify({
      ok: true,
      created: true,
      arkiv: {
        namespace: "arkiv.entities",
        contentType,
        payloadEncoding: "base64",
        attributes: [],
        expiresIn: 120,
        entityKey: body.entityKey,
        nonce: body.nonce,
        payment: body.payment,
      },
      payload: {
        id: payloadProviderPayloadId("arkiv.entities", payload),
        namespace: "arkiv.entities",
        contentType,
        sizeBytes: payload.length,
        checksum: payloadProviderChecksum(payload),
        submittedAt,
        signature,
      },
    }),
    { status: 201 },
  )
}

function hexToUtf8(value: Hex): string {
  const hex = value.slice(2)
  const bytes = new Uint8Array(hex.length / 2)
  for (let index = 0; index < bytes.length; index++) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16)
  }
  return new TextDecoder().decode(bytes)
}

function decodeMime128(words: readonly Hex[]): string {
  const hex = words.map((word) => word.slice(2)).join("")
  const bytes = new Uint8Array(hex.length / 2)
  for (let index = 0; index < bytes.length; index++) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16)
  }
  let end = bytes.length
  while (end > 0 && bytes[end - 1] === 0) end--
  return new TextDecoder().decode(bytes.slice(0, end))
}

function createMockWalletClient() {
  return {
    account: {
      address: "0x0000000000000000000000000000000000000001",
    },
    chain: {
      id: 31337,
    },
    readContract: jest.fn().mockResolvedValue(0n),
    writeContract: jest.fn().mockResolvedValue(TX_HASH),
    waitForTransactionReceipt: jest.fn().mockResolvedValue({
      status: "success",
      transactionHash: TX_HASH,
    }),
  } as unknown as ArkivClient & {
    writeContract: ReturnType<typeof jest.fn>
  }
}
