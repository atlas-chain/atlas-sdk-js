import type { Hex, PayloadProviderConfig } from "@atlas-chain/sdk"
import { GenericContainer, type StartedTestContainer, Wait } from "testcontainers"

const ARKIV_NODE_IMAGE =
  process.env.ARKIV_SDK_TEST_ARKIV_NODE_IMAGE ??
  "ghcr.io/atlas-chain/arkiv-node-dev-int:v0.1.7"
const PAYLOAD_PROVIDER_IMAGE =
  process.env.ARKIV_SDK_TEST_PAYLOAD_PROVIDER_IMAGE ??
  "ghcr.io/atlas-chain/atlas-payload-provider:v0.1.2"
const PAYLOAD_PROVIDER_BEARER_KEY =
  process.env.ARKIV_SDK_TEST_PAYLOAD_PROVIDER_BEARER_KEY ??
  "sdk-local-payload-provider"
const PAYLOAD_PROVIDER_SIGNER_PRIVATE_KEY =
  process.env.ARKIV_SDK_TEST_PAYLOAD_PROVIDER_SIGNER_PRIVATE_KEY ??
  "0x0000000000000000000000000000000000000000000000000000000000000001"
const ARKIV_NODE_STARTUP_TIMEOUT_MS = 90_000

export async function launchLocalArkivNode(withFundingAddress: Hex | undefined = undefined) {
  const container = await new GenericContainer(ARKIV_NODE_IMAGE)
    .withExposedPorts(8545)
    .withExposedPorts(8546)
    .withWaitStrategy(Wait.forLogMessage("Block added to canonical chain", 1))
    .withStartupTimeout(30000)
    .start()

  const httpPort = container.getMappedPort(8545)
  const wsPort = container.getMappedPort(8546)

  await waitForArkivNodeBlock(httpPort)

  if (withFundingAddress) {
    await execCommand(container, [
      "fund-account.sh",
      "--address",
      withFundingAddress,
      "--value",
      "1.0E18" //1 ETH = 1e18 wei
    ])
    await waitForAccountBalance(httpPort, withFundingAddress)
  }

  return { container, httpPort, wsPort }
}

export async function launchLocalPayloadProvider() {
  const container = await new GenericContainer(PAYLOAD_PROVIDER_IMAGE)
    .withExposedPorts(28883)
    .withEnvironment({
      INGRESS_BEARER_KEY: PAYLOAD_PROVIDER_BEARER_KEY,
      SIGNER_PRIVATE_KEY: PAYLOAD_PROVIDER_SIGNER_PRIVATE_KEY,
    })
    .withWaitStrategy(Wait.forLogMessage("atlas payload provider listening", 1))
    .withStartupTimeout(30000)
    .start()

  const port = container.getMappedPort(28883)
  const config: PayloadProviderConfig = {
    url: `http://127.0.0.1:${port}`,
    bearerKey: PAYLOAD_PROVIDER_BEARER_KEY,
  }

  return { container, port, config }
}

export async function execCommand(container: StartedTestContainer, command: string[]) {
  console.debug("Executing command", command)
  const process = Bun.spawn(["docker", "exec", container.getId(), ...command])
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
    process.exited,
  ])
  console.debug("Command output", stdout)
  if (stderr.length > 0) {
    console.debug("Command error output", stderr)
  }
  if (exitCode !== 0) {
    throw new Error(`Command ${command.join(" ")} failed with exit code ${exitCode}: ${stderr}`)
  }
  return stdout
}

async function waitForArkivNodeBlock(httpPort: number) {
  await waitUntil("Arkiv node RPC did not reach block > 0", async () => {
    const blockNumber = BigInt(await rpc<Hex>(httpPort, "eth_blockNumber"))
    if (blockNumber === 0n) {
      return false
    }

    const latestBlock = await rpc<{ number?: Hex }>(httpPort, "eth_getBlockByNumber", [
      "latest",
      false,
    ])
    return latestBlock.number !== undefined && BigInt(latestBlock.number) > 0n
  })
}

async function waitForAccountBalance(httpPort: number, address: Hex) {
  await waitUntil(`Arkiv node did not fund ${address}`, async () => {
    const balance = BigInt(await rpc<Hex>(httpPort, "eth_getBalance", [address, "latest"]))
    return balance > 0n
  })
}

async function waitUntil(message: string, predicate: () => Promise<boolean>) {
  const deadline = Date.now() + ARKIV_NODE_STARTUP_TIMEOUT_MS
  let lastError: unknown

  while (Date.now() < deadline) {
    try {
      if (await predicate()) {
        return
      }
    } catch (error) {
      lastError = error
    }

    await Bun.sleep(1_000)
  }

  throw new Error(`${message}${lastError ? `: ${String(lastError)}` : ""}`)
}

async function rpc<T>(httpPort: number, method: string, params: unknown[] = []): Promise<T> {
  const response = await fetch(`http://127.0.0.1:${httpPort}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  })

  if (!response.ok) {
    throw new Error(`RPC ${method} failed with HTTP ${response.status}`)
  }

  const body = (await response.json()) as {
    result?: T
    error?: { code: number; message: string }
  }

  if (body.error) {
    throw new Error(`RPC ${method} failed: ${body.error.code} ${body.error.message}`)
  }

  if (body.result === undefined) {
    throw new Error(`RPC ${method} returned no result`)
  }

  return body.result
}
