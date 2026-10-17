import { useLocation, Link } from 'react-router-dom'
import { CheckCircle, Copy, Clock, ListChecks, ArrowRight, Eye } from 'lucide-react'
import { useState } from 'react'

export default function SubmitSuccessPage() {
  const { state } = useLocation()
  const reference = state?.reference || 'ST-REPORT'
  const item = state?.item
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
          Thank you for being a good samaritan. Your found item report has been securely saved and is now being matched against owner reports.
        </p>

        <div className="card mb-6 text-left space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Your Report Reference Number:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-sm font-bold text-brand-800 bg-brand-50 px-3 py-2 rounded-lg border border-brand-100">{reference}</code>
              <button onClick={copy} className="btn-secondary p-2" title="Copy">
                <Copy className="h-4 w-4" />
              </button>
            </div>
            {copied && <p className="text-emerald-600 text-xs mt-1">Copied to clipboard!</p>}
          </div>

          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-500">Current Status:</span>
              <span className="badge-yellow">Awaiting Owner Review</span>
            </div>
            {item && (
              <div className="bg-gray-50 p-2.5 rounded-lg text-xs space-y-1 text-gray-700">
                <div><span className="font-medium text-gray-900">Category:</span> {item.category}</div>
                <div><span className="font-medium text-gray-900">Description:</span> {item.description}</div>
                {item.color && <div><span className="font-medium text-gray-900">Color:</span> {item.color}</div>}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-2">
              <Clock className="h-3.5 w-3.5" />
              <span>Submitted on {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link to={`/finder/report/${reference}`} className="btn-primary w-full py-2.5 justify-center">
            <Eye className="h-4 w-4" /> View Report Details & Call Options
          </Link>
          <Link to="/finder/reports" className="btn-secondary w-full py-2.5 justify-center">
            <ListChecks className="h-4 w-4" /> Go to My Found Reports <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/" className="text-xs text-gray-500 hover:text-brand-700 mt-2">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}