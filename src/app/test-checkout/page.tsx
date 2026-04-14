'use client'

import { useState } from 'react'

export default function TestCheckout() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      })

      if (!response.ok) {
        const { error: apiError } = await response.json()
        setError(apiError || 'Failed to create checkout session')
        return
      }

      const { url } = await response.json()

      if (!url) {
        setError('No checkout URL returned')
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (err) {
      setError('Something went wrong')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Test Stripe Checkout
        </h1>
        <p className="text-white/60 mb-6">
          Testing Renamify Pro subscription
        </p>
        
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80">Renamify Pro</span>
            <span className="text-2xl font-bold text-white">$19/mo</span>
          </div>
          <ul className="text-sm text-white/60 space-y-1">
            <li>✓ Unlimited images</li>
            <li>✓ Unlimited projects</li>
            <li>✓ 10 saved templates</li>
            <li>✓ RAW processing</li>
            <li>✓ AI suggestions</li>
          </ul>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {loading ? 'Loading...' : 'Start Free Trial'}
        </button>

        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-sm text-yellow-200/80 font-medium mb-2">
            🧪 Test Mode
          </p>
          <p className="text-xs text-yellow-200/60 mb-2">
            Use this test card:
          </p>
          <div className="font-mono text-xs text-white bg-black/30 p-2 rounded">
            Card: 4242 4242 4242 4242<br />
            Expiry: 12/34<br />
            CVC: 123<br />
            ZIP: 12345
          </div>
        </div>

        <p className="mt-4 text-xs text-white/40 text-center">
          This is a test page. Real charges will not be made.
        </p>
      </div>
    </div>
  )
}
