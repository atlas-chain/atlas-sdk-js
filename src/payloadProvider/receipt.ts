import { type Hex, hashMessage, recoverMessageAddress, sha256 } from "viem"
import type {
  PayloadProviderMetadata,
  PayloadProviderReceipt,
  PayloadProviderSignature,
  PayloadProviderVerificationResult,
} from "./types"

const textEncoder = new TextEncoder()

function utf8(value: string): Uint8Array {
  return textEncoder.encode(value)
}

function stripHexPrefix(value: string): string {
  return value.startsWith("0x") || value.startsWith("0X") ? value.slice(2) : value
}

function lowerHex(value: string): string {
  return value.toLowerCase()
}

export function payloadProviderPayloadId(namespace: string, payload: Uint8Array): string {
  const namespaceBytes = utf8(namespace)
  const input = new Uint8Array(namespaceBytes.length + 1 + payload.length)
  input.set(namespaceBytes, 0)
  input[namespaceBytes.length] = 0
  input.set(payload, namespaceBytes.length + 1)
  return stripHexPrefix(sha256(input))
}

export function payloadProviderChecksum(payload: Uint8Array): string {
  return `sha256:${stripHexPrefix(sha256(payload))}`
}

export function canonicalizePayloadReceipt(receipt: PayloadProviderReceipt): string {
  return JSON.stringify({
    service: receipt.service,
    action: receipt.action,
    payloadId: receipt.payloadId,
    namespace: receipt.namespace,
    checksum: receipt.checksum,
    sizeBytes: receipt.sizeBytes,
    submittedAt: receipt.submittedAt,
  })
}

export function receiptForPayloadMetadata(meta: PayloadProviderMetadata): PayloadProviderReceipt {
  return {
    service: "atlas-payload-provider",
    action: "payloadReceived",
    payloadId: meta.id,
    namespace: meta.namespace,
    checksum: meta.checksum,
    sizeBytes: meta.sizeBytes,
    submittedAt: meta.submittedAt,
  }
}

export function verifyPayloadMetadata(
  namespace: string,
  payload: Uint8Array,
  meta: PayloadProviderMetadata,
): string[] {
  const errors: string[] = []
  const expectedId = payloadProviderPayloadId(namespace, payload)
  const expectedChecksum = payloadProviderChecksum(payload)

  if (meta.namespace !== namespace) {
    errors.push(
      `payload namespace ${meta.namespace} does not match requested namespace ${namespace}`,
    )
  }
  if (meta.id !== expectedId) {
    errors.push(`payload id ${meta.id} does not match computed id ${expectedId}`)
  }
  if (meta.checksum !== expectedChecksum) {
    errors.push(
      `payload checksum ${meta.checksum} does not match computed checksum ${expectedChecksum}`,
    )
  }
  if (meta.sizeBytes !== payload.length) {
    errors.push(`payload size ${meta.sizeBytes} does not match ${payload.length} bytes`)
  }

  return errors
}

export async function verifyPayloadProviderSignature(
  meta: PayloadProviderMetadata,
  signature: PayloadProviderSignature,
): Promise<PayloadProviderVerificationResult> {
  const errors: string[] = []
  let recoveredAddress: Hex | undefined

  if (signature.scheme !== "eip191") {
    errors.push(`unsupported signature scheme ${signature.scheme}`)
  }

  const message = canonicalizePayloadReceipt(signature.receipt)
  const messageBytes = utf8(message)
  const messageHash = hashMessage({ raw: messageBytes })

  if (lowerHex(messageHash) !== lowerHex(signature.messageHash)) {
    errors.push("signature messageHash does not match the canonical receipt")
  }

  const currentReceipt = receiptForPayloadMetadata(meta)
  const legacyReceipt: PayloadProviderReceipt = { ...currentReceipt, action: "hostPayload" }
  const receiptMatches =
    canonicalizePayloadReceipt(signature.receipt) === canonicalizePayloadReceipt(currentReceipt) ||
    canonicalizePayloadReceipt(signature.receipt) === canonicalizePayloadReceipt(legacyReceipt)

  if (!receiptMatches) {
    errors.push("signature receipt does not match payload metadata")
  }

  const packedSignature = stripHexPrefix(signature.signature)
  const expectedPackedSignature = `${stripHexPrefix(signature.r)}${stripHexPrefix(signature.s)}${signature.v
    .toString(16)
    .padStart(2, "0")}`

  if (packedSignature.length !== 130) {
    errors.push("signature must be 65 bytes")
  } else if (lowerHex(packedSignature) !== lowerHex(expectedPackedSignature)) {
    errors.push("signature, r, s, and v fields are inconsistent")
  }

  try {
    if (signature.v !== 27 && signature.v !== 28) {
      throw new Error(`signature v must be 27 or 28, got ${signature.v}`)
    }

    recoveredAddress = await recoverMessageAddress({
      message: { raw: messageBytes },
      signature: signature.signature,
    })

    if (lowerHex(recoveredAddress) !== lowerHex(signature.signer)) {
      errors.push(
        `recovered address ${recoveredAddress} does not match claimed signer ${signature.signer}`,
      )
    }
  } catch (error) {
    errors.push(`signature recovery failed: ${(error as Error).message}`)
  }

  return {
    valid: errors.length === 0,
    recoveredAddress,
    claimedSigner: signature.signer,
    messageHash,
    errors,
  }
}
