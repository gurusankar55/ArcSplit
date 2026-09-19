import { network } from "hardhat";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("ArcSplit", async function () {
  const { viem } = await network.connect();

  it("should deploy with valid 70/30 shares", async function () {
    const wallets = await viem.getWalletClients();

    const recipient1 = wallets[1];
    const recipient2 = wallets[2];

    const contract = await viem.deployContract("ArcSplit", [
      [recipient1.account.address, recipient2.account.address],
      [7000n, 3000n],
    ]);

    const count = await contract.read.recipientCount();

    assert.equal(count, 2n);
  });

  it("should reject shares that do not equal 100%", async function () {
    const wallets = await viem.getWalletClients();

    const recipient1 = wallets[1];
    const recipient2 = wallets[2];

    await assert.rejects(
      viem.deployContract("ArcSplit", [
        [recipient1.account.address, recipient2.account.address],
        [6000n, 3000n],
      ])
    );
  });

  it("should return configured recipients", async function () {
    const wallets = await viem.getWalletClients();

    const recipient1 = wallets[1];
    const recipient2 = wallets[2];

    const contract = await viem.deployContract("ArcSplit", [
      [recipient1.account.address, recipient2.account.address],
      [5000n, 5000n],
    ]);

    const recipients = await contract.read.getRecipients();

    assert.equal(recipients.length, 2);

    assert.equal(
      recipients[0].wallet.toLowerCase(),
      recipient1.account.address.toLowerCase()
    );

    assert.equal(recipients[0].share, 5000n);

    assert.equal(
      recipients[1].wallet.toLowerCase(),
      recipient2.account.address.toLowerCase()
    );

    assert.equal(recipients[1].share, 5000n);
  });

  it("should split USDC 70/30 between recipients", async function () {
    const wallets = await viem.getWalletClients();

    const payer = wallets[0];
    const recipient1 = wallets[1];
    const recipient2 = wallets[2];

    const token = await viem.deployContract("MockUSDC", []);

    const split = await viem.deployContract("ArcSplit", [
      [recipient1.account.address, recipient2.account.address],
      [7000n, 3000n],
    ]);

    const amount = 1_000_000n; // 1 USDC

    await token.write.approve(
      [split.address, amount],
      {
        account: payer.account,
      }
    );

    const before1 = await token.read.balanceOf([
      recipient1.account.address,
    ]);

    const before2 = await token.read.balanceOf([
      recipient2.account.address,
    ]);

    await split.write.splitPayment(
      [token.address, amount],
      {
        account: payer.account,
      }
    );

    const after1 = await token.read.balanceOf([
      recipient1.account.address,
    ]);

    const after2 = await token.read.balanceOf([
      recipient2.account.address,
    ]);

    assert.equal(after1 - before1, 700_000n);
    assert.equal(after2 - before2, 300_000n);
  });

  it("should reject zero amount", async function () {
    const wallets = await viem.getWalletClients();

    const payer = wallets[0];
    const recipient1 = wallets[1];
    const recipient2 = wallets[2];

    const token = await viem.deployContract("MockUSDC", []);

    const split = await viem.deployContract("ArcSplit", [
      [recipient1.account.address, recipient2.account.address],
      [7000n, 3000n],
    ]);

    await assert.rejects(
      split.write.splitPayment(
        [token.address, 0n],
        {
          account: payer.account,
        }
      )
    );
  });

  it("should reject zero token address", async function () {
    const wallets = await viem.getWalletClients();

    const payer = wallets[0];
    const recipient1 = wallets[1];
    const recipient2 = wallets[2];

    const split = await viem.deployContract("ArcSplit", [
      [recipient1.account.address, recipient2.account.address],
      [7000n, 3000n],
    ]);

    await assert.rejects(
      split.write.splitPayment(
        ["0x0000000000000000000000000000000000000000", 1_000_000n],
        {
          account: payer.account,
        }
      )
    );
  });

  it("should reject splitPayment without token approval", async function () {
    const wallets = await viem.getWalletClients();

    const payer = wallets[0];
    const recipient1 = wallets[1];
    const recipient2 = wallets[2];

    const token = await viem.deployContract("MockUSDC", []);

    const split = await viem.deployContract("ArcSplit", [
      [recipient1.account.address, recipient2.account.address],
      [7000n, 3000n],
    ]);

    await assert.rejects(
      split.write.splitPayment(
        [token.address, 1_000_000n],
        {
          account: payer.account,
        }
      )
    );
  });
    it("should reject zero address recipient", async function () {
    const wallets = await viem.getWalletClients();

    const recipient1 = wallets[1];

    await assert.rejects(
      viem.deployContract("ArcSplit", [
        [
          "0x0000000000000000000000000000000000000000",
          recipient1.account.address,
        ],
        [7000n, 3000n],
      ])
    );
  });
    it("should reject zero recipient share", async function () {
    const wallets = await viem.getWalletClients();

    const recipient1 = wallets[1];
    const recipient2 = wallets[2];

    await assert.rejects(
      viem.deployContract("ArcSplit", [
        [recipient1.account.address, recipient2.account.address],
        [0n, 10_000n],
      ])
    );
  });
    it("should support a single recipient with 100% share", async function () {
    const wallets = await viem.getWalletClients();

    const payer = wallets[0];
    const recipient = wallets[1];

    const token = await viem.deployContract("MockUSDC", []);

    const split = await viem.deployContract("ArcSplit", [
      [recipient.account.address],
      [10_000n],
    ]);

    const amount = 1_000_000n;

    await token.write.approve(
      [split.address, amount],
      {
        account: payer.account,
      }
    );

    const before = await token.read.balanceOf([
      recipient.account.address,
    ]);

    await split.write.splitPayment(
      [token.address, amount],
      {
        account: payer.account,
      }
    );

    const after = await token.read.balanceOf([
      recipient.account.address,
    ]);

    assert.equal(after - before, amount);
  });
    it("should rollback the entire split if a recipient transfer fails", async function () {
    const wallets = await viem.getWalletClients();

    const payer = wallets[0];
    const recipient1 = wallets[1];
    const recipient2 = wallets[2];

    const token = await viem.deployContract("MockFailToken", []);

    const split = await viem.deployContract("ArcSplit", [
      [recipient1.account.address, recipient2.account.address],
      [7000n, 3000n],
    ]);

    const amount = 1_000_000n;

    await token.write.approve(
      [split.address, amount],
      {
        account: payer.account,
      }
    );

    await token.write.setBlockedRecipient(
      [recipient2.account.address],
      {
        account: payer.account,
      }
    );

    const before1 = await token.read.balanceOf([
      recipient1.account.address,
    ]);

    const before2 = await token.read.balanceOf([
      recipient2.account.address,
    ]);

    await assert.rejects(
      split.write.splitPayment(
        [token.address, amount],
        {
          account: payer.account,
        }
      )
    );

    const after1 = await token.read.balanceOf([
      recipient1.account.address,
    ]);

    const after2 = await token.read.balanceOf([
      recipient2.account.address,
    ]);

    assert.equal(after1, before1);
    assert.equal(after2, before2);
  });
    it("should emit PaymentSplit event with correct values", async function () {
    const wallets = await viem.getWalletClients();

    const payer = wallets[0];
    const recipient1 = wallets[1];
    const recipient2 = wallets[2];

    const token = await viem.deployContract("MockUSDC", []);

    const split = await viem.deployContract("ArcSplit", [
      [recipient1.account.address, recipient2.account.address],
      [7000n, 3000n],
    ]);

    const amount = 1_000_000n;

    await token.write.approve(
      [split.address, amount],
      {
        account: payer.account,
      }
    );

    const hash = await split.write.splitPayment(
      [token.address, amount],
      {
        account: payer.account,
      }
    );

    const publicClient = await viem.getPublicClient();

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
    });

    const logs = await publicClient.getContractEvents({
      address: split.address,
      abi: split.abi,
      eventName: "PaymentSplit",
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });

    assert.equal(logs.length, 1);

    assert.equal(
      logs[0].args.payer?.toLowerCase(),
      payer.account.address.toLowerCase()
    );

    assert.equal(
      logs[0].args.token?.toLowerCase(),
      token.address.toLowerCase()
    );

    assert.equal(logs[0].args.amount, amount);
  });
    it("should split payment correctly among three recipients", async function () {
    const wallets = await viem.getWalletClients();

    const payer = wallets[0];
    const recipient1 = wallets[1];
    const recipient2 = wallets[2];
    const recipient3 = wallets[3];

    const token = await viem.deployContract("MockUSDC", []);

    const split = await viem.deployContract("ArcSplit", [
      [
        recipient1.account.address,
        recipient2.account.address,
        recipient3.account.address,
      ],
      [5000n, 3000n, 2000n],
    ]);

    const amount = 1_000_000n;

    await token.write.approve(
      [split.address, amount],
      {
        account: payer.account,
      }
    );

    const before1 = await token.read.balanceOf([
      recipient1.account.address,
    ]);

    const before2 = await token.read.balanceOf([
      recipient2.account.address,
    ]);

    const before3 = await token.read.balanceOf([
      recipient3.account.address,
    ]);

    await split.write.splitPayment(
      [token.address, amount],
      {
        account: payer.account,
      }
    );

    const after1 = await token.read.balanceOf([
      recipient1.account.address,
    ]);

    const after2 = await token.read.balanceOf([
      recipient2.account.address,
    ]);

    const after3 = await token.read.balanceOf([
      recipient3.account.address,
    ]);

    assert.equal(after1 - before1, 500_000n);
    assert.equal(after2 - before2, 300_000n);
    assert.equal(after3 - before3, 200_000n);
  });
    it("should assign rounding remainder to the last recipient", async function () {
    const wallets = await viem.getWalletClients();

    const payer = wallets[0];
    const recipient1 = wallets[1];
    const recipient2 = wallets[2];

    const token = await viem.deployContract("MockUSDC", []);

    const split = await viem.deployContract("ArcSplit", [
      [recipient1.account.address, recipient2.account.address],
      [7000n, 3000n],
    ]);

    const amount = 1_000_001n;

    await token.write.approve(
      [split.address, amount],
      {
        account: payer.account,
      }
    );

    const before1 = await token.read.balanceOf([
      recipient1.account.address,
    ]);

    const before2 = await token.read.balanceOf([
      recipient2.account.address,
    ]);

    await split.write.splitPayment(
      [token.address, amount],
      {
        account: payer.account,
      }
    );

    const after1 = await token.read.balanceOf([
      recipient1.account.address,
    ]);

    const after2 = await token.read.balanceOf([
      recipient2.account.address,
    ]);

    assert.equal(after1 - before1, 700_000n);
    assert.equal(after2 - before2, 300_001n);
    assert.equal(
      (after1 - before1) + (after2 - before2),
      amount
    );
  });
});