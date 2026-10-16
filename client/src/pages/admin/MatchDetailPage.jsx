import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, Award } from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import ErrorMessage from '../../components/shared/ErrorMessage'
import StatusBadge from '../../components/shared/StatusBadge'
import SuccessMessage from '../../components/shared/SuccessMessage'

export default function MatchDetailPage() {
  const { id } = useParams()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get(`/matches/${id}`).then(r => setMatch(r.data.data.match)).catch(() => setError('Match not found.')).finally(() => setLoading(false))
  }, [id])

  const review = async (action) => {
    setSubmitting(true); setError('')
    try {
      await api.patch(`/matches/${id}/review`, { action })
      if (action === 'confirm') setSuccess('Match confirmed! Recovery is now in progress.')
      else setSuccess('Match rejected.')
      const r = await api.get(`/matches/${id}`)
      setMatch(r.data.data.match)
    } catch (err) { setError(err.response?.data?.message || 'Failed to review match.') }
    finally { setSubmitting(false) }
  }

  const markRecovered = async () => {
    setSubmitting(true); setError('')
    try {
      await api.patch(`/matches/${id}/recover`)
      setSuccess('Item marked as recovered! Congratulations!')
      const r = await api.get(`/matches/${id}`)
      setMatch(r.data.data.match)
    } catch (err) { setError(err.response?.data?.message || 'Failed to mark recovered.') }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="py-20"><LoadingSpinner size="lg" /></div>
  if (error && !match) return <ErrorMessage message={error} />

  const found = match.foundReportId
  const item = match.itemId

  return (
    <div className="max-w-3xl">
      <Link to="/admin/matches" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-brand-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Matches
      </Link>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Match Review</h1>
          <p className="text-xs text-gray-500">Evaluate the finder report to confirm or reject ownership</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-brand-700">{match.matchScore}%</div>
          <div className="text-xs text-gray-400">Match score</div>
        </div>
      </div>

      <ErrorMessage message={error} className="mb-4" />
      <SuccessMessage message={success} className="mb-4" />

      {/* Match breakdown */}
      <div className="card mb-4">
        <h2 className="font-semibold text-gray-900 text-sm mb-2.5">Why This Matched</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {match.matchReasons?.map((r, i) => (
            <div key={i} className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-medium border border-brand-100">
              {r.detail}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <StatusBadge status={match.matchCategory} />
          <StatusBadge status={match.reviewStatus} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {/* Your item */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">Your Belonging</h2>
          <div className="space-y-1.5 text-xs">
            <div><span className="text-gray-400">Name:</span> <span className="text-gray-900 font-medium">{item?.name}</span></div>
            <div><span className="text-gray-400">Category:</span> <span className="text-gray-900">{item?.category}</span></div>
            {item?.brand && <div><span className="text-gray-400">Brand:</span> <span className="text-gray-900">{item.brand}</span></div>}
            {item?.color && <div><span className="text-gray-400">Color:</span> <span className="text-gray-900">{item.color}</span></div>}
            {item?.description && <div><span className="text-gray-400">Description:</span> <span className="text-gray-900">{item.description}</span></div>}
          </div>
        </div>

        {/* Found report */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">Finder Report</h2>
          <div className="space-y-1.5 text-xs">
            <div><span className="text-gray-400">Reference:</span> <span className="text-gray-900 font-mono font-medium">{found?.reportReference}</span></div>
            <div><span className="text-gray-400">Category:</span> <span className="text-gray-900">{found?.category}</span></div>
            {found?.brand && <div><span className="text-gray-400">Brand:</span> <span className="text-gray-900">{found.brand}</span></div>}
            {found?.color && <div><span className="text-gray-400">Color:</span> <span className="text-gray-900">{found.color}</span></div>}
            {found?.manualFoundLocation && <div><span className="text-gray-400">Found At:</span> <span className="text-gray-900">{found.manualFoundLocation}</span></div>}
            {found?.description && <div><span className="text-gray-400">Description:</span> <span className="text-gray-900">{found.description}</span></div>}
          </div>
        </div>
      </div>

      {/* Contact & Location if confirmed */}
      {match.reviewStatus === 'confirmed' && (
        <div className="card mb-4 bg-emerald-50 border-emerald-200">
          <h2 className="font-semibold text-emerald-900 text-sm mb-2">Finder Contact Information</h2>
          <p className="text-xs text-emerald-700 mb-3">Use these details to coordinate recovery:</p>
          <div className="text-xs space-y-1 text-emerald-950 font-medium">
            <div>Finder Name: {found?.finderName}</div>
            {found?.finderContact?.phone && <div>Phone: {found.finderContact.phone}</div>}
            {found?.finderContact?.email && <div>Email: {found.finderContact.email}</div>}
            {found?.deviceLocation && (
              <div className="mt-2 pt-2 border-t border-emerald-200 text-xs">
                📍 Coordinates: {found.deviceLocation.lat.toFixed(5)}, {found.deviceLocation.lng.toFixed(5)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review actions */}
      {match.reviewStatus === 'pending' && (
        <div className="flex gap-3">
          <button onClick={() => review('confirm')} disabled={submitting} className="btn-success text-sm flex-1">
            <CheckCircle className="h-4 w-4" /> Confirm Match (This is Mine)
          </button>
          <button onClick={() => review('reject')} disabled={submitting} className="btn-danger text-sm flex-1">
            <XCircle className="h-4 w-4" /> Reject (Not Mine)
          </button>
        </div>
      )}
      {match.reviewStatus === 'confirmed' && item?.status !== 'recovered' && (
        <button onClick={markRecovered} disabled={submitting} className="btn-success text-sm w-full">
          <Award className="h-4 w-4" /> Mark Item as Fully Recovered
        </button>
      )}
    </div>
  )
}