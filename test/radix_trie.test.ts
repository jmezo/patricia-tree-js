import RadixTrie from "../src/radix_trie";

describe("RadixTrie", () => {
  let radixTrie: RadixTrie;
  beforeEach(() => {
    radixTrie = new RadixTrie();
  });
  it("should work", () => {
    // add a few key-value pairs
    radixTrie.update("root", "alma", "korte");
    radixTrie.update("root", "allthe", "smallthings");
    radixTrie.update("root", "help", "me");

    // assert they were saved
    expect(radixTrie.get("root", "alma")).toBe("korte");
    expect(radixTrie.get("root", "allthe")).toBe("smallthings");
    expect(radixTrie.get("root", "help")).toBe("me");
    // remove one pair
    radixTrie.del("root", "alma");
    // assert one deleted, others still saved
    expect(radixTrie.get("root", "alma")).toBe(undefined);
    expect(radixTrie.get("root", "allthe")).toBe("smallthings");
    expect(radixTrie.get("root", "help")).toBe("me");
  });
});
