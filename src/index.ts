/**
 * @module main
 */

// Re-export all viem stuff
export * from "viem"

// export main arkiv stuff
export type { ArkivClient } from "./clients/baseClient"
export type { PublicArkivClient, PublicArkivClientConfig } from "./clients/createPublicClient"
export { createPublicClient } from "./clients/createPublicClient"
export type { WalletArkivClient, WalletArkivClientConfig } from "./clients/createWalletClient"
export { createWalletClient } from "./clients/createWalletClient"
export type { PublicArkivActions } from "./clients/decorators/arkivPublic"
export type { WalletArkivActions } from "./clients/decorators/arkivWallet"
// re-export errors
export * from "./errors"
export * from "./payloadProvider"
// re-export arkiv types in main index file
export * from "./types"
// re-export chosen utils
export { chainFromName } from "./utils/chains"
export type { HydratePayloadOptions } from "./utils/entities"
export { jsonToPayload, stringToPayload } from "./utils/payload"
