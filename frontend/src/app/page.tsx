"use client";

import { useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  parseUnits,
} from "viem";

import { ARC_TESTNET, ARCSPLIT_ADDRESS, MOCK_USDC_ADDRESS } from "@/config";
import { ARC_SPLIT_ABI, ERC20_ABI } from "@/abi";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Home() {
  const [address, setAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("1");
  const [status, setStatus] = useState<string>("");
  const [approvalHash, setApprovalHash] = useState<string>("");
  const [splitHash, setSplitHash] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus("No compatible wallet found.");
      return;
    }

    try {
      setStatus("Connecting...");

      const walletClient = createWalletClient({
        chain: ARC_TESTNET,
        transport: custom(window.ethereum),
      });

      await walletClient.switchChain({
        id: ARC_TESTNET.id,
      });

      const [account] = await walletClient.requestAddresses();

      setAddress(account);
      setStatus("Connected to Arc Testnet.");
    } catch (error) {
      console.error(error);
      setStatus("Wallet connection failed.");
    }
  }

  async function approveToken() {
    if (!address) {
      setStatus("Connect your wallet first.");
      return;
    }

    if (!window.ethereum) {
      setStatus("No compatible wallet found.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Waiting for approval confirmation...");
      setApprovalHash("");

      const walletClient = createWalletClient({
        chain: ARC_TESTNET,
        transport: custom(window.ethereum),
      });

      const publicClient = createPublicClient({
        chain: ARC_TESTNET,
        transport: http(),
      });

      const amountInUnits = parseUnits(amount, 6);

      const hash = await walletClient.writeContract({
        address: MOCK_USDC_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [ARCSPLIT_ADDRESS as `0x${string}`, amountInUnits],
        account: address as `0x${string}`,
      });

      setApprovalHash(hash);

      await publicClient.waitForTransactionReceipt({
        hash,
      });

      setStatus("Approval confirmed.");
    } catch (error) {
      console.error(error);
      setStatus("Approval failed.");
    } finally {
      setLoading(false);
    }
  }

  async function splitPayment() {
    if (!address) {
      setStatus("Connect your wallet first.");
      return;
    }

    if (!window.ethereum) {
      setStatus("No compatible wallet found.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Waiting for split transaction confirmation...");
      setSplitHash("");

      const walletClient = createWalletClient({
        chain: ARC_TESTNET,
        transport: custom(window.ethereum),
      });

      const publicClient = createPublicClient({
        chain: ARC_TESTNET,
        transport: http(),
      });

      const amountInUnits = parseUnits(amount, 6);

      const hash = await walletClient.writeContract({
        address: ARCSPLIT_ADDRESS as `0x${string}`,
        abi: ARC_SPLIT_ABI,
        functionName: "splitPayment",
        args: [MOCK_USDC_ADDRESS as `0x${string}`, amountInUnits],
        account: address as `0x${string}`,
      });

      setSplitHash(hash);

      await publicClient.waitForTransactionReceipt({
        hash,
      });

      setStatus("Split payment successful.");
    } catch (error) {
      console.error(error);
      setStatus("Split payment failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <h1 className="text-3xl font-bold">ArcSplit</h1>

        <p className="mt-2 text-gray-400">
          Split USDC payments automatically on Arc Testnet.
        </p>

        <button
          onClick={connectWallet}
          disabled={loading}
          className="mt-8 w-full rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-gray-200 disabled:opacity-50"
        >
          {address ? "Wallet Connected" : "Connect Wallet"}
        </button>

        {address && (
          <div className="mt-6 rounded-xl bg-black/40 p-4">
            <p className="text-sm text-gray-400">
              Connected wallet
            </p>

            <p className="mt-1 break-all font-mono text-sm">
              {address}
            </p>
          </div>
        )}

        <div className="mt-6">
          <label className="text-sm text-gray-400">
            Amount (mUSDC)
          </label>

          <input
            type="number"
            min="0"
            step="0.000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-white/30"
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={approveToken}
            disabled={!address || loading}
            className="rounded-xl border border-white/20 px-5 py-3 font-semibold hover:bg-white/10 disabled:opacity-50"
          >
            Approve mUSDC
          </button>

          <button
            onClick={splitPayment}
            disabled={!address || loading}
            className="rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-gray-200 disabled:opacity-50"
          >
            Split Payment
          </button>
        </div>

        {status && (
          <div className="mt-6 rounded-xl bg-black/40 p-4">
            <p className="text-sm text-gray-300">
              {status}
            </p>
          </div>
        )}

        {approvalHash && (
          <div className="mt-4 rounded-xl bg-black/40 p-4">
            <p className="text-xs text-gray-500">
              Approval transaction
            </p>
            <p className="mt-1 break-all font-mono text-xs text-gray-400">
              {approvalHash}
            </p>
          </div>
        )}

        {splitHash && (
          <div className="mt-4 rounded-xl bg-black/40 p-4">
            <p className="text-xs text-gray-500">
              Split transaction
            </p>
            <p className="mt-1 break-all font-mono text-xs text-gray-400">
              {splitHash}
            </p>
          </div>
        )}

        <div className="mt-8 border-t border-white/10 pt-5 text-xs text-gray-500">
          <p>Arc Testnet</p>
          <p className="mt-1">
            Split: 70% / 30%
          </p>
        </div>
      </div>
    </main>
  );
}