import type {
  Account,
  Address,
  Chain,
  Client,
  ParseAccount,
  Prettify,
  RpcSchema,
  Transport,
  WalletClientConfig,
} from "viem"
import { createClient, publicActions, walletActions } from "viem"
import { setPayloadProviderConfig } from "../payloadProvider/config"
import type { PayloadProviderConfig } from "../payloadProvider/types"
import type { ArkivRpcSchema } from "../types/rpcSchema"
import { type WalletArkivActions, walletArkivActions } from "./decorators/arkivWallet"

export type WalletArkivClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  rpcSchema extends RpcSchema | undefined = ArkivRpcSchema,
> = Prettify<
  Client<transport, chain, account, rpcSchema, WalletArkivActions<transport, chain, account>>
>

export type WalletArkivClientConfig<
  transport extends Transport,
  chain extends Chain | undefined = undefined,
  accountOrAddress extends Account | Address | undefined = undefined,
  rpcSchema extends RpcSchema | undefined = ArkivRpcSchema,
> = WalletClientConfig<transport, chain, accountOrAddress, rpcSchema> & {
  payloadProvider?: PayloadProviderConfig | false
}

/**
 * Creates a Public Client with a given [Transport](https://viem.sh/docs/clients/intro) configured for a [Chain](https://viem.sh/docs/clients/chains).
 *
 * - Docs: https://docs.arkiv.network/ts-sdk/clients/public
 *
 * A Public Client is an interface to "public" [Ethereum JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/), [Arkiv JSON-RPC API](https://docs.arkiv.network/json-rpc/), and [Braga JSON-RPC API](https://braga.holesky.arkiv.network/rpc) methods such as retrieving block numbers, transactions, reading from smart contracts, etc through [Public Actions](/docs/actions/public/introduction).
 *
 * @param parameters - Configuration object for the wallet client (chain, transport, account, etc.)
 * @returns A Arkiv Wallet Client. {@link WalletArkivClient}
 *
 * @example
 * import { createPublicClient, http } from 'arkiv'
 * import { braga } from 'arkiv/chains'
 *
 * const client = createPublicClient({
 *   chain: braga,
 *   transport: http(),
 * })
 */
export function createWalletClient<
  transport extends Transport,
  chain extends Chain | undefined = undefined,
  accountOrAddress extends Account | Address | undefined = undefined,
  rpcSchema extends RpcSchema | undefined = ArkivRpcSchema,
>(
  parameters: WalletArkivClientConfig<transport, chain, accountOrAddress, rpcSchema>,
): WalletArkivClient<transport, chain, ParseAccount<accountOrAddress>, rpcSchema> {
  const {
    key = "wallet",
    name = "Wallet Client",
    payloadProvider,
    ...clientParameters
  } = parameters
  const client = createClient({
    ...clientParameters,
    key,
    name,
  })
  setPayloadProviderConfig(client, payloadProvider)

  const publicClient = client.extend(publicActions)
  setPayloadProviderConfig(publicClient, payloadProvider)

  const walletClient = publicClient.extend(walletActions)
  setPayloadProviderConfig(walletClient, payloadProvider)

  const arkivClient = walletClient.extend(walletArkivActions) as unknown as WalletArkivClient<
    transport,
    chain,
    ParseAccount<accountOrAddress>,
    rpcSchema
  >
  setPayloadProviderConfig(arkivClient, payloadProvider)

  return arkivClient
}
