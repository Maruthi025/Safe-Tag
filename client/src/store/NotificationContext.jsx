import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const prevUnreadRef = useRef(null)   // null = first load (no toast on mount)
  const prevNotifIds = useRef(new Set())

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      const res = await api.get('/notifications')
      const fetched = res.data.data.notifications || []
      const count   = res.data.data.unreadCount || 0

      setNotifications(fetched)
      setUnreadCount(count)

      // On first load just record the baseline — don't pop toasts
      if (prevUnreadRef.current === null) {
        prevUnreadRef.current = count
        prevNotifIds.current = new Set(fetched.map((n) => n._id))
        return
      }

      // Find genuinely new notifications that weren't in our last snapshot
      const newOnes = fetched.filter(
        (n) => !n.readAt && !prevNotifIds.current.has(n._id)
      )

      newOnes.forEach((n) => {
        showToast(n.title, n.message, 'info')
      })

      prevUnreadRef.current = count
      prevNotifIds.current  = new Set(fetched.map((n) => n._id))
    } catch {}
  }, [user, showToast])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000) // 10 s
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`)
    fetchNotifications()
  }

  const markAllRead = async () => {
    await api.patch('/notifications/read-all')
    fetchNotifications()
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}