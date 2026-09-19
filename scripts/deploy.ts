import { network } from "hardhat";

const { viem } = await network.connect();

const wallets = await viem.getWalletClients();
const deployer = wallets[0];

const recipient1 = deployer.account.address;
const recipient2 = deployer.account.address;
console.log("Deployer:", deployer.account.address);
console.log("Recipient 1:", recipient1);
console.log("Recipient 2:", recipient2);

const arcSplit = await viem.deployContract("ArcSplit", [
  [recipient1, recipient2],
  [7000n, 3000n],
]);

console.log("ArcSplit deployed at:", arcSplit.address);