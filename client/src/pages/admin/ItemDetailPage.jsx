import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Trash2, AlertTriangle, ArrowLeft } from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import ErrorMessage from '../../components/shared/ErrorMessage'
import StatusBadge from '../../components/shared/StatusBadge'
import ConfirmDialog from '../../components/shared/ConfirmDialog'

export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showArchive, setShowArchive] = useState(false)
  const [archiving, setArchiving] = useState(false)

  useEffect(() => {
    api.get(`/items/${id}`).then(r => setItem(r.data.data.item)).catch(() => setError('Item not found.')).finally(() => setLoading(false))
  }, [id])

  const handleArchive = async () => {
    setArchiving(true)
    try {
      await api.delete(`/items/${id}`)
      navigate('/admin/items')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to archive item.')
    } finally { setArchiving(false); setShowArchive(false) }
  }

  if (loading) return <div className="py-20"><LoadingSpinner size="lg" /></div>
  if (error && !item) return <ErrorMessage message={error} />

  return (
    <div className="max-w-2xl">
      <Link to="/admin/items" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-brand-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Belongings
      </Link>

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{item.name}</h1>
            <p className="text-xs text-gray-500">{item.category}</p>
          </div>
          <StatusBadge status={item.status} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wide font-medium block">Description</span>
            <p className="text-gray-800 mt-1">{item.description}</p>
          </div>
          {item.brand && <div><span className="text-xs text-gray-400 uppercase tracking-wide font-medium block">Brand</span><p className="text-gray-800 mt-1">{item.brand}</p></div>}
          {item.color && <div><span className="text-xs text-gray-400 uppercase tracking-wide font-medium block">Color</span><p className="text-gray-800 mt-1">{item.color}</p></div>}
          {item.identifyingFeatures && <div><span className="text-xs text-gray-400 uppercase tracking-wide font-medium block">Identifying Features</span><p className="text-gray-800 mt-1">{item.identifyingFeatures}</p></div>}
          {item.serialNumber && <div><span className="text-xs text-gray-400 uppercase tracking-wide font-medium block">Serial Number</span><p className="text-gray-800 mt-1">{item.serialNumber}</p></div>}
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
          {item.status === 'registered' && (
            <Link to={`/admin/lost-reports/new?itemId=${item._id}`} className="btn-danger text-sm">
              <AlertTriangle className="h-4 w-4" /> Report Lost
            </Link>
          )}
          {item.status !== 'archived' && (
            <button onClick={() => setShowArchive(true)} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 text-sm">
              <Trash2 className="h-4 w-4" /> Archive
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showArchive}
        title="Archive this item?"
        message="This item will be removed from your active list."
        confirmLabel={archiving ? 'Archiving...' : 'Archive'}
        onConfirm={handleArchive}
        onCancel={() => setShowArchive(false)}
      />
    </div>
  )
}