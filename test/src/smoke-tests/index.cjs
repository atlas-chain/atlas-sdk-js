const { createPublicClient, http } = require("@atlas-chain/sdk")
const { braga } = require("@atlas-chain/sdk/chains")

const client = createPublicClient({
  chain: braga,
  transport: http(),
})

async function main() {
  const entity = await client.getBlockTiming()
  console.log(entity)
}

main()
