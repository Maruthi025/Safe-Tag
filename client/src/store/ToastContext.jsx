import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const showToast = useCallback((title, message = '', variant = 'info', duration = 6000) => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, title, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

/* ─── Inline container so it renders at the top of the DOM tree ─── */
function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

const VARIANTS = {
  info:    { bar: 'bg-blue-500',   bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-900',   icon: '🔔' },
  success: { bar: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', icon: '✅' },
  warning: { bar: 'bg-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-900',  icon: '⚠️' },
  error:   { bar: 'bg-red-500',    bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-900',    icon: '❌' },
}

function Toast({ toast, onDismiss }) {
  const v = VARIANTS[toast.variant] || VARIANTS.info

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-xl border shadow-lg ${v.bg} ${v.border} flex items-start gap-3 p-3.5 pr-10 animate-slide-in`}
      role="alert"
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${v.bar}`} />

      <span className="text-lg leading-none select-none mt-0.5">{v.icon}</span>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-snug ${v.text}`}>{toast.title}</p>
        {toast.message && (
          <p className={`text-xs mt-0.5 leading-relaxed ${v.text} opacity-80`}>{toast.message}</p>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className={`absolute top-2 right-2 text-lg leading-none ${v.text} opacity-50 hover:opacity-100 transition-opacity`}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
