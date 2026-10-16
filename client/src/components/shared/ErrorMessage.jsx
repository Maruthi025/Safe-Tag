import { AlertCircle } from 'lucide-react'

export default function ErrorMessage({ message, className = '' }) {
  if (!message) return null
  return (
    <div className={`flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm ${className}`}>
      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}