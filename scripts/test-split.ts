import { network } from "hardhat";

const { viem } = await network.connect();

const wallets = await viem.getWalletClients();
const payer = wallets[0];

const mockUSDC = await viem.getContractAt(
  "MockUSDC",
  "0xb7d54b444a0601325e6c606c3d6b9897002c25bf"
);

const arcSplit = await viem.getContractAt(
  "ArcSplit",
  "0x3efd9bbe0462a0ecfc6730ea0948ad8ff5d81315"
);

const recipient1 = "0xf49b17D5E4c35CBBAC93940E3E494555a1019b0d";
const recipient2 = "0x3984bC58e7F4D4c9502ab4AE4D25E99F00747533";

const amount = 1_000_000n; // 1 mUSDC

const before1 = await mockUSDC.read.balanceOf([recipient1]);
const before2 = await mockUSDC.read.balanceOf([recipient2]);

console.log("Recipient 1 before:", before1.toString());
console.log("Recipient 2 before:", before2.toString());

const approvalHash = await mockUSDC.write.approve(
  [arcSplit.address, amount],
  {
    account: payer.account,
  }
);

const publicClient = await viem.getPublicClient();

await publicClient.waitForTransactionReceipt({
  hash: approvalHash,
});

console.log("Approval confirmed.");

const splitHash = await arcSplit.write.splitPayment(
  [mockUSDC.address, amount],
  {
    account: payer.account,
  }
);

const receipt = await publicClient.waitForTransactionReceipt({
  hash: splitHash,
});

console.log("Split transaction hash:", splitHash);
console.log("Split receipt status:", receipt.status);

console.log("Split transaction hash:", splitHash);
console.log("Split receipt status:", receipt.status);

const transferLogs = await publicClient.getContractEvents({
  address: mockUSDC.address,
  abi: [
    {
      type: "event",
      name: "Transfer",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          name: "to",
          type: "address",
        },
        {
          indexed: false,
          name: "value",
          type: "uint256",
        },
      ],
    },
  ],
  fromBlock: receipt.blockNumber,
  toBlock: receipt.blockNumber,
});

console.log("Transfer events:");

for (const log of transferLogs) {
  console.log({
    from: log.args.from,
    to: log.args.to,
    value: log.args.value?.toString(),
  });
}
const configuredRecipients = await arcSplit.read.getRecipients();

console.log("Configured recipients:", configuredRecipients);
console.log(
  "Payer balance:",
  (await mockUSDC.read.balanceOf([payer.account.address])).toString()
);
console.log(
  "ArcSplit balance:",
  (await mockUSDC.read.balanceOf([arcSplit.address])).toString()
);

const after1 = await mockUSDC.read.balanceOf([recipient1]);
const after2 = await mockUSDC.read.balanceOf([recipient2]);

console.log("Recipient 1 after:", after1.toString());
console.log("Recipient 2 after:", after2.toString());

console.log("Recipient 1 received:", (after1 - before1).toString());
console.log("Recipient 2 received:", (after2 - before2).toString());