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

export async function launchLocalArkivNode(withFundingAddress: Hex | undefined = undefined) {
  const container = await new GenericContainer(ARKIV_NODE_IMAGE)
    .withExposedPorts(8545)
    .withExposedPorts(8546)
    .withWaitStrategy(Wait.forLogMessage("Block added to canonical chain", 1))
    .withStartupTimeout(30000)
    .start()

  const httpPort = container.getMappedPort(8545)
  const wsPort = container.getMappedPort(8546)
  
  if (withFundingAddress) {
    await execCommand(container, [
      "fund-account.sh",
      "--address",
      withFundingAddress,
      "--value",
      "1.0E18" //1 ETH = 1e18 wei
    ])
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
  const stdout = await new Response(
    Bun.spawn(["docker", "exec", container.getId(), ...command]).stdout,
  ).text()
  console.debug("Command output", stdout)
  return stdout
}
