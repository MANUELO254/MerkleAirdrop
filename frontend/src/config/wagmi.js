import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { metaMaskWallet, injectedWallet } from '@rainbow-me/rainbowkit/wallets'
import { sepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'BagelDrop',
  projectId: 'adb7db3fddf5f54bc4675d3012ca54db',
  chains: [sepolia],
  wallets: [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, injectedWallet],
    },
  ],
})