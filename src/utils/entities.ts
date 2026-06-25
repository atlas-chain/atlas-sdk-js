import { toBytes } from "viem"
import type { ArkivClient } from "../clients/baseClient"
import {
  getPayloadProviderConfig,
  PayloadProviderClient,
  type PayloadProviderConfig,
  payloadProviderChecksum,
  payloadProviderPayloadId,
} from "../payloadProvider"
import { Entity } from "../types/entity"
import type { RpcEntity } from "../types/rpcSchema"
import { getLogger } from "./logger"

const logger = getLogger("utils:entities")

export async function entityFromRpcResult(rpcEntity: RpcEntity) {
  logger("entityFromRpcResult %o", rpcEntity)

  return new Entity(
    rpcEntity.key,
    rpcEntity.contentType,
    rpcEntity.owner,
    rpcEntity.creator,
    rpcEntity.expiresAt !== undefined ? BigInt(rpcEntity.expiresAt) : undefined,
    rpcEntity.createdAtBlock !== undefined ? BigInt(rpcEntity.createdAtBlock) : undefined,
    rpcEntity.lastModifiedAtBlock !== undefined ? BigInt(rpcEntity.lastModifiedAtBlock) : undefined,
    rpcEntity.transactionIndexInBlock !== undefined
      ? BigInt(rpcEntity.transactionIndexInBlock)
      : undefined,
    rpcEntity.operationIndexInTransaction !== undefined
      ? BigInt(rpcEntity.operationIndexInTransaction)
      : undefined,
    rpcEntity.value !== undefined ? toBytes(rpcEntity.value) : undefined,
    [
      ...(rpcEntity.stringAttributes ?? []).map(({ key, value }) => ({
        key,
        value,
      })),
      ...(rpcEntity.numericAttributes ?? []).map(({ key, value }) => ({
        key,
        value: Number(value),
      })),
    ],
    rpcEntity.payloadRef,
  )
}

export type HydratePayloadOptions = {
  payloadProvider?: Pick<PayloadProviderConfig, "url" | "bearerKey" | "fetch">
  concurrency?: number
}

export async function hydrateEntityPayloads(
  client: ArkivClient,
  entities: Entity[],
  options: HydratePayloadOptions = {},
): Promise<Entity[]> {
  if (!entities.some((entity) => entity.payloadRef)) return entities

  const config = options.payloadProvider ?? getPayloadProviderConfig(client)
  if (!config) {
    throw new Error("Payload provider is required to hydrate payloads")
  }

  const provider = new PayloadProviderClient(config)
  const concurrency = normalizeConcurrency(options.concurrency)

  await mapConcurrent(entities, concurrency, async (entity) => {
    if (!entity.payloadRef) return

    const payload = await provider.getRawPayload(entity.payloadRef.id)
    const checksum = payloadProviderChecksum(payload)
    if (checksum !== entity.payloadRef.checksum) {
      throw new Error(
        `Payload checksum mismatch for ${entity.key}: expected ${entity.payloadRef.checksum}, got ${checksum}`,
      )
    }

    const id = payloadProviderPayloadId(entity.payloadRef.namespace, payload)
    if (id !== entity.payloadRef.id) {
      throw new Error(
        `Payload id mismatch for ${entity.key}: expected ${entity.payloadRef.id}, got ${id}`,
      )
    }

    entity.payload = payload
  })

  return entities
}

function normalizeConcurrency(value: number | undefined): number {
  if (value === undefined) return 5
  if (!Number.isInteger(value) || value < 1) {
    throw new Error("payload hydration concurrency must be a positive integer")
  }
  return Math.min(value, 32)
}

async function mapConcurrent<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0
  const workerCount = Math.min(concurrency, items.length)
  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (next < items.length) {
        const index = next++
        await fn(items[index])
      }
    }),
  )
}
