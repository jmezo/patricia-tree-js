import levelup, { LevelUp } from "levelup";
import level from "level";
import leveldown = require("leveldown");
import { rlp, keccak256 } from "ethereumjs-util";
import { SecureTrie, BaseTrie } from "merkle-patricia-tree";
import { BranchNode } from "merkle-patricia-tree/dist/trieNode";

const db = levelup(leveldown("./.leveldb/.devethereum/geth/chaindata"));
// const db = level("./.leveldb/.devethereum/geth/chaindata");

const stateRoot =
  "a8904f1b97f7b047560fd6d777eadd7be520a8267f0d75e5a27e42b5558e9ac4";

const stateRootBuf = Buffer.from(stateRoot, "hex");

const address = "069a9208A1DAde499F7609F7d52D815B1E60b95c";
const addrBuf = Buffer.from(address, "hex");
const addrKeccak = keccak256(addrBuf);

const address2 = "0xCF1613E057A159406d64BE5B8F8793F2ee9cAFC2";
const addr2Buf = Buffer.from(address2, "hex");
const addr2Keccak = keccak256(addr2Buf);

const main = async () => {
  console.log("address        :", addrBuf);
  console.log("address keccak :", addrKeccak);
  console.log("address2 keccak:", addr2Keccak);

  // const header = await getBlockHeader(4, db);
  // console.log(header);

  console.log("******************- manual");
  await huntForAddress();
  console.log("******************- trie");
  await checkAddressWithTrie();

  console.log("******************- alg");
  const got = await getAccount(stateRoot, address, db);
  console.log(got);

  // await getAccount(stateRoot, address, db);

  // console.log("stateRoot:", stateRootBuf);
  // console.log(decodedRoot);
};

const checkAddressWithTrie = async () => {
  const trie = new SecureTrie(db, stateRootBuf);
  const res = await trie.get(addrBuf);
  const decoded = rlp.decode(res);
  console.log("res:", res);
  console.log("decoded:", decoded);
  const path = await trie.findPath(addrKeccak);
  // console.log("path:", path.stack);
  const checkAddr = (path.stack[1] as BranchNode)._branches[13];
  console.log(checkAddr);
  const check = await trie.lookupNode(checkAddr);
  console.log(check);
};

const huntForAddress = async () => {
  const root = await db.get(stateRootBuf);
  const decodedRoot = rlp.decode(root as Buffer);
  console.log("decodedRoot:", decodedRoot);

  const _1key = decodedRoot[8];
  const _1 = await db.get(_1key);
  const _1decoded = rlp.decode(_1 as Buffer);
  console.log("decoded 8:", _1decoded);

  // const _2key = decodedRoot[parseInt("e", 16)];
  const _2key = _1decoded[14];
  const _2 = await db.get(_2key);
  const _2decoded = rlp.decode(_2 as Buffer);
  console.log("decoded e:", _2decoded);
  const leaf = rlp.decode(_2decoded[1]);
  console.log("leaf:", leaf);
};

const getBlockHeader = async (blockNum: number, db: LevelUp) => {
  const hexBlockNum = getBlockNumInHex(blockNum);
  const keyForBlockHash = getKeyForBlockHash(hexBlockNum);
  console.log("key for block hash:", keyForBlockHash);
  const blockHash = await db.get(keyForBlockHash);
  const keyForHeader = getKeyForHeader(hexBlockNum, blockHash as Buffer);
  const encodedHeader = await db.get(keyForHeader);
  const decoded = decodeBlockHeader(encodedHeader as Buffer);
  return decoded;
};

const getBlockNumInHex = (blockNumber: number): Buffer => {
  let hexNum = blockNumber.toString(16);
  // left pad with 0s until length is 16 (64 bits)
  for (let i = hexNum.length; i < 16; i++) {
    hexNum = "0" + hexNum;
  }
  return Buffer.from(hexNum, "hex");
};

const getKeyForBlockHash = (blockNum: Buffer): Buffer => {
  const header = "h".charCodeAt(0).toString(16);
  const suffix = "n".charCodeAt(0).toString(16);
  const key = header + blockNum.toString("hex") + suffix;
  return Buffer.from(key, "hex");
};

