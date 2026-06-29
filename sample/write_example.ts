import { createPublicClient, createWalletClient, http } from "@atlas-chain/sdk"
import { privateKeyToAccount } from "@atlas-chain/sdk/accounts"
import { atlas } from "@atlas-chain/sdk/chains"
import { ExpirationTime, jsonToPayload } from "@atlas-chain/sdk/utils"

// Create a public client
const publicClient = createPublicClient({
  chain: atlas,
  transport: http(),
})

// Create a wallet client with an account
const client = createWalletClient({
  chain: atlas,
  transport: http(),
  account: privateKeyToAccount("0x..."), // Replace with your private key
})

// Create an entity
const { entityKey, txHash } = await client.createEntity({
  payload: jsonToPayload({
    entity: {
      entityType: "document",
      entityId: "doc-123",
      entityContent: "Hello from DevConnect Hackathon 2025! Arkiv chain wish you all the best!",
    },
  }),
  contentType: "application/json",
  attributes: [
    { key: "category", value: "documentation" },
    { key: "version", value: "1.0" },
  ],
  expiresIn: ExpirationTime.fromDays(30), // Entity expires in 30 days
})

console.log("Created entity:", entityKey)
console.log("Transaction hash:", txHash)

const newEntity = await publicClient.getEntity(entityKey)
console.log("Entity:", newEntity)
