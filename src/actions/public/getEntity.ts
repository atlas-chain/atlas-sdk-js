import { bytesToHex, type Hex, hexToBytes } from "viem"
import type { ArkivClient } from "../../clients/baseClient"
import { NoEntityFoundError } from "../../errors"
import {
  entityFromRpcResult,
  type HydratePayloadOptions,
  hydrateEntityPayloads,
} from "../../utils/entities"

export type GetEntityOptions = {
  hydratePayload?: boolean
  payloadProvider?: HydratePayloadOptions["payloadProvider"]
}

export async function getEntity(client: ArkivClient, key: Hex, options: GetEntityOptions = {}) {
  // Normalize the key into bytes
  let bytes: Uint8Array
  try {
    bytes = hexToBytes(key)
  } catch {
    throw new Error(`Invalid key format: ${key}. Key must be a valid hex string.`)
  }

  if (bytes.length !== 32) {
    throw new Error(
      `Invalid key length: ${bytes.length} bytes. Key must be 32 bytes (64 hex characters) long.`,
    )
  }

  const hexKey = bytesToHex(bytes)

  const result = await client.request({
    method: "arkiv_query",
    params: [
      `$key = ${hexKey}`,
      {
        includeData: {
          key: true,
          attributes: true,
          payloadReference: true,
          contentType: true,
          expiration: true,
          owner: true,
          creator: true,
          createdAtBlock: true,
          lastModifiedAtBlock: true,
          transactionIndexInBlock: true,
          operationIndexInTransaction: true,
        },
      },
    ],
  })

  if (!result.data.length) {
    throw new NoEntityFoundError()
  }

  const entity = await entityFromRpcResult(result.data[0])
  if (options.hydratePayload) {
    await hydrateEntityPayloads(client, [entity], {
      ...(options.payloadProvider && { payloadProvider: options.payloadProvider }),
    })
  }
  return entity
}