const getKeyForHeader = (blockNumber: Buffer, blockHash: Buffer) => {
  const header = "h".charCodeAt(0).toString(16);
  const key = header + blockNumber.toString("hex") + blockHash.toString("hex");
  return Buffer.alloc(key.length / 2, key, "hex");
};

const decodeBlockHeader = (encoded: Buffer) => {
  const keys = [
    "parentHash",
    "uncleHash",
    "coinbase",
    "stateRoot",
    "txSha",
    "receiptSha",
    "bloom",
    "difficulty",
    "number",
    "gasLimit",
    "gasUsed",
    "time",
    "extra",
    "mixDigest",
    "nonce",
    "baseFeePerGas",
  ];
  const decoded = rlp.decode(encoded);
  const blockHeader = {};
  for (const i in decoded) {
    const d = decoded[i] as unknown as Buffer;
    blockHeader[keys[i]] = "0x" + d.toString("hex");
  }
  return blockHeader;
};

const getAccount = async (stateRoot: string, address: string, db: LevelUp) => {
  const stateRootBuf = Buffer.from(stateRoot, "hex");

  // get keccak256 hash of address
  const addrBuf = Buffer.from(address, "hex");
  const addrKeccak = keccak256(addrBuf);

  const res = await getNode(stateRootBuf, addrKeccak, db);
  return rlp.decode(res);
};

const getNode = async (node: Buffer, path: Buffer, db: LevelUp) => {
  const nibbles = getNibbles(path);
  // console.log("path:", path);
  // console.log("path:", nibbles);
  return getNodeHelper(node, nibbles, db);
};

const getNodeHelper = async (
  node: Buffer,
  path: number[],
  db: LevelUp
): Promise<Buffer> => {
  if (path.length === 0) {
    return node;
  }
  if (node.length === 0) {
    return undefined;
  }

  const curNode = rlp.decode(
    node.length < 32 ? node : await db.get(node)
  ) as unknown as Buffer[];
  if (curNode.length === 17) {
    return getNodeHelper(curNode[path[0]], path.slice(1), db);
  }
  if (curNode.length === 2) {
    const [key, value] = curNode as unknown as [Buffer, Buffer];
    const nibbles = getNibbles(key);

    if ([0, 1].includes(nibbles[0])) {
      const remainingPath =
        nibbles[0] === 0 ? nibbles.slice(2) : nibbles.slice(1);
      return getNodeHelper(value, remainingPath, db);
    }
    if ([2, 3].includes(nibbles[0])) {
      const remainingPath =
        nibbles[0] === 2 ? nibbles.slice(2) : nibbles.slice(1);
      if (JSON.stringify(remainingPath) === JSON.stringify(path)) {
        return value;
      } else {
        return undefined;
      }
    }
    if (nibbles[0] == 0) {
      return getNodeHelper(value, nibbles.slice(2), db);
    } else if (nibbles[0] == 1) {
      return getNodeHelper(value, nibbles.slice(1), db);
    } else if (nibbles[0] == 2 || nibbles[0] == 3) {
      return value;
    }
  }
  throw new Error("node length: " + curNode.length);
};

const getNibbles = (path: Buffer) => {
  const nibbles = [];
  path.forEach((byte) => {
    // split byte into nibbles (4 bits)
    nibbles.push(Math.floor(byte / 16));
    nibbles.push(byte % 16);
  });
  return nibbles;
};

const compactDecode = (encoded: Buffer) => {
  // TODO
  return encoded;
};

const streamDb = async () => {
  db.createReadStream()
    .on("data", function (data) {
      const { key, value } = data;
      console.log(key, "key length:", key.length);
      // console.log("key:", key, "value:", value);
      // const decodedValue = rlp.decode(value);
      // console.log("decodedValue:", decodedValue, "length:", decodedValue.length);
    })
    .on("error", function (err) {
      console.log("Oh my!", err);
    })
    .on("close", function () {
      console.log("Stream closed");
    })
    .on("end", function () {
      console.log("Stream ended");
    });
};

main();
