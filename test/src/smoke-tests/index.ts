import { createPublicClient, http } from "@atlas-chain/sdk"
import { braga } from "@atlas-chain/sdk/chains"

const client = createPublicClient({
  chain: braga,
  transport: http(),
})

const entity = await client.getBlockTiming()
console.log(entity)
