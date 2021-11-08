import { sha256, rlp } from "ethereumjs-util";

const abc = "abcdefghijklmnopqrstuvwxyx";

const hash = (a: Buffer): string => {
  const buff = sha256(a);
  return buff.toString("hex");
};

const encode = (val: string[]): Buffer => {
  const res = rlp.encode(val);
  return res;
};

export default class RadixTrie {
  db: Record<string, string[]>;

  constructor() {
    this.db = {};
  }

  public get(node: string, path: string): string | undefined {
    if (path === "") {
      return this.db[node][26];
    } else {
      const curnode = this.db[node];
      const index = abc.indexOf(path[0]);
      const nodehash = curnode[index];
      if (nodehash === undefined) return undefined;
      return this.get(nodehash, path.slice(1));
    }
  }

  update(node: string, path: string, value: string): string {
    let newnode: string[];
    if (path === "") {
      const curnode = this.db[node] ?? Array.from(Array(27));
      newnode = [...curnode];
      newnode[curnode.length - 1] = value;
    } else {
      const curnode = this.db[node] ?? Array.from(Array(27));
      newnode = [...curnode];
      const newindex = this.update(
        curnode[abc.indexOf(path[0])],
        path.slice(1),
        value
      );
      newnode[abc.indexOf(path[0])] = newindex;
    }
    const nodehash = node === "root" ? "root" : hash(encode(newnode));
    this.db[nodehash] = newnode;
    return nodehash;
  }

  del = (node: string, path: string): string | undefined => {
    if (node === "") return undefined;

    const curnode = this.db[node];
    const newnode = [...curnode];
    if (path === "") {
      newnode[26] = undefined;
    } else {
      const nodehash = curnode[abc.indexOf(path[0])];
      const newindex = this.del(nodehash, path.slice(1));
      newnode[abc.indexOf(path[0])] = newindex;
    }

    if (
      newnode.filter((x) => x !== undefined).length === 0 &&
      node !== "root"
    ) {
      return undefined;
    } else {
      const nodehash = node === "root" ? "root" : hash(encode(newnode));
      this.db[nodehash] = newnode;
      return nodehash;
    }
  };
}
