import { network } from "hardhat";
import fs from "node:fs";

const { viem } = await network.connect();

const recipients = JSON.parse(
  fs.readFileSync("./recipients.json", "utf8")
);

const wallets = await viem.getWalletClients();
const deployer = wallets[0];

console.log("Deployer:", deployer.account.address);
console.log("Recipient 1:", recipients.recipient1);
console.log("Recipient 2:", recipients.recipient2);

const arcSplit = await viem.deployContract("ArcSplit", [
  [recipients.recipient1, recipients.recipient2],
  [7000n, 3000n],
]);

console.log("Test ArcSplit deployed at:", arcSplit.address);