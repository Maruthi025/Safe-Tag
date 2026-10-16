import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileWarning } from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'
import StatusBadge from '../../components/shared/StatusBadge'

export default function LostReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/lost-reports').then(r => setReports(r.data.data.lostReports || [])).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lost Reports</h1>
          <p className="text-gray-500 text-xs mt-0.5">Items currently flagged as lost</p>
        </div>
        <Link to="/admin/lost-reports/new" className="btn-danger text-sm">
          <Plus className="h-4 w-4" /> Report Lost Item
        </Link>
      </div>
      {loading ? <div className="py-20"><LoadingSpinner size="lg" /></div> :
        reports.length === 0 ? (
          <EmptyState title="No active lost reports" description="All of your items are accounted for." icon={FileWarning}
            action={<Link to="/admin/lost-reports/new" className="btn-danger text-sm"><Plus className="h-4 w-4" /> Report Lost Item</Link>}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {reports.map(r => (
              <div key={r._id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{r.itemId?.name || 'Unknown Item'}</h3>
                    <p className="text-xs text-gray-500">{r.itemId?.category}</p>
                    <p className="text-xs text-gray-600 mt-2">Lost on: {new Date(r.lostAt).toLocaleDateString()}</p>
                    {r.lastKnownLocation && <p className="text-xs text-gray-500">Last seen: {r.lastKnownLocation}</p>}
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}