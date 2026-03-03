export const AIRDROP_ADDRESS = '0x4e6aE7306E418d241A5B608F9e3A68aA49aCb3ac'
export const TOKEN_ADDRESS   = '0x9A02A0105D22c46AB7976e27d1b5521cbC727302'
export const CLAIM_AMOUNT    = BigInt('25000000000000000000') // 25 * 1e18

// Merkle proofs per address — from your output.json
export const MERKLE_PROOFS = {
  '0x9fDBBe3bB33882c4289189BC301017078430a934': [
    '0xd333253c1fca73d001c7ae7dd4aa0ac2b44f2edf384421a3d4337edc424447c3',
    '0x0fb85f7b6df160de3a55fbbc3757e1166f70d574c0b5520e22040ad2b88d7a5d',
  ],
  '0x1Db3439a222C519ab44bb1144fC28167b4Fa6EE6': [
    '0x91a59fba866ab3ad8b5f47873254651f8ffcecd734c6a55326001c81f2b97512',
    '0xb722829fe2948f781e9b4e03d2393af7b978987926ff57812f969a7e8ffd2fd8',
  ],
  '0x0e466e7519A469f20168796a0807b758a2339791': [
    '0x2bc7bc0f0e2cc6b4f349fb598317c83fd701f46a2f104f6fdb44af1683572746',
    '0xb722829fe2948f781e9b4e03d2393af7b978987926ff57812f969a7e8ffd2fd8',
  ],
}

export const AIRDROP_ABI = [
  {
    name: 'claim',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_account',     type: 'address'    },
      { name: '_amount',      type: 'uint256'    },
      { name: 'merkleProof',  type: 'bytes32[]'  },
      { name: 'v',            type: 'uint8'      },
      { name: 'r',            type: 'bytes32'    },
      { name: 's',            type: 'bytes32'    },
    ],
    outputs: [],
  },
  {
    name: 'getMessageHash',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'amount',  type: 'uint256' },
    ],
    outputs: [{ type: 'bytes32' }],
  },
  {
    name: 's_hasClaimed',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ type: 'bool' }],
  },
]

export const TOKEN_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
]