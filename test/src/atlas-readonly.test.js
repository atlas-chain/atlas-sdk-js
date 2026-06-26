import { describe, expect, test } from "bun:test";
import { createPublicClient, http } from "../../src/index.ts";
import { atlas } from "../../src/chains/index.ts";

describe("Atlas readonly network", () => {
  const publicClient = createPublicClient({
    chain: atlas,
    transport: http(),
  });

  test(
    "reads chain id and block number",
    async () => {
      const chainId = await publicClient.getChainId();
      expect(chainId).toBe(atlas.id);

      const blockNumber = await publicClient.getBlockNumber();
      expect(blockNumber).toBeGreaterThan(0n);
    },
    { timeout: 30_000 },
  );
});
