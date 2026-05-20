'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

type WalletFieldKey = 'evm_wallet_address' | 'solana_wallet_address'
type WalletAddressesState = Record<WalletFieldKey, string>

interface WalletAddressesFormProps {
  onWalletsUpdated?: (wallets: WalletAddressesState) => void
}

const defaultState: WalletAddressesState = {
  evm_wallet_address: '',
  solana_wallet_address: '',
}

export default function WalletAddressesForm({ onWalletsUpdated }: WalletAddressesFormProps) {
  const [wallets, setWallets] = useState<WalletAddressesState>({ ...defaultState })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const hasAnyValue = Object.values(wallets).some((value) => value.trim().length > 0)

  useEffect(() => {
    const fetchWallets = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch('/api/wallets')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load wallet addresses')
        }

        if (data.wallets) {
          setWallets({
            evm_wallet_address: data.wallets.evm_wallet_address ?? '',
            solana_wallet_address: data.wallets.solana_wallet_address ?? '',
          })
        }
      } catch (err) {
        console.error('Error fetching wallet addresses:', err)
        setError(err instanceof Error ? err.message : 'An error occurred while loading wallet addresses')
      } finally {
        setLoading(false)
      }
    }

    fetchWallets()
  }, [])

  const handleChange = (field: WalletFieldKey) => (event: ChangeEvent<HTMLInputElement>) => {
    setWallets((prev) => ({ ...prev, [field]: event.target.value }))
    setSuccess('')
    setError('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    const payload = (Object.keys(wallets) as WalletFieldKey[]).reduce<Record<string, string>>(
      (acc, key) => {
        acc[key] = wallets[key].trim()
        return acc
      },
      {},
    )

    try {
      const response = await fetch('/api/wallets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update wallet addresses')
      }

      const updatedWallets: WalletAddressesState = {
        evm_wallet_address: data.wallets.evm_wallet_address ?? '',
        solana_wallet_address: data.wallets.solana_wallet_address ?? '',
      }
      setWallets(updatedWallets)
      setSuccess('Wallet addresses updated successfully!')
      onWalletsUpdated?.(updatedWallets)
    } catch (err) {
      console.error('Error updating wallet addresses:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while updating wallet addresses')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Wallet Addresses</CardTitle>
        <CardDescription>Add your cryptocurrency wallet addresses</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-56" />
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="evm_wallet_address">EVM Wallet Address</Label>
              <Input
                id="evm_wallet_address"
                value={wallets.evm_wallet_address}
                onChange={handleChange('evm_wallet_address')}
                placeholder="0x…"
                disabled={submitting}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Ethereum, Polygon, BSC, and other EVM-compatible chains
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="solana_wallet_address">Solana Wallet Address</Label>
              <Input
                id="solana_wallet_address"
                value={wallets.solana_wallet_address}
                onChange={handleChange('solana_wallet_address')}
                placeholder="Enter your Solana wallet address"
                disabled={submitting}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">Your Solana (SOL) wallet address</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Saving…' : 'Save Wallet Addresses'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setWallets({ ...defaultState })
                  setSuccess('')
                  setError('')
                }}
                disabled={submitting || !hasAnyValue}
              >
                Clear
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
