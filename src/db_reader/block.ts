import { LevelUp } from "levelup";
import { rlp } from "ethereumjs-util";

export type BlockHeader = {
  parentHash: string;
  uncleHash: string;
  coinbase: string;
  stateRoot: string;
  txSha: string;
  receiptSha: string;
  bloom: string;
  difficulty: string;
  number: string;
  gasLimit: string;
  gasUsed: string;
  time: string;
  extra: string;
  mixDigest: string;
  nonce: string;
  baseFeePerGas: string;
};

export type RootHashes = {
  stateRoot: Buffer;
  txSha: Buffer;
  receiptSha: Buffer;
};

export const getLatestBlockNumber = async (db: LevelUp): Promise<bigint> => {
  const [latestBlockNum] = await _getLatestBlockNumberAndHash(db);
  return latestBlockNum.readBigUInt64BE();
};

export const getBlockHeader = async (
  db: LevelUp,
  blockNum: number | undefined = undefined
): Promise<BlockHeader> => {
  const encodedHeader = await _getEncodedBlockHeader(blockNum, db);
  const decoded = decodeBlockHeader(encodedHeader as Buffer);
  return decoded;
};

export const getRootHashes = async (
  db: LevelUp,
  blockNum: number | undefined = undefined
): Promise<RootHashes> => {
  const encodedHeader = await _getEncodedBlockHeader(blockNum, db);
  const decoded = rlp.decode(encodedHeader) as unknown as Buffer[];
  return { stateRoot: decoded[3], txSha: decoded[4], receiptSha: decoded[5] };
};

const _getLatestBlockNumberAndHash = async (
  db: LevelUp
): Promise<[Buffer, Buffer]> => {
  const latestHeaderHash = (await db.get(Buffer.from("LastHeader"))) as Buffer;
  const latestBlockNumKey = Buffer.concat([Buffer.from("H"), latestHeaderHash]);
  const latestBlockNum = (await db.get(latestBlockNumKey)) as Buffer;
  return [latestBlockNum, latestHeaderHash];
};

const _getEncodedBlockHeader = async (
  blockNum: number | undefined,
  db: LevelUp
): Promise<Buffer> => {
  let hexBlockNum, blockHash;
  if (blockNum === undefined) {
    const [latestBlockNum, latestHash] = await _getLatestBlockNumberAndHash(db);
    hexBlockNum = latestBlockNum;
    blockHash = latestHash;
  } else {
    hexBlockNum = getBlockNumInHex(blockNum);
    const keyForBlockHash = getKeyForBlockHash(hexBlockNum);
    blockHash = await db.get(keyForBlockHash);
  }
  const keyForHeader = getKeyForHeader(hexBlockNum, blockHash as Buffer);
  return db.get(keyForHeader);
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
  const blockHeader = {} as BlockHeader;
  for (const i in decoded) {
    const d = decoded[i] as unknown as Buffer;
    blockHeader[keys[i]] = "0x" + d.toString("hex");
  }
  return blockHeader;
};
