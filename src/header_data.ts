import levelup from "levelup";
import leveldown = require("leveldown");
import { ethers, utils } from "ethers";
import { rlp } from "ethereumjs-util";
import { SecureTrie as Trie } from "merkle-patricia-tree";
import env from "./utils/env";

// const db = levelup(leveldown("./.ethereum/geth/lightchaindata"));
// const db = levelup(leveldown("./.ethereum/geth/chaindata"));
const db = levelup(leveldown(env.LEVELDB_PATH));
const provider = new ethers.providers.JsonRpcProvider(env.NODE_URL);
// const provider = new ethers.providers.IpcProvider("../.ethereum/geth.ipc");

const main = async () => {
  const blockNum = 4;
  // const blockNum = 40;
  const blockHeader = await getBlockHeader(blockNum);
  console.log(blockHeader);

  const stateRoot = blockHeader["root"];
  const bufStateRoot = Buffer.alloc(
    (stateRoot.length - 2) / 2,
    stateRoot.slice(2),
    "hex"
  );

  const trie = new Trie(db);
  const check = await trie.checkRoot(bufStateRoot);
  console.log(check);
};

const getBlockNumInHex = (blockNumber: number): Buffer => {
  const numInHex = utils.hexZeroPad(utils.hexValue(blockNumber), 8).substr(2);
  return Buffer.alloc(8, numInHex, "hex");
};

const getKeyForBlockHash = (blockNum: Buffer): Buffer => {
  const header = "h".charCodeAt(0).toString(16);
  const suffix = "n".charCodeAt(0).toString(16);
  const key = header + blockNum.toString("hex") + suffix;
  return Buffer.alloc(10, key, "hex");
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

const getBlockHeader = async (blockNum: number) => {
  const hexBlockNum = getBlockNumInHex(blockNum);
  const keyForBlockHash = getKeyForBlockHash(hexBlockNum);
  const blockHash = await db.get(keyForBlockHash);
  const keyForHeader = getKeyForHeader(hexBlockNum, blockHash as Buffer);
  const encodedHeader = await db.get(keyForHeader);
  const decoded = decodeBlockHeader(encodedHeader as Buffer);
  return decoded;
};

const getBlock = async (blockNum: number) => {
  const block = await provider.send("eth_getBlockByNumber", [
    utils.hexValue(blockNum),
    true,
  ]);
  return block;
};

main();
