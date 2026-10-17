import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, PhoneCall, ShieldCheck, Clock, MapPin, AlertCircle, Info, CheckCircle2, RefreshCw } from 'lucide-react'
import api from '../../services/api'
import { getFinderTokenForReport, saveFinderReportToken } from '../../services/finderStorage'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import StatusBadge from '../../components/shared/StatusBadge'
import ErrorMessage from '../../components/shared/ErrorMessage'

export default function FinderReportDetailPage() {
  const { ref } = useParams()
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get('token')
  const [token, setToken] = useState(() => getFinderTokenForReport(ref) || tokenFromUrl || '')
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [callingData, setCallingData] = useState(null)
  const [loadingCall, setLoadingCall] = useState(false)
  const [callError, setCallError] = useState('')

  // Persist token from URL to localStorage if present
  useEffect(() => {
    if (tokenFromUrl && tokenFromUrl !== getFinderTokenForReport(ref)) {
      saveFinderReportToken({ ref, token: tokenFromUrl })
      setToken(tokenFromUrl)
    }
  }, [ref, tokenFromUrl])

  const fetchReport = useCallback(async (isBackground = false) => {
    if (!isBackground) setRefreshing(true)
    try {
      const activeToken = token || getFinderTokenForReport(ref) || searchParams.get('token')
      const config = activeToken ? { headers: { 'x-finder-token': activeToken } } : {}
      const res = await api.get(`/found-reports/view/${ref}`, config)
      setReportData(res.data.data)
      setError('')
    } catch (err) {
      if (!isBackground) {
        console.error('Failed to load report:', err)
        setError(err.response?.data?.message || 'Report not found or private.')
      }
    } finally {
      if (!isBackground) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [ref, token, searchParams])

  useEffect(() => {
    fetchReport()

    // Auto-poll every 3 seconds while calling is not yet enabled
    const interval = setInterval(() => {
      fetchReport(true)
    }, 3000)

    return () => clearInterval(interval)
  }, [fetchReport])

  const handleRequestCall = async () => {
    const activeToken = token || getFinderTokenForReport(ref) || searchParams.get('token')
    if (!activeToken) {
      setCallError('Authorization token not found on this device.')
      return
    }

    setLoadingCall(true)
    setCallError('')
    try {
      const res = await api.get(`/found-reports/call-owner/${ref}`, {
        headers: { 'x-finder-token': activeToken }
      })
      setCallingData(res.data.data)
      // Automatically trigger the device dialer on compatible browsers
      window.location.href = res.data.data.telLink
    } catch (err) {
      setCallError(err.response?.data?.message || 'Could not retrieve owner contact details.')
    } finally {
      setLoadingCall(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <ErrorMessage message={error || 'Report could not be retrieved.'} />
          <div className="mt-4 text-center">
            <Link to="/finder/reports" className="btn-secondary text-sm">
              &larr; Back to My Found Reports
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { report, hasMatch, reviewStatus, isMatchApproved, phoneSharingConsent, canCallOwner } = reportData

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link to="/finder/reports" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-700">
            <ArrowLeft className="h-4 w-4" /> Back to My Found Reports
          </Link>
          <button
            onClick={() => fetchReport(false)}
            disabled={refreshing}
            className="inline-flex items-center gap-1 text-xs text-brand-700 hover:text-brand-900 bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-xs"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Checking...' : 'Refresh Status'}</span>
          </button>
        </div>

        {/* Header */}
        <div className="card mb-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-mono text-base font-bold text-brand-800">{report.reportReference}</span>
                <StatusBadge status={report.status} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">{report.category}</h1>
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{new Date(report.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
            <div>
              <span className="text-gray-400 font-medium">Description: </span>
              <span className="text-gray-800">{report.description}</span>
            </div>
            {report.brand && (
              <div>
                <span className="text-gray-400 font-medium">Brand: </span>
                <span className="text-gray-800">{report.brand}</span>
              </div>
            )}
            {report.color && (
              <div>
                <span className="text-gray-400 font-medium">Color: </span>
                <span className="text-gray-800">{report.color}</span>
              </div>
            )}
            {report.manualFoundLocation && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-400 font-medium">Found Location: </span>
                <span className="text-gray-800">{report.manualFoundLocation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Direct Calling & Contact Status Section */}
        <div className="card mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <PhoneCall className="h-4 w-4 text-brand-700" /> Owner Contact & Direct Calling
          </h2>

          {callError && <ErrorMessage message={callError} className="mb-3" />}

          {/* Condition A: Can call owner */}
          {canCallOwner ? (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-emerald-900">Owner Contact Authorized!</div>
                  <div>The verified owner has confirmed this match and approved direct phone contact.</div>
                </div>
              </div>

              {callingData ? (
                <div className="bg-white border-2 border-emerald-500 rounded-xl p-4 text-center space-y-3 shadow-sm">
                  <div className="text-xs text-gray-500">Authorized Contact for Owner {callingData.ownerName}:</div>
                  <div className="text-xl font-mono font-bold text-gray-900">{callingData.phone}</div>
                  <a
                    href={callingData.telLink}
                    className="btn-success w-full py-3 justify-center text-base font-semibold shadow-md flex items-center gap-2"
                  >
                    <PhoneCall className="h-5 w-5" /> Tap to Call Owner via Phone Dialer
                  </a>
                  <p className="text-[11px] text-gray-400">
                    Tapping will hand off to your device's phone application or dialer. You must manually initiate the call.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleRequestCall}
                  disabled={loadingCall}
                  className="btn-success w-full py-3 justify-center text-sm font-semibold flex items-center gap-2 shadow-sm"
                >
                  {loadingCall ? (
                    <>
                      <LoadingSpinner size="sm" /> Connecting to Phone Dialer...
                    </>
                  ) : (
                    <>
                      <PhoneCall className="h-4 w-4" /> Call Owner
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            /* Condition B: Calling NOT authorized yet */
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-800 space-y-2">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="leading-relaxed">
                  <strong>Calling will become available after the owner approves the match and authorizes contact sharing.</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/60 text-[11px] space-y-1 text-amber-900">
                <div className="flex items-center justify-between">
                  <span>1. Owner Match Review:</span>
                  <span className="font-semibold">
                    {isMatchApproved ? (
                      <span className="text-emerald-700">✓ Approved</span>
                    ) : reviewStatus === 'rejected' ? (
                      <span className="text-red-600">✗ Declined</span>
                    ) : (
                      <span className="text-amber-700">⏳ Pending Owner Review</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>2. Phone Number Sharing Consent:</span>
                  <span className="font-semibold">
                    {phoneSharingConsent ? (
                      <span className="text-emerald-700">✓ Granted</span>
                    ) : (
                      <span className="text-gray-500">⏳ Awaiting Consent</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Safe Privacy notice */}
        <div className="text-[11px] text-gray-400 text-center leading-relaxed">
          <ShieldCheck className="h-4 w-4 inline mr-1 text-gray-400 align-text-bottom" />
          Safe Tag protects both finders and owners. Phone numbers are encrypted and only revealed when both match confirmation and explicit contact consent are active.
        </div>
      </div>
    </div>
  )
}
