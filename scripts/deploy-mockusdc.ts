import { network } from "hardhat";

const { viem } = await network.connect();

const token = await viem.deployContract("MockUSDC", []);

console.log("MockUSDC deployed at:", token.address);