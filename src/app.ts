import levelup from "levelup";
import leveldown = require("leveldown");
import * as dbReader from "./db_reader";
import env from "./utils/env";

const main = async () => {
  const db = levelup(leveldown(env.LEVELDB_PATH));

  const blockHeader = await dbReader.getBlockHeader(db);

  console.log(blockHeader);
  console.log(await dbReader.getRootHashes(db));

  const lastHeaderHash = await db.get(Buffer.from("LastHeader"));
  console.log(lastHeaderHash);
  const lastBlockHash = await db.get(Buffer.from("LastBlock"));
  console.log(lastBlockHash);

  const address = "069a9208A1DAde499F7609F7d52D815B1E60b95c";

  const addrData = await dbReader.getAccount(address, db);
  console.log(addrData);

  const latestBlockNum = await dbReader.getLatestBlockNumber(db);
  console.log(latestBlockNum);
};

main();

const test = async () => {
  const db = levelup(leveldown(env.LEVELDB_PATH));

  const blockHeader = await dbReader.getBlockHeader(db);

  console.log(blockHeader);
  console.log(await dbReader.getRootHashes(db));

  const lastHeaderHash = await db.get(Buffer.from("LastHeader"));
  console.log(lastHeaderHash);
  const lastBlockHash = await db.get(Buffer.from("LastBlock"));
  console.log(lastBlockHash);

  const address = "069a9208A1DAde499F7609F7d52D815B1E60b95c";

  const addrData = await dbReader.getAccount(address, db);
  console.log(addrData);

  const latestBlockNum = await dbReader.getLatestBlockNumber(db);
  console.log(latestBlockNum);
};
