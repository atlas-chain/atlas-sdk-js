import type {
  PayloadProviderConfig,
  SubmitArkivPayloadInput,
  SubmitArkivPayloadResponse,
} from "./types"

type BufferLike = {
  from(input: Uint8Array): { toString(encoding: "base64"): string }
}

type GlobalWithBuffer = typeof globalThis & {
  Buffer?: BufferLike
}

export class PayloadProviderClient {
  private readonly baseUrl: string
  private readonly bearerKey: string | undefined
  private readonly fetchImpl: typeof fetch

  constructor(config: Pick<PayloadProviderConfig, "url" | "bearerKey" | "fetch">) {
    const baseUrl = config.url.trim().replace(/\/+$/, "")
    if (!baseUrl) {
      throw new Error("payloadProvider.url must not be empty")
    }

    const fetchImpl = config.fetch ?? globalThis.fetch
    if (typeof fetchImpl !== "function") {
      throw new Error("payload provider integration requires a fetch implementation")
    }

    this.baseUrl = baseUrl
    this.bearerKey = config.bearerKey
    this.fetchImpl = fetchImpl
  }

  get url(): string {
    return this.baseUrl
  }

  async submitArkivPayload(input: SubmitArkivPayloadInput): Promise<SubmitArkivPayloadResponse> {
    const body: Record<string, unknown> = {
      namespace: input.namespace,
      payloadBase64: bytesToBase64(input.payload),
      contentType: input.contentType,
      attributes: input.attributes,
      expiresIn: input.expiresIn,
      entityKey: input.entityKey,
    }
    if (input.nonce) body.nonce = input.nonce
    if (input.payment !== undefined) body.payment = input.payment

    const response = await this.fetchImpl(`${this.baseUrl}/arkiv/payloads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.authHeaders(),
      },
      body: JSON.stringify(body),
    })

    return (await this.parse(response)) as SubmitArkivPayloadResponse
  }

  private authHeaders(): Record<string, string> {
    return this.bearerKey ? { Authorization: `Bearer ${this.bearerKey}` } : {}
  }

  private async parse(response: Response): Promise<unknown> {
    const text = await response.text()
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}: ${text}`)
    }
    if (!text) return null

    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }
}

export function bytesToBase64(bytes: Uint8Array): string {
  const buffer = (globalThis as GlobalWithBuffer).Buffer
  if (buffer) return buffer.from(bytes).toString("base64")

  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}
