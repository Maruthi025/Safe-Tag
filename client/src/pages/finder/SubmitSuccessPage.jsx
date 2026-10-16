import { useLocation, Link } from 'react-router-dom'
import { CheckCircle, Copy } from 'lucide-react'
import { useState } from 'react'

export default function SubmitSuccessPage() {
  const { state } = useLocation()
  const reference = state?.reference || 'ST-REPORT'
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(reference)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
          <CheckCircle className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h1>
        <p className="text-gray-600 text-sm mb-6">
          Thank you for being a good samaritan. Our matching service is now checking for registered owners.
        </p>
        <div className="card mb-6 text-left">
          <p className="text-xs text-gray-500 mb-1">Your report reference number:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-sm font-bold text-brand-800 bg-brand-50 px-3 py-2 rounded-lg border border-brand-100">{reference}</code>
            <button onClick={copy} className="btn-secondary p-2" title="Copy">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          {copied && <p className="text-emerald-600 text-xs mt-1">Copied to clipboard!</p>}
        </div>
        <Link to="/" className="btn-primary inline-flex">Return to Home</Link>
      </div>
    </div>
  )
}