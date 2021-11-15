import { LevelUp } from "levelup";
import { getBlockHeader, getRootHashes, getLatestBlockNumber } from "./block";
import { getNode } from "./tree";
import { getAccount as _getAccount, Account } from "./state";

export { getBlockHeader, getRootHashes, getNode, getLatestBlockNumber };

export const getAccount = async (
  address: string,
  db: LevelUp,
  blockNumber: number | undefined = undefined
): Promise<Account> => {
  const { stateRoot } = await getRootHashes(db, blockNumber);
  return _getAccount(address, stateRoot, db);
};
