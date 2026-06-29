import { defineChain } from "viem"

export const atlas = defineChain({
  id: 42069,
  name: "Atlas",
  network: "atlas",
  nativeCurrency: {
    name: "Golem",
    symbol: "GLM",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://atlas.arkiv-global.net/"],
    },
  },
})
