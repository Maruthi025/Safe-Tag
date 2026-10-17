import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Package, FileWarning, Search, Bell,
  QrCode, User, LogOut, Menu
} from 'lucide-react'
import { useAuth } from '../../store/AuthContext'
import { useNotifications } from '../../store/NotificationContext'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/found-reports', icon: Search, label: 'Found Item Reports' },
  { to: '/admin/items', icon: Package, label: 'My Belongings' },
  { to: '/admin/lost-reports', icon: FileWarning, label: 'Lost Reports' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { to: '/admin/qr', icon: QrCode, label: 'QR Code' },
  { to: '/admin/profile', icon: User, label: 'Profile' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      isActive ? 'bg-brand-700 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-brand-700'
    }`

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-brand-800 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">ST</div>
          <span className="font-bold text-brand-900 text-lg">Safe Tag</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass} onClick={() => setSidebarOpen(false)}>
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span>{label}</span>
            {label === 'Notifications' && unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <div className="text-xs text-gray-500 mb-2 truncate font-medium">{user?.name}</div>
        <button onClick={handleLogout} className="w-full btn-secondary text-sm">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-30 border-r border-gray-100">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white flex flex-col shadow-xl z-10">
            <Sidebar />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-20 h-16 flex items-center px-4 gap-4 shadow-sm">
          <button
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-brand-700"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-gray-900">Admin Portal</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-600 hidden sm:block">Hi, {user?.name?.split(' ')[0]}</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}