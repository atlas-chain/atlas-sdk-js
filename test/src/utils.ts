import type { Hex } from "@atlas-chain/sdk"
import { existsSync } from "node:fs"
import { mkdir } from "node:fs/promises"
import { resolve } from "node:path"
import { GenericContainer, type StartedTestContainer, Wait } from "testcontainers"

export const LOCAL_PAYLOAD_PROVIDER_INGRESS_BEARER_KEY = "local-sdk-payload-provider-key"

const DEV_PAYLOAD_PROVIDER_SIGNER_PRIVATE_KEY =
  "0x0000000000000000000000000000000000000000000000000000000000000001"

const sdkRoot = resolve(import.meta.dir, "../..")
const atlasRoot = resolve(sdkRoot, "..")

export async function launchLocalArkivStack(withFundingAddress: Hex | undefined = undefined) {
  const payloadProvider = await launchLocalPayloadProvider()

  try {
    const arkivNode = await launchLocalArkivNode(withFundingAddress)
    return {
      ...arkivNode,
      payloadProvider: payloadProvider.container,
      payloadProviderPort: payloadProvider.port,
      payloadProviderUrl: `http://127.0.0.1:${payloadProvider.port}`,
    }
  } catch (error) {
    await payloadProvider.container.stop()
    throw error
  }
}

export async function launchLocalArkivNode(withFundingAddress: Hex | undefined = undefined) {
  const configuredImage = process.env.ARKIV_SDK_TEST_ARKIV_NODE_IMAGE
  const image = configuredImage
    ? new GenericContainer(configuredImage)
    : await buildLocalArkivNodeImage()

  const container = await image
    .withExposedPorts(8545)
    .withExposedPorts(8546)
    .withWaitStrategy(Wait.forLogMessage("Block added to canonical chain", 1))
    .withStartupTimeout(120000)
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

export async function execCommand(container: StartedTestContainer, command: string[]) {
  console.debug("Executing command", command)
  const process = Bun.spawn(["docker", "exec", container.getId(), ...command], {
    stdout: "pipe",
    stderr: "pipe",
  })
  const stdoutPromise = new Response(process.stdout).text()
  const stderrPromise = new Response(process.stderr).text()
  const exitCode = await process.exited
  const stdout = await stdoutPromise
  const stderr = await stderrPromise
  console.debug("Command output", stdout)
  if (exitCode !== 0) {
    throw new Error(
      `Command failed (${exitCode}): docker exec ${container.getId()} ${command.join(" ")}\n${stderr}${stdout}`,
    )
  }
  return stdout
}

async function launchLocalPayloadProvider() {
  const configuredImage = process.env.ARKIV_SDK_TEST_PAYLOAD_PROVIDER_IMAGE
  const image = configuredImage
    ? new GenericContainer(configuredImage)
    : await GenericContainer.fromDockerfile(payloadProviderRepoPath()).withBuildkit().build()

  const container = await image
    .withEnvironment({
      INGRESS_BEARER_KEY: LOCAL_PAYLOAD_PROVIDER_INGRESS_BEARER_KEY,
      SIGNER_PRIVATE_KEY: DEV_PAYLOAD_PROVIDER_SIGNER_PRIVATE_KEY,
      MAX_PAYLOAD_BYTES: process.env.ARKIV_SDK_TEST_MAX_PAYLOAD_BYTES ?? "1048576",
    })
    .withExposedPorts(28883)
    .withWaitStrategy(Wait.forHttp("/healthz", 28883))
    .withStartupTimeout(120000)
    .start()

  return { container, port: container.getMappedPort(28883) }
}

async function buildLocalArkivNodeImage() {
  await ensureArkivNodeBuildArtifacts()
  return GenericContainer.fromDockerfile(arkivRethRepoPath(), "docker/runtime-dev.Dockerfile")
    .withBuildkit()
    .build()
}

async function ensureArkivNodeBuildArtifacts() {
  const repo = arkivRethRepoPath()
  const buildArtifacts = resolve(repo, "build-artifacts")
  const arkivNodeArtifact = resolve(buildArtifacts, "arkiv-node")
  const arkivCliArtifact = resolve(buildArtifacts, "arkiv-cli")
  const arkivNodeRelease = resolve(repo, "target/release/arkiv-node")
  const arkivCliRelease = resolve(repo, "target/release/arkiv-cli")

  if (
    process.env.ARKIV_SDK_TEST_SKIP_RETH_BUILD !== "true" ||
    !existsSync(arkivNodeRelease) ||
    !existsSync(arkivCliRelease)
  ) {
    await runHostCommand(
      [
        "cargo",
        "build",
        "--release",
        "--manifest-path",
        resolve(repo, "Cargo.toml"),
        "--bin",
        "arkiv-node",
        "--bin",
        "arkiv-cli",
      ],
      repo,
    )
  }

  await mkdir(buildArtifacts, { recursive: true })
  await runHostCommand(["cp", arkivNodeRelease, arkivNodeArtifact], repo)
  await runHostCommand(["cp", arkivCliRelease, arkivCliArtifact], repo)
}

async function runHostCommand(command: string[], cwd: string) {
  console.debug("Executing host command", command.join(" "))
  const process = Bun.spawn(command, {
    cwd,
    stdout: "inherit",
    stderr: "inherit",
  })
  const exitCode = await process.exited
  if (exitCode !== 0) {
    throw new Error(`Command failed (${exitCode}): ${command.join(" ")}`)
  }
}

function arkivRethRepoPath() {
  return process.env.ARKIV_RETH_REPO ?? resolve(atlasRoot, "atlas-reth")
}

function payloadProviderRepoPath() {
  return process.env.ATLAS_PAYLOAD_PROVIDER_REPO ?? resolve(atlasRoot, "atlas-payload-provider")
}
