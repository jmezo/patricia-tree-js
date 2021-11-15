import level from "level";
import { rlp } from "ethereumjs-util";
import { SecureTrie as Trie } from "merkle-patricia-tree";

const stateRoot =
  "a8904f1b97f7b047560fd6d777eadd7be520a8267f0d75e5a27e42b5558e9ac4";

const bufStateRoot = Buffer.alloc(stateRoot.length / 2, stateRoot, "hex");
const db = level("./.leveldb/.devethereum/geth/chaindata");
const trie = new Trie(db, bufStateRoot);

async function main() {
  // trie
  //   .createReadStream()
  //   .on("data", console.log)
  //   .on("end", () => {
  //     console.log("End.");
  //   });

  const address = "069a9208A1DAde499F7609F7d52D815B1E60b95c";
  const bufAddr = Buffer.alloc(address.length / 2, address, "hex");
  const data = await trie.get(bufAddr);
  console.log(data);
  const decoded = rlp.decode(data);
  console.log(decoded);
  // const acc = Account.fromAccountData(data as unknown as AccountData)

  // console.log('-------State-------')
  // console.log(`nonce: ${acc.nonce}`)
  // console.log(`balance in wei: ${acc.balance}`)
  // console.log(`storageRoot: ${bufferToHex(acc.stateRoot)}`)
  // console.log(`codeHash: ${bufferToHex(acc.codeHash)}`)
}

main();
