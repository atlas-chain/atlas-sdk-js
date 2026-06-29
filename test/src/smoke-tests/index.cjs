const { createPublicClient, http } = require("@atlas-chain/sdk")
const { atlas } = require("@atlas-chain/sdk/chains")

const client = createPublicClient({
  chain: atlas,
  transport: http(),
})

async function main() {
  const entity = await client.getBlockTiming()
  console.log(entity)
}

main()
