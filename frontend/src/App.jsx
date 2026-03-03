import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useHasClaimed, useIsEligible, useClaimAirdrop, useTokenBalance } from './hooks/useAirdrop'
import { formatUnits } from 'viem'

const ETHERSCAN  = 'https://sepolia.etherscan.io'
const AIRDROP_ADDR = '0x4e6aE7306E418d241A5B608F9e3A68aA49aCb3ac'
const TOKEN_ADDR   = '0x9A02A0105D22c46AB7976e27d1b5521cbC727302'

function TxLink({ hash }) {
  const url   = ETHERSCAN + '/tx/' + hash
  const label = hash.slice(0, 10) + '...' + hash.slice(-8)
  return (
    <div className="tx-box">
      <span>Tx</span>
      <a href={url} target="_blank" rel="noreferrer">{label}</a>
    </div>
  )
}

function InfoCard({ label, value, link }) {
  return (
    <div className="info-card">
      <div className="info-label">{label}</div>
      <div className="info-value">
        {link
          ? <a href={link} target="_blank" rel="noreferrer">{value}</a>
          : value
        }
      </div>
    </div>
  )
}

const GAS_OPTIONS = [
  { key: 'normal',  label: 'Normal',  sub: '~30s' },
  { key: 'fast',    label: 'Fast',    sub: '~10s' },
  { key: 'instant', label: 'Instant', sub: '~5s'  },
]

export default function App() {
  const { address, isConnected } = useAccount()
  const isEligible  = useIsEligible(address)
  const { data: hasClaimed } = useHasClaimed(address)
  const { data: balance }    = useTokenBalance(address)
  const { claim, txHash, isPending, isConfirming, isSuccess } = useClaimAirdrop()
  const [error,    setError]    = useState(null)
  const [gasLevel, setGasLevel] = useState('normal')

  const handleClaim = async () => {
    setError(null)
    try {
      await claim(address, gasLevel)
    } catch (e) {
      setError(e.shortMessage || e.message)
    }
  }

  let statusLabel = 'Connect your wallet to check eligibility'
  let statusType  = 'idle'

  if (isConnected) {
    if (hasClaimed)        { statusLabel = 'Already claimed — tokens are in your wallet'; statusType = 'success' }
    else if (isSuccess)    { statusLabel = 'Claim confirmed!';                             statusType = 'success' }
    else if (isConfirming) { statusLabel = 'Waiting for confirmation...';                  statusType = 'pending' }
    else if (isPending)    { statusLabel = 'Sign the message in your wallet...';           statusType = 'pending' }
    else if (!isEligible)  { statusLabel = 'This address is not eligible';                 statusType = 'error'   }
    else                   { statusLabel = 'Eligible — ready to claim 25 BGEL';            statusType = 'success' }
  }

  let btnLabel = 'Claim 25 BGEL'
  if (isPending)    btnLabel = 'Signing...'
  if (isConfirming) btnLabel = 'Confirming...'
  if (isSuccess)    btnLabel = 'Claimed'
  if (hasClaimed)   btnLabel = 'Already Claimed'

  const btnDisabled = !isEligible || hasClaimed || isPending || isConfirming || isSuccess

  const formattedBalance = balance !== undefined
    ? parseFloat(formatUnits(balance, 18)).toFixed(2)
    : null

  const infoCards = [
    { label: 'Airdrop Contract', value: '0x4e6aE7...Cb3ac', link: ETHERSCAN + '/address/' + AIRDROP_ADDR },
    { label: 'Token Contract',   value: '0x9A02A0...7302',  link: ETHERSCAN + '/address/' + TOKEN_ADDR  },
    { label: 'Total Supply',     value: '100 BGEL' },
    { label: 'Network',          value: 'Sepolia Testnet' },
  ]

  return (
    <div className="app">
      <header>
        <div className="logo">Bagel<span>/</span>Drop</div>
        <ConnectButton chainStatus="icon" showBalance={false} />
      </header>

      <main>
        <div className="hero">
          <p className="tag">Merkle Airdrop — Season 01</p>
          <h1>Claim Your<br /><span>Bagels.</span></h1>
          <p className="desc">
            25 BGEL tokens per eligible wallet. Verified via
            Merkle proof + EIP-712 signature on Sepolia.
          </p>
        </div>

        <div className="card">
          <div className="card-top">
            <span className="card-label">Your Allocation</span>
            <div className="amount">25 <span>BGEL</span></div>
          </div>

          {isConnected && (
            <div className="wallet-info">
              <div className="info-row">
                <span>Wallet</span>
                <span className="mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
              </div>
              {formattedBalance !== null && (
                <div className="info-row">
                  <span>Current Balance</span>
                  <span className="mono">{formattedBalance} BGEL</span>
                </div>
              )}
            </div>
          )}

          <div className={'status ' + statusType}>{statusLabel}</div>

          {error && (
            <div className="status error">{error}</div>
          )}

          {txHash && <TxLink hash={txHash} />}

          {!isConnected
            ? (
              <div className="connect-wrap">
                <ConnectButton label="Connect Wallet to Claim" />
              </div>
            )
            : (
              <div>
                <div className="gas-selector">
                  <div className="gas-label">Gas Speed</div>
                  <div className="gas-options">
                    {GAS_OPTIONS.map(function(opt) {
                      return (
                        <button
                          key={opt.key}
                          className={'gas-btn' + (gasLevel === opt.key ? ' active' : '')}
                          onClick={function() { setGasLevel(opt.key) }}
                          disabled={btnDisabled}
                        >
                          <span>{opt.label}</span>
                          <span className="gas-sub">{opt.sub}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button
                  className="claim-btn"
                  onClick={handleClaim}
                  disabled={btnDisabled}
                >
                  {btnLabel}
                </button>
              </div>
            )
          }
        </div>

        <div className="info-grid">
          {infoCards.map(function(card) {
            return (
              <InfoCard
                key={card.label}
                label={card.label}
                value={card.value}
                link={card.link}
              />
            )
          })}
        </div>
      </main>
    </div>
  )
}