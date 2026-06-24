import { describe, expect, test } from "bun:test"
import { hashMessage, parseSignature } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { canonicalizePayloadReceipt, verifyPayloadProviderSignature } from "./receipt"
import type {
  PayloadProviderMetadata,
  PayloadProviderReceipt,
  PayloadProviderSignature,
} from "./types"

describe("payload provider receipt verification", () => {
  test("verifies an EIP-191 provider signature", async () => {
    const account = privateKeyToAccount(
      "0x0000000000000000000000000000000000000000000000000000000000000001",
    )
    const receipt: PayloadProviderReceipt = {
      service: "atlas-payload-provider",
      action: "payloadReceived",
      payloadId: "a".repeat(64),
      namespace: "arkiv.entities",
      checksum: `sha256:${"b".repeat(64)}`,
      sizeBytes: 12,
      submittedAt: "2026-06-24T00:00:00Z",
    }
    const meta: PayloadProviderMetadata = {
      id: receipt.payloadId,
      namespace: receipt.namespace,
      contentType: "text/plain",
      sizeBytes: receipt.sizeBytes,
      checksum: receipt.checksum,
      submittedAt: receipt.submittedAt,
    }
    const messageBytes = new TextEncoder().encode(canonicalizePayloadReceipt(receipt))
    const packedSignature = await account.signMessage({ message: { raw: messageBytes } })
    const parsedSignature = parseSignature(packedSignature)
    const v =
      "v" in parsedSignature && parsedSignature.v !== undefined
        ? Number(parsedSignature.v)
        : parsedSignature.yParity + 27

    const signature: PayloadProviderSignature = {
      scheme: "eip191",
      signer: account.address,
      receipt,
      messageHash: hashMessage({ raw: messageBytes }),
      signature: packedSignature,
      r: parsedSignature.r,
      s: parsedSignature.s,
      v,
    }

    const result = await verifyPayloadProviderSignature(meta, signature)

    expect(result.valid).toBe(true)
    expect(result.recoveredAddress?.toLowerCase()).toBe(account.address.toLowerCase())
    expect(result.errors).toEqual([])
  })
})
