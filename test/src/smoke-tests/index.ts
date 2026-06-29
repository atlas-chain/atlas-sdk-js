import { createPublicClient, http } from "@atlas-chain/sdk"
import { atlas } from "@atlas-chain/sdk/chains"

const client = createPublicClient({
  chain: atlas,
  transport: http(),
})

const entity = await client.getBlockTiming()
console.log(entity)
