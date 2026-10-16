import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Package, Search } from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'
import StatusBadge from '../../components/shared/StatusBadge'
import ErrorMessage from '../../components/shared/ErrorMessage'

const CATEGORIES = ['All', 'Mobile Phone', 'Laptop', 'Bag', 'Wallet', 'Keys', 'Water Bottle', 'Documents', 'Watch', 'Accessories', 'Other']

export default function ItemsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const load = async () => {
    try {
      setLoading(true)
      const params = {}
      if (search) params.search = search
      if (category !== 'All') params.category = category
      const res = await api.get('/items', { params })
      setItems(res.data.data.items || [])
    } catch { setError('Failed to load items.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, category])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Belongings</h1>
          <p className="text-gray-500 text-xs mt-0.5">{items.length} registered item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/admin/items/register" className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> Register Item
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="input sm:w-44 text-sm">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <ErrorMessage message={error} className="mb-4" />

      {loading ? (
        <div className="py-20"><LoadingSpinner size="lg" /></div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No belongings registered"
          description="Register your belongings so they can be matched if someone finds them."
          action={<Link to="/admin/items/register" className="btn-primary text-sm"><Plus className="h-4 w-4" /> Register Item</Link>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <Link key={item._id} to={`/admin/items/${item._id}`} className="card hover:shadow-md transition-all hover:border-brand-200">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-gray-100 w-10 h-10 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-gray-500" />
                </div>
                <StatusBadge status={item.status} />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{item.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{item.category}</p>
              {item.brand && <p className="text-xs text-gray-400">Brand: {item.brand}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}