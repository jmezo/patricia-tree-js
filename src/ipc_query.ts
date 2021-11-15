import { ethers } from "ethers";
import env from "./utils/env";

const main = async () => {
  const provider = new ethers.providers.IpcProvider(env.IPC_PATH);
  // const block = await provider.getBlockWithTransactions("latest");
  // console.log(block);
  // console.log(block.transactions[0].value.toString())
  // const balance = await provider.getBalance("0x069a9208A1DAde499F7609F7d52D815B1E60b95c");
  // console.log(balance.toString());

  // const balance2 = await provider.getBalance("0xCF1613E057A159406d64BE5B8F8793F2ee9cAFC2");
  // console.log(balance2.toString());
  for (let i = 0; i < 10; i++) {
    const block = await provider.getBlockWithTransactions(i);
    console.log(block);
  }
};

main();
