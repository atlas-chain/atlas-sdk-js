import type { PayloadProviderConfig } from "./types"

export const DEFAULT_PAYLOAD_PROVIDER_NAMESPACE = "arkiv.entities"

export type NormalizedPayloadProviderConfig = {
  url: string
  namespace: string
  verifyReceipt: boolean
  bearerKey?: string
  fetch?: typeof fetch
}

const payloadProviderConfigs = new WeakMap<object, NormalizedPayloadProviderConfig>()

export function setPayloadProviderConfig(
  client: object,
  config: PayloadProviderConfig | false | undefined,
) {
  if (!config) {
    payloadProviderConfigs.delete(client)
    return
  }

  payloadProviderConfigs.set(client, normalizePayloadProviderConfig(config))
}

export function getPayloadProviderConfig(
  client: object,
): NormalizedPayloadProviderConfig | undefined {
  return payloadProviderConfigs.get(client)
}

function normalizePayloadProviderConfig(
  config: PayloadProviderConfig,
): NormalizedPayloadProviderConfig {
  const url = config.url.trim().replace(/\/+$/, "")
  if (!url) {
    throw new Error("payloadProvider.url must not be empty")
  }

  const normalized: NormalizedPayloadProviderConfig = {
    url,
    namespace: config.namespace?.trim() || DEFAULT_PAYLOAD_PROVIDER_NAMESPACE,
    verifyReceipt: config.verifyReceipt ?? true,
  }

  if (config.bearerKey !== undefined) normalized.bearerKey = config.bearerKey
  if (config.fetch !== undefined) normalized.fetch = config.fetch

  return normalized
}
