import { LevelUp } from "levelup";
import { rlp } from "ethereumjs-util";

export const getNode = async (
  node: Buffer,
  path: Buffer,
  db: LevelUp
): Promise<Buffer | undefined> => {
  const nibbles = getNibbles(path);
  return getNodeHelper(node, nibbles, db);
};

const getNodeHelper = async (
  node: Buffer,
  path: number[],
  db: LevelUp
): Promise<Buffer | undefined> => {
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
