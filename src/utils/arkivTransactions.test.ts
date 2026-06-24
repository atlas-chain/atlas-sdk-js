import { describe, expect, jest, test } from "bun:test"
import { type Hex, toHex } from "viem"
import type { ArkivClient } from "../clients/baseClient"
import {
  payloadProviderChecksum,
  payloadProviderPayloadId,
  setPayloadProviderConfig,
} from "../payloadProvider"
import { AttributeValueType } from "../types/attributes"
import { sendArkivTransaction } from "./arkivTransactions"

const ZERO_32 = `0x${"00".repeat(32)}` as Hex
const TX_HASH = `0x${"11".repeat(32)}` as Hex

describe("arkiv transaction encoding", () => {
  test("encodes numeric attributes as byte-aligned uint256 words", async () => {
    const client = createMockWalletClient()

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
          },
          payload: {
            id: expectedPayloadId,
            namespace: "arkiv.entities",
            contentType: "text/plain",
            sizeBytes: payload.length,
            checksum: expectedChecksum,
            submittedAt: "2026-06-24T00:00:00Z",
          },
        }),
        { status: 201 },
      )
    })

    setPayloadProviderConfig(client, {
      url: "https://payload.example",
      verifyReceipt: false,
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

    const [{ args }] = client.writeContract.mock.calls[0]
    const [operations] = args
    expect(operations[0].payload).toBe(toHex(payload))
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
