import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Search, ArrowRight, PhoneCall, ShieldCheck, Clock, AlertCircle } from 'lucide-react'
import api from '../../services/api'
import { getStoredFinderReports } from '../../services/finderStorage'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import StatusBadge from '../../components/shared/StatusBadge'

export default function MyFoundReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMyReports = async () => {
      const stored = getStoredFinderReports()
      if (stored.length === 0) {
        setLoading(false)
        return
      }

      try {
        const payload = {
          tokens: stored.map(s => ({ ref: s.ref, token: s.token }))
        }
        const res = await api.post('/found-reports/my-reports', payload)
        setReports(res.data.data.reports || [])
      } catch (err) {
        console.error('Failed to fetch finder reports:', err)
        setError('Could not refresh report statuses. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchMyReports()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Found Reports</h1>
            <p className="text-gray-500 text-xs mt-1">
              Track the status of belongings you reported found. Stored securely on your device.
            </p>
          </div>
          <Link to="/finder" className="btn-primary text-sm whitespace-nowrap self-start sm:self-auto">
            <PlusCircle className="h-4 w-4" /> Report Another Item
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : reports.length === 0 ? (
          <div className="card text-center py-16 px-4">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Found Reports Yet</h3>
            <p className="text-gray-500 text-xs max-w-sm mx-auto mb-6">
              When you submit a report for a lost item you discovered, it will appear here so you can coordinate recovery with the owner.
            </p>
            <Link to="/finder" className="btn-primary inline-flex text-sm">
              Report a Found Item
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <div key={r.reportReference} className="card hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono font-bold text-brand-800 text-sm">{r.reportReference}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-base">{r.category}</h3>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2 mb-4">
                  {r.description}
                </p>

                {/* Match and Calling Status pill indicator */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <span className="text-gray-500">Possible Match: </span>
                      <span className="font-medium text-gray-900">
                        {r.hasMatch ? (
                          r.isMatchApproved ? (
                            <span className="text-emerald-700 font-semibold">Match Approved by Owner</span>
                          ) : r.reviewStatus === 'rejected' ? (
                            <span className="text-red-600 font-medium">Match Declined</span>
                          ) : (
                            <span className="text-amber-700 font-medium">Under Owner Review</span>
                          )
                        ) : (
                          <span className="text-gray-500">Scanning for matches...</span>
                        )}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500">Contact Status: </span>
                      <span className="font-medium">
                        {r.canCallOwner ? (
                          <span className="text-emerald-700 inline-flex items-center gap-1 font-semibold">
                            <PhoneCall className="h-3.5 w-3.5 text-emerald-600" /> Calling Authorized
                          </span>
                        ) : r.isMatchApproved ? (
                          <span className="text-amber-600">Awaiting phone consent</span>
                        ) : (
                          <span className="text-gray-400">Not authorized yet</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/finder/report/${r.reportReference}`}
                    className="btn-secondary text-xs py-1.5 px-3 ml-auto flex items-center gap-1"
                  >
                    View Details <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/" className="text-xs text-gray-500 hover:text-brand-700">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
