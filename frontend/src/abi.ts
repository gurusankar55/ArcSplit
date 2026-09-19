export const ARC_SPLIT_ABI = [
  {
    type: "function",
    name: "splitPayment",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "token",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getRecipients",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          {
            name: "wallet",
            type: "address",
          },
          {
            name: "share",
            type: "uint256",
          },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "recipientCount",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    type: "event",
    name: "PaymentSplit",
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "payer",
        type: "address",
      },
      {
        indexed: true,
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        name: "amount",
        type: "uint256",
      },
    ],
  },
] as const;

export const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "spender",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      {
        name: "owner",
        type: "address",
      },
      {
        name: "spender",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [
      {
        name: "account",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
      },
    ],
  },
] as const;