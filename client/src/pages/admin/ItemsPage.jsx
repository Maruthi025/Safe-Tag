import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Package, Search, Trash2 } from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'
import StatusBadge from '../../components/shared/StatusBadge'
import ErrorMessage from '../../components/shared/ErrorMessage'
import ConfirmDialog from '../../components/shared/ConfirmDialog'

const CATEGORIES = ['All', 'Mobile Phone', 'Laptop', 'Bag', 'Wallet', 'Keys', 'Water Bottle', 'Documents', 'Watch', 'Accessories', 'Other']

export default function ItemsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [itemToDelete, setItemToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

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

  const handleDelete = async () => {
    if (!itemToDelete) return
    setDeleting(true)
    try {
      await api.delete(`/items/${itemToDelete._id}`)
      setItems(prev => prev.filter(i => i._id !== itemToDelete._id))
      setItemToDelete(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete item.')
    } finally {
      setDeleting(false)
    }
  }

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
            <div key={item._id} className="card hover:shadow-md transition-all hover:border-brand-200 flex flex-col justify-between">
              <Link to={`/admin/items/${item._id}`} className="block">
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-gray-100 w-10 h-10 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-gray-500" />
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{item.name}</h3>
                <p className="text-xs text-gray-500 mb-1">{item.category}</p>
                {item.brand && <p className="text-xs text-gray-400">Brand: {item.brand}</p>}
              </Link>
              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                <Link to={`/admin/items/${item._id}`} className="text-xs text-brand-700 hover:text-brand-900 font-medium">
                  View Details &rarr;
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setItemToDelete(item)
                  }}
                  className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                  title="Delete Item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Delete this item?"
        message={`Are you sure you want to permanently delete "${itemToDelete?.name}"? All associated match records and lost reports will also be deleted.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete Permanently'}
        onConfirm={handleDelete}
        onCancel={() => setItemToDelete(null)}
        variant="danger"
      />
    </div>
  )
}