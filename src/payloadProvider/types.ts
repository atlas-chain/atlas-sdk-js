import type { Hex } from "viem"
import type { Attribute } from "../types/attributes"
import type { MimeType } from "../types/mimeTypes"

export type PayloadProviderConfig = {
  url: string
  bearerKey?: string
  namespace?: string
  verifyReceipt?: boolean
  fetch?: typeof fetch
}

export type PayloadProviderReceipt = {
  service: string
  action: string
  payloadId: string
  namespace: string
  checksum: string
  sizeBytes: number
  submittedAt: string
  nonce?: Hex
  /** Optional signed provider payment gas units. */
  payment?: number
}

export type PayloadProviderSignature = {
  scheme: string
  signer: Hex
  receipt: PayloadProviderReceipt
  messageHash: Hex
  signature: Hex
  r: Hex
  s: Hex
  v: number
}

export type PayloadProviderMetadata = {
  id: string
  namespace: string
  contentType?: MimeType | string
  sizeBytes: number
  checksum: string
  submittedAt: string
  signature?: PayloadProviderSignature
}

export type PayloadProviderArkivContext = {
  namespace: string
  contentType?: MimeType | string
  payloadEncoding: "base64" | "canonicalJson"
  attributes: Attribute[]
  expiresIn?: number
  entityKey?: Hex
  nonce?: Hex
  /** Optional signed provider payment gas units. */
  payment?: number
}

export type SubmitArkivPayloadInput = {
  namespace: string
  payload: Uint8Array
  contentType: MimeType | string
  attributes: Attribute[]
  expiresIn: number
  entityKey: Hex
  nonce?: Hex
  /** Optional signed provider payment gas units. */
  payment?: number
}

export type SubmitArkivPayloadResponse = {
  ok: true
  created: boolean
  arkiv: PayloadProviderArkivContext
  payload: PayloadProviderMetadata
}

export type PayloadProviderVerificationResult = {
  valid: boolean
  recoveredAddress: Hex | undefined
  claimedSigner: Hex | undefined
  messageHash: Hex | undefined
  errors: string[]
}

export type PayloadProviderVerificationContext = {
  nonce?: Hex
  /** Optional signed provider payment gas units. */
  payment?: number
}

export type PayloadReference = {
  kind: "atlas.payloadReference"
  version: 1
  provider: "atlas-payload-provider"
  id: string
  namespace: string
  contentType?: MimeType | string
  checksum: string
  sizeBytes: number
  submittedAt: string
  nonce: Hex
  /** Signed provider payment gas units. */
  payment: number
  signature: PayloadProviderSignature
}

export type PayloadReferenceSummary = {
  provider: "atlas-payload-provider" | string
  id: string
  namespace: string
  contentType?: MimeType | string
  checksum: string
  sizeBytes: number
  submittedAt?: string
}

export type PayloadProviderOperation = "create" | "update"

export type PayloadProviderSubmission = {
  operation: PayloadProviderOperation
  entityKey: Hex
  providerUrl: string
  created: boolean
  arkiv: PayloadProviderArkivContext
  payload: PayloadProviderMetadata
  nonce: Hex
  /** Signed provider payment gas units. */
  payment: number
  reference?: PayloadReference
  verification?: PayloadProviderVerificationResult
}
