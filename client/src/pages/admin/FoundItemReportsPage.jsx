import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, PhoneCall, ShieldCheck, MapPin } from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'
import StatusBadge from '../../components/shared/StatusBadge'

export default function FoundItemReportsPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/matches')
      .then(r => setMatches(r.data.data.matches || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Found Item Reports</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Review reports of items found by samaritans that match your registered belongings. Approve matches and manage phone contact sharing.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
      ) : matches.length === 0 ? (
        <EmptyState
          title="No Found Item Reports Yet"
          description="When a finder submits a report matching your lost belongings, it will appear here for your review and consent."
          icon={Search}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map(m => (
            <Link key={m._id} to={`/admin/matches/${m._id}`} className="card hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-gray-900 text-sm">{m.itemId?.name}</h3>
                    <StatusBadge status={m.matchCategory} />
                    {m.phoneSharingConsent && (
                      <span className="badge-green inline-flex items-center gap-1 text-[11px]">
                        <PhoneCall className="h-3 w-3" /> Calling Enabled
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Category: <span className="text-gray-800 font-medium">{m.itemId?.category}</span>
                    {m.foundReportId?.reportReference && (
                      <> &bull; Report Ref: <span className="font-mono text-brand-800">{m.foundReportId?.reportReference}</span></>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-brand-700">{m.matchScore}%</div>
                  <div className="text-[10px] text-gray-400">Match Score</div>
                </div>
              </div>

              <div className="text-xs text-gray-600 mb-2">
                <span className="font-medium text-gray-700">Finder Notes: </span>
                {m.foundReportId?.description}
              </div>

              {m.foundReportId?.manualFoundLocation && (
                <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <span>Found at: {m.foundReportId.manualFoundLocation}</span>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={m.reviewStatus} />
                  {m.reviewStatus === 'confirmed' && !m.phoneSharingConsent && (
                    <span className="text-[11px] text-amber-600 font-medium">Awaiting Phone Consent</span>
                  )}
                </div>
                <span className="text-[10px] text-gray-400">
                  Reported: {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
