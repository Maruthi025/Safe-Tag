import { CheckCircle } from 'lucide-react'

export default function SuccessMessage({ message, className = '' }) {
  if (!message) return null
  return (
    <div className={`flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm ${className}`}>
      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}