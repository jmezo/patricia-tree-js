import levelup, { LevelUp } from "levelup";
import leveldown = require("leveldown");
import { rlp, keccak256 } from "ethereumjs-util";
import { getBlockHeader, getNode, getRootHashes } from "./db_reader";

const main = async () => {
  const db = levelup(leveldown("./.leveldb/.devethereum/geth/chaindata"));

  const blockHeader = await getBlockHeader(4, db);

  console.log(blockHeader);
  // console.log(await getRootHashes(4, db));

  const lastHeaderHash = await db.get(Buffer.from("LastHeader"));
  console.log(lastHeaderHash);
  const lastBlockHash = await db.get(Buffer.from("LastBlock"));
  console.log(lastBlockHash);
};

main();
