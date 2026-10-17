import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Send } from 'lucide-react'
import api from '../../services/api'
import ErrorMessage from '../../components/shared/ErrorMessage'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const CATEGORIES = ['Mobile Phone', 'Laptop', 'Bag', 'Wallet', 'Keys', 'Water Bottle', 'Documents', 'Watch', 'Accessories', 'Other']

const step1Schema = z.object({
  category: z.string().min(1, 'Please select a category'),
  description: z.string().min(10, 'Please provide at least 10 characters describing the item').max(1000),
  color: z.string().max(50).optional().or(z.literal('')),
  brand: z.string().max(100).optional().or(z.literal('')),
  identifyingFeatures: z.string().max(500).optional().or(z.literal('')),
  foundAt: z.string().optional().or(z.literal('')),
  manualFoundLocation: z.string().max(500).optional().or(z.literal('')),
  additionalNotes: z.string().max(500).optional().or(z.literal('')),
})

const step2Schema = z.object({
  finderName: z.string().min(1, 'Your name is required').max(100),
  finderPhone: z.string().max(20).optional().or(z.literal('')),
  finderEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
}).refine(d => d.finderPhone || d.finderEmail, {
  message: 'Please provide at least one contact method (phone or email)',
  path: ['finderPhone'],
})

function LocationSharing({ onLocationCaptured, onLocationCleared }) {
  const [status, setStatus] = useState('idle')
  const [location, setLocation] = useState(null)
  const [enabled, setEnabled] = useState(false)

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus('error')
      return
    }
    setStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }
        setLocation(loc)
        setStatus('granted')
        onLocationCaptured(loc)
      },
      (err) => {
        setStatus(err.code === 1 ? 'denied' : 'error')
        setEnabled(false)
        onLocationCleared()
      },
      { timeout: 10000, maximumAge: 0 }
    )
  }

  const toggle = () => {
    if (!enabled) {
      setEnabled(true)
      requestLocation()
    } else {
      setEnabled(false)
      setLocation(null)
      setStatus('idle')
      onLocationCleared()
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-start gap-3">
        <div className="bg-emerald-100 text-emerald-700 p-2 rounded-lg flex-shrink-0">
          <MapPin className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Share my current location (optional)</h3>
              <p className="text-xs text-gray-500 mt-0.5">Helps the owner verify where their item was found</p>
            </div>
            <button
              type="button"
              onClick={toggle}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                enabled && status === 'granted' ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
              aria-label="Toggle location sharing"
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                enabled && status === 'granted' ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {status === 'requesting' && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
              <LoadingSpinner size="sm" /> Requesting browser location permission...
            </div>
          )}
          {status === 'granted' && location && (
            <div className="mt-3 bg-white rounded-lg p-3 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-medium">
                <CheckCircle className="h-4 w-4" />
                <span>Coordinates captured (accuracy: ~{Math.round(location.accuracy)}m)</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Precise coordinates are encrypted and accessible only to the verified owner.</p>
            </div>
          )}
          {status === 'denied' && (
            <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Location permission was denied. You can still submit the report using the manual location field above.</span>
            </div>
          )}
          {status === 'error' && (
            <div className="mt-3 flex items-start gap-2 text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Location retrieval timed out. Please enter the location manually above.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { saveFinderReportToken } from '../../services/finderStorage'

export default function FinderPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [step1Data, setStep1Data] = useState(null)
  const [step2Data, setStep2Data] = useState(null)
  const [deviceLocation, setDeviceLocation] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [sharePhoneConsent, setSharePhoneConsent] = useState(true)

  const form1 = useForm({ resolver: zodResolver(step1Schema), defaultValues: { category: '' } })
  const form2 = useForm({ resolver: zodResolver(step2Schema) })

  const goToStep2 = (data) => { setStep1Data(data); setStep(2) }
  const goToReview = (data) => { setStep2Data(data); setStep(3) }

  const submit = async () => {
    if (!confirmed) { setError('Please check the confirmation box below.'); return }
    setSubmitting(true); setError('')
    try {
      const payload = {
        ...step1Data,
        ...step2Data,
        finderPhone: step2Data.finderPhone || undefined,
        finderEmail: step2Data.finderEmail || undefined,
        phoneSharingConsent: sharePhoneConsent,
        deviceLocationShared: !!deviceLocation,
        ...(deviceLocation ? { deviceLat: deviceLocation.lat, deviceLng: deviceLocation.lng, deviceAccuracy: deviceLocation.accuracy } : {}),
      }
      const res = await api.post('/found-reports', payload)
      const reportRef = res.data.data.reportReference
      const accessToken = res.data.data.accessToken

      // Save to secure local browser storage for "My Found Reports"
      saveFinderReportToken({
        ref: reportRef,
        token: accessToken,
        category: step1Data.category,
        description: step1Data.description,
      })

      navigate('/finder/success', {
        state: {
          reference: reportRef,
          accessToken: accessToken,
          item: {
            category: step1Data.category,
            description: step1Data.description,
            brand: step1Data.brand,
            color: step1Data.color,
            status: 'waiting_for_owner_review',
            createdAt: new Date().toISOString(),
          }
        }
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <a href="/" className="text-gray-500 hover:text-brand-700 p-1">
            <ArrowLeft className="h-5 w-5" />
          </a>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Report a Found Item</h1>
            <p className="text-gray-500 text-xs">Step {step} of 3</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          {[1,2,3].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${
              s <= step ? 'bg-brand-700' : 'bg-gray-200'
            }`} />
          ))}
        </div>

        {step === 1 && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Details</h2>
            <form onSubmit={form1.handleSubmit(goToStep2)} className="space-y-4">
              <div>
                <label className="label">Item Category *</label>
                <select {...form1.register('category')} className={`input ${form1.formState.errors.category ? 'input-error' : ''}`}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {form1.formState.errors.category && <p className="text-red-500 text-xs mt-1">{form1.formState.errors.category.message}</p>}
              </div>
              <div>
                <label className="label">Description *</label>
                <textarea {...form1.register('description')} rows={3} className={`input resize-none ${form1.formState.errors.description ? 'input-error' : ''}`} placeholder="Describe what you found (e.g., Black iPhone with cracked screen)" />
                {form1.formState.errors.description && <p className="text-red-500 text-xs mt-1">{form1.formState.errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Color</label>
                  <input {...form1.register('color')} className="input" placeholder="e.g., Black" />
                </div>
                <div>
                  <label className="label">Brand / Make</label>
                  <input {...form1.register('brand')} className="input" placeholder="e.g., Apple" />
                </div>
              </div>
              <div>
                <label className="label">Distinctive Characteristics</label>
                <input {...form1.register('identifyingFeatures')} className="input" placeholder="Stickers, scratches, engravings..." />
              </div>
              <div>
                <label className="label">Where did you find it?</label>
                <input {...form1.register('manualFoundLocation')} className="input" placeholder="e.g., Library 2nd floor, Main bench" />
              </div>
              <div>
                <label className="label">Date found</label>
                <input type="date" {...form1.register('foundAt')} className="input" max={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="label">Additional Notes</label>
                <textarea {...form1.register('additionalNotes')} rows={2} className="input resize-none" placeholder="Any other context" />
              </div>
              <button type="submit" className="btn-primary w-full py-2.5 mt-2">
                Continue to Contact Details <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Finder Contact Info</h2>
            <p className="text-xs text-gray-500 mb-4 bg-blue-50 text-blue-700 p-2.5 rounded-lg border border-blue-100">
              Your contact details are kept private and shared only if a match is confirmed by the owner.
            </p>
            <form onSubmit={form2.handleSubmit(goToReview)} className="space-y-4">
              <div>
                <label className="label">Your Name *</label>
                <input {...form2.register('finderName')} className={`input ${form2.formState.errors.finderName ? 'input-error' : ''}`} placeholder="Full name" />
                {form2.formState.errors.finderName && <p className="text-red-500 text-xs mt-1">{form2.formState.errors.finderName.message}</p>}
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input type="tel" {...form2.register('finderPhone')} className="input" placeholder="+1 234 567 8900" />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input type="email" {...form2.register('finderEmail')} className={`input ${form2.formState.errors.finderEmail ? 'input-error' : ''}`} placeholder="you@example.com" />
                {form2.formState.errors.finderEmail && <p className="text-red-500 text-xs mt-1">{form2.formState.errors.finderEmail.message}</p>}
              </div>
              {form2.formState.errors.finderPhone?.message?.includes('contact') && (
                <p className="text-red-500 text-xs">{form2.formState.errors.finderPhone.message}</p>
              )}

              <LocationSharing
                onLocationCaptured={setDeviceLocation}
                onLocationCleared={() => setDeviceLocation(null)}
              />

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button type="submit" className="btn-primary flex-1 py-2.5">
                  Review Report <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Review & Confirm</h2>
            <p className="text-xs text-gray-500 mb-4">Please verify the information before submitting.</p>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100 text-xs">
                <h3 className="font-semibold text-gray-800 mb-2 uppercase tracking-wide">Item Details</h3>
                <dl className="space-y-1">
                  {step1Data && Object.entries({
                    Category: step1Data.category,
                    Description: step1Data.description,
                    Color: step1Data.color,
                    Brand: step1Data.brand,
                    Features: step1Data.identifyingFeatures,
                    'Found at': step1Data.manualFoundLocation,
                    'Date found': step1Data.foundAt,
                  }).filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <dt className="text-gray-500 min-w-[70px]">{k}:</dt>
                      <dd className="text-gray-900 font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100 text-xs">
                <h3 className="font-semibold text-gray-800 mb-2 uppercase tracking-wide">Contact Details</h3>
                <dl className="space-y-1">
                  {step2Data && Object.entries({
                    Name: step2Data.finderName,
                    Phone: step2Data.finderPhone,
                    Email: step2Data.finderEmail,
                    'Location Shared': deviceLocation ? `Yes (~ ${Math.round(deviceLocation.accuracy)}m accuracy)` : 'No',
                  }).filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <dt className="text-gray-500 min-w-[70px]">{k}:</dt>
                      <dd className="text-gray-900 font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <label className="flex items-start gap-2.5 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={sharePhoneConsent}
                  onChange={e => setSharePhoneConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-brand-600 rounded border-gray-300"
                />
                <span className="text-xs text-gray-700 leading-snug">
                  <strong>Consent to share contact details:</strong> Allow the verified owner to see my contact details if they confirm ownership of this item.
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={e => setConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-brand-600 rounded border-gray-300"
                />
                <span className="text-xs text-gray-700 leading-snug">
                  I confirm that the information provided is accurate to the best of my knowledge.
                </span>
              </label>

              <ErrorMessage message={error} />

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">
                  <ArrowLeft className="h-4 w-4" /> Edit
                </button>
                <button onClick={submit} disabled={submitting || !confirmed} className="btn-primary flex-1 py-2.5">
                  {submitting ? <><LoadingSpinner size="sm" /> Submitting...</> : <><Send className="h-4 w-4" /> Submit Report</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}