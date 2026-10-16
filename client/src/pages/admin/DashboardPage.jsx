import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, AlertTriangle, Search, ArrowRight, CheckCircle } from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import ErrorMessage from '../../components/shared/ErrorMessage'
import { useAuth } from '../../store/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentItems, setRecentItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, itemsRes] = await Promise.all([
          api.get('/items/stats'),
          api.get('/items'),
        ])
        setStats(statsRes.data.data.stats)
        setRecentItems(itemsRes.data.data.items?.slice(0, 5) || [])
      } catch (err) {
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="py-20"><LoadingSpinner size="lg" /></div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back, {user?.name}</p>
      </div>
      <ErrorMessage message={error} className="mb-6" />

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Items', value: stats.total, icon: Package, color: 'brand', link: '/admin/items' },
            { label: 'Currently Lost', value: stats.lost, icon: AlertTriangle, color: 'red', link: '/admin/lost-reports' },
            { label: 'Possible Matches', value: stats.foundReportReceived, icon: Search, color: 'amber', link: '/admin/matches' },
            { label: 'Recovered', value: stats.recovered, icon: CheckCircle, color: 'emerald', link: '/admin/items' },
          ].map(({ label, value, icon: Icon, color, link }) => (
            <Link key={label} to={link} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
                <Icon className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link to="/admin/items/register" className="card border-2 border-dashed border-brand-200 hover:border-brand-400 hover:bg-brand-50 transition-all flex items-center gap-4">
          <div className="bg-brand-100 text-brand-700 p-3 rounded-xl"><Package className="h-6 w-6" /></div>
          <div>
            <div className="font-semibold text-gray-900">Register New Belonging</div>
            <div className="text-xs text-gray-500">Protect another phone, keys, or item</div>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-gray-400" />
        </Link>
        <Link to="/admin/lost-reports/new" className="card border-2 border-dashed border-red-200 hover:border-red-400 hover:bg-red-50 transition-all flex items-center gap-4">
          <div className="bg-red-100 text-red-700 p-3 rounded-xl"><AlertTriangle className="h-6 w-6" /></div>
          <div>
            <div className="font-semibold text-gray-900">Report an Item Lost</div>
            <div className="text-xs text-gray-500">Activate lost matching immediately</div>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-gray-400" />
        </Link>
      </div>

      {recentItems.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-base">Your Belongings</h2>
            <Link to="/admin/items" className="text-xs text-brand-700 font-medium hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentItems.map(item => (
              <Link key={item._id} to={`/admin/items/${item._id}`} className="flex items-center gap-3 py-3 hover:bg-gray-50 -mx-6 px-6 transition-colors">
                <div className="bg-gray-100 w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.category}</div>
                </div>
                <span className="badge badge-gray">{item.status.replace(/_/g, ' ')}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}