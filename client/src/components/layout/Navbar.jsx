import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, LogIn, LogOut, Bell } from 'lucide-react'
import { useAuth } from '../../store/AuthContext'
import { useNotifications } from '../../store/NotificationContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-brand-700' : 'text-gray-600 hover:text-brand-700'}`

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-brand-800 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
              ST
            </div>
            <span className="font-bold text-xl text-brand-900">Safe Tag</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/how-it-works" className={navLinkClass}>How It Works</NavLink>
            <NavLink to="/about" className={navLinkClass}>About</NavLink>
            {user ? (
              <>
                <NavLink to="/admin" className={navLinkClass}>Dashboard</NavLink>
                <Link to="/admin/notifications" className="relative p-1">
                  <Bell className="h-5 w-5 text-gray-600 hover:text-brand-700 transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <button onClick={handleLogout} className="btn-secondary text-sm gap-1.5 py-1.5">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm">
                <LogIn className="h-4 w-4" /> Admin Login
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-brand-700"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3 pt-2">
            <NavLink to="/" end className={navLinkClass} onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink to="/how-it-works" className={navLinkClass} onClick={() => setMenuOpen(false)}>How It Works</NavLink>
            <NavLink to="/about" className={navLinkClass} onClick={() => setMenuOpen(false)}>About</NavLink>
            {user ? (
              <>
                <NavLink to="/admin" className={navLinkClass} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
                <NavLink to="/admin/notifications" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </NavLink>
                <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="btn-secondary text-sm w-full">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm" onClick={() => setMenuOpen(false)}>
                <LogIn className="h-4 w-4" /> Admin Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}