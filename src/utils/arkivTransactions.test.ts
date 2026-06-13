import { describe, expect, jest, test } from "bun:test"
import { type Hex, toHex } from "viem"
import type { ArkivClient } from "../clients/baseClient"
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
