import dotenv from "dotenv";

dotenv.config();

const env = {
  NODE_URL: process.env.NODE_URL,
  IPC_PATH: process.env.IPC_PATH,
  LEVELDB_PATH: process.env.LEVELDB_PATH,
};

export default env;
