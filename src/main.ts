import level = require("level");
import { ethers, utils } from "ethers";
import dotenv from "dotenv";

dotenv.config();
const db = level("./.db_data");

const getLeveldbBlockKey = (blockNumber: number) => {
  const header = "h".charCodeAt(0).toString(16);
  const suffix = "n".charCodeAt(0).toString(16);
  const numInHex = utils.hexZeroPad(utils.hexValue(blockNumber), 8).substr(2);
  const res = "0x" + header + numInHex + suffix;
  return res;
};

const main = async () => {
  const blockNum = getLeveldbBlockKey(40);
  console.log(blockNum);

  const val = await db.get(blockNum);
  console.log(val);
};

const getBlock = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL);
  const block = await provider.send("eth_getBlockByNumber", [
    utils.hexValue(40),
    true,
  ]);
  return block;
};

main();
