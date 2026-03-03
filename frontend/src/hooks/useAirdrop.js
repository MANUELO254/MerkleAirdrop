import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { hexToSignature, parseGwei } from 'viem'
import { AIRDROP_ADDRESS, AIRDROP_ABI, TOKEN_ABI, TOKEN_ADDRESS, CLAIM_AMOUNT, MERKLE_PROOFS } from '../config/contracts'

export function useHasClaimed(address) {
  return useReadContract({
    address: AIRDROP_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: 's_hasClaimed',
    args: [address],
    query: { enabled: !!address },
  })
}

export function useTokenBalance(address) {
  return useReadContract({
    address: TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address },
  })
}

export function useIsEligible(address) {
  if (!address) return false
  return Object.keys(MERKLE_PROOFS).some(
    a => a.toLowerCase() === address.toLowerCase()
  )
}

export function useClaimAirdrop() {
  const { writeContractAsync, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    timeout: 120_000,
  })

  const claim = async (address, gasLevel = 'normal') => {
    const proof = MERKLE_PROOFS[
      Object.keys(MERKLE_PROOFS).find(a => a.toLowerCase() === address.toLowerCase())
    ]

    if (!window.ethereum) {
      throw new Error('MetaMask not found. Please install MetaMask and refresh.')
    }

    // Sign directly via window.ethereum — bypasses WalletConnect entirely
    const msgParams = JSON.stringify({
      domain: {
        name: 'MerkleAirdrop',
        version: '1',
        chainId: 11155111,
        verifyingContract: AIRDROP_ADDRESS,
      },
      message: {
        account: address,
        amount:  CLAIM_AMOUNT.toString(),
      },
      primaryType: 'AirdropClaim',
      types: {
        EIP712Domain: [
          { name: 'name',              type: 'string'  },
          { name: 'version',           type: 'string'  },
          { name: 'chainId',           type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        AirdropClaim: [
          { name: 'account', type: 'address' },
          { name: 'amount',  type: 'uint256' },
        ],
      },
    })

    // This directly triggers the MetaMask popup — no WalletConnect involved
    const signature = await window.ethereum.request({
      method: 'eth_signTypedData_v4',
      params: [address, msgParams],
    })

    const { v, r, s } = hexToSignature(signature)

    const gasSettings = {
      normal:  { maxFeePerGas: parseGwei('20'), maxPriorityFeePerGas: parseGwei('1')  },
      fast:    { maxFeePerGas: parseGwei('40'), maxPriorityFeePerGas: parseGwei('5')  },
      instant: { maxFeePerGas: parseGwei('80'), maxPriorityFeePerGas: parseGwei('10') },
    }

    await writeContractAsync({
      address: AIRDROP_ADDRESS,
      abi: AIRDROP_ABI,
      functionName: 'claim',
      args: [address, CLAIM_AMOUNT, proof, Number(v), r, s],
      ...gasSettings[gasLevel],
    })
  }

  return { claim, txHash, isPending, isConfirming, isSuccess }
}