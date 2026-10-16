import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'
import StatusBadge from '../../components/shared/StatusBadge'

export default function MatchesPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/matches').then(r => setMatches(r.data.data.matches || [])).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Possible Matches</h1>
        <p className="text-gray-500 text-xs mt-0.5">Found item reports evaluated against your registered belongings</p>
      </div>
      {loading ? <div className="py-20"><LoadingSpinner size="lg" /></div> :
        matches.length === 0 ? (
          <EmptyState title="No matches found" description="When a reported found item matches one of your lost items, it will appear here." icon={Search} />
        ) : (
          <div className="flex flex-col gap-3">
            {matches.map(m => (
              <Link key={m._id} to={`/admin/matches/${m._id}`} className="card hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{m.itemId?.name}</h3>
                      <StatusBadge status={m.matchCategory} />
                    </div>
                    <p className="text-xs text-gray-500">{m.itemId?.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-brand-700">{m.matchScore}%</div>
                    <div className="text-[10px] text-gray-400">Match Score</div>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  <span className="font-medium text-gray-700">Found: </span>{m.foundReportId?.description?.slice(0, 80)}...
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                  <StatusBadge status={m.reviewStatus} />
                  <span className="text-[10px] text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )
      }
    </div>
  )
}