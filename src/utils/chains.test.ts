import { describe, expect, test } from "bun:test"
import { atlas, localhost } from "../chains"
import { chainFromName } from "./chains"

describe("chainFromName", () => {
  describe("valid chain names", () => {
    test("returns atlas chain for 'atlas'", () => {
      const chain = chainFromName("atlas")
      expect(chain).toBe(atlas)
      expect(chain.id).toBe(42069)
      expect(chain.name).toBe("Atlas")
      expect(chain.rpcUrls.default.http).toEqual(["https://atlas.arkiv-global.net/"])
    })

    test("returns localhost chain for 'localhost'", () => {
      const chain = chainFromName("localhost")
      expect(chain).toBe(localhost)
      expect(chain.id).toBe(1337)
      expect(chain.name).toBe("Localhost")
    })
  })

  describe("case insensitivity", () => {
    test("handles uppercase chain names", () => {
      expect(chainFromName("ATLAS")).toBe(atlas)
      expect(chainFromName("LOCALHOST")).toBe(localhost)
    })

    test("handles mixed case chain names", () => {
      expect(chainFromName("Atlas")).toBe(atlas)
      expect(chainFromName("Localhost")).toBe(localhost)
      expect(chainFromName("aTlAs")).toBe(atlas)
    })
  })

  describe("error handling", () => {
    test("throws error for unknown chain name", () => {
      expect(() => chainFromName("unknown")).toThrow("Unknown chain: unknown")
    })

    test("throws error for empty string", () => {
      expect(() => chainFromName("")).toThrow("Unknown chain: ")
    })

    test("throws error for chain name with whitespace", () => {
      expect(() => chainFromName("atlas ")).toThrow("Unknown chain: atlas ")
      expect(() => chainFromName(" atlas")).toThrow("Unknown chain:  atlas")
    })

    test("throws error for similar but incorrect chain names", () => {
      expect(() => chainFromName("testnet")).toThrow("Unknown chain: testnet")
      expect(() => chainFromName("legacy")).toThrow("Unknown chain: legacy")
      expect(() => chainFromName("atlasa")).toThrow("Unknown chain: atlasa")
      expect(() => chainFromName("mendoza")).toThrow("Unknown chain: mendoza")
      expect(() => chainFromName("marketplace")).toThrow("Unknown chain: marketplace")
      expect(() => chainFromName("rosario")).toThrow("Unknown chain: rosario")
      expect(() => chainFromName("local")).toThrow("Unknown chain: local")
    })
  })

  describe("chain properties", () => {
    test("returned chain has required viem Chain properties", () => {
      const chain = chainFromName("atlas")

      expect(chain).toHaveProperty("id")
      expect(chain).toHaveProperty("name")
      expect(chain).toHaveProperty("network")
      expect(chain).toHaveProperty("nativeCurrency")
      expect(chain).toHaveProperty("rpcUrls")
      expect(typeof chain.id).toBe("number")
      expect(typeof chain.name).toBe("string")
    })

    test("returned chain has rpcUrls configured", () => {
      const chain = chainFromName("localhost")

      expect(chain.rpcUrls).toBeDefined()
      expect(chain.rpcUrls.default).toBeDefined()
      expect(chain.rpcUrls.default.http).toBeInstanceOf(Array)
      expect(chain.rpcUrls.default.http.length).toBeGreaterThan(0)
    })
  })
})
