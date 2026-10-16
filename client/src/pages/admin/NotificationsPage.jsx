import { Bell, CheckCheck } from 'lucide-react'
import { useNotifications } from '../../store/NotificationContext'
import EmptyState from '../../components/shared/EmptyState'

export default function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-xs mt-0.5">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-xs">
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You will receive alerts here when a potential match is reported." icon={Bell} />
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map(n => (
            <div
              key={n._id}
              onClick={() => !n.readAt && markRead(n._id)}
              className={`card cursor-pointer transition-all hover:shadow-sm p-4 ${
                !n.readAt ? 'border-brand-200 bg-brand-50/50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {!n.readAt && <div className="w-2 h-2 bg-brand-600 rounded-full flex-shrink-0" />}
                    <h3 className="font-semibold text-gray-900 text-sm">{n.title}</h3>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                </div>
                <span className="text-[10px] text-gray-400 flex-shrink-0">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}