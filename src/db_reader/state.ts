import { LevelUp } from "levelup";
import { rlp, keccak256, stripHexPrefix } from "ethereumjs-util";
import { getNode } from "./tree";

export type Account = {
  nonce: string;
  balance: string;
  storageRoot: string;
  codeHash: string;
};

export const getAccount = async (
  address: string,
  stateRoot: Buffer,
  db: LevelUp
): Promise<Account> => {
  const addrKeccak = keccak256(Buffer.from(stripHexPrefix(address), "hex"));

  const res = await getNode(stateRoot, addrKeccak, db);
  const decoded = rlp.decode(res) as unknown as Buffer[];
  return decodeAccount(decoded);
};

const decodeAccount = (data: Buffer[]): Account => {
  const [nonce, balance, storageRoot, codeHash] = data;
  const forMapping = { nonce, balance, storageRoot, codeHash };
  return Object.entries(forMapping).reduce((acc, entry) => {
    const [key, val] = entry;
    acc[key] = "0x" + val.toString("hex");
    return acc;
  }, {} as Account);
};
