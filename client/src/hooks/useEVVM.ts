import { useState, useEffect } from 'react'
import { Core, createSignerWithViem } from '@evvm/evvm-js'
import { useWalletClient } from 'wagmi'

export function useEVVM() {
  const { data: walletClient } = useWalletClient()
  const [core, setCore] = useState<Core | null>(null)

  useEffect(() => {
    async function initCore() {
      if (!walletClient) {
        setCore(null)
        return
      }

      try {
        const signer = await createSignerWithViem(
          walletClient as unknown as Parameters<typeof createSignerWithViem>[0]
        )
        const evvmCore = new Core({
          signer,
          address: import.meta.env.VITE_EVVM_CONTRACT_ADDRESS,
          chainId: walletClient.chain.id,
        })
        setCore(evvmCore)
      } catch {
        setCore(null)
      }
    }

    initCore()
  }, [walletClient])

  return core
}
