import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import fs from "node:fs";

const privateKey1 = generatePrivateKey();
const privateKey2 = generatePrivateKey();

const recipient1 = privateKeyToAccount(privateKey1);
const recipient2 = privateKeyToAccount(privateKey2);

const data = {
  recipient1: recipient1.address,
  recipient2: recipient2.address,
};

fs.writeFileSync(
  "./recipients.json",
  JSON.stringify(data, null, 2)
);

console.log("Recipient 1:", recipient1.address);
console.log("Recipient 2:", recipient2.address);
console.log("Saved to recipients.json");