import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../../services/api'
import ErrorMessage from '../../components/shared/ErrorMessage'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const schema = z.object({
  itemId: z.string().min(1, 'Please select an item'),
  lostAt: z.string().min(1, 'Please enter when you lost it'),
  lastKnownLocation: z.string().max(500).optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
})

export default function ReportLostPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedItemId = searchParams.get('itemId')
  const [items, setItems] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/items?status=registered').then(r => setItems(r.data.data.items || []))
  }, [])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { itemId: preselectedItemId || '' }
  })

  const onSubmit = async (data) => {
    setError('')
    try {
      await api.post('/lost-reports', data)
      navigate('/admin/lost-reports')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit lost report.')
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Report Item as Lost</h1>
      <div className="card">
        <ErrorMessage message={error} className="mb-4" />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Select Registered Belonging *</label>
            <select {...register('itemId')} className={`input ${errors.itemId ? 'input-error' : ''}`}>
              <option value="">Choose an item</option>
              {items.map(i => <option key={i._id} value={i._id}>{i.name} — {i.category}</option>)}
            </select>
            {errors.itemId && <p className="text-red-500 text-xs mt-1">{errors.itemId.message}</p>}
          </div>
          <div>
            <label className="label">Date & Time Lost *</label>
            <input type="datetime-local" {...register('lostAt')} className={`input ${errors.lostAt ? 'input-error' : ''}`} />
            {errors.lostAt && <p className="text-red-500 text-xs mt-1">{errors.lostAt.message}</p>}
          </div>
          <div>
            <label className="label">Last Known Location</label>
            <input {...register('lastKnownLocation')} className="input" placeholder="e.g., Coffee shop on 5th Ave" />
          </div>
          <div>
            <label className="label">Additional Circumstances</label>
            <textarea {...register('description')} rows={3} className="input resize-none" placeholder="Any additional context about the loss" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => navigate('/admin/lost-reports')} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-danger">
              {isSubmitting ? <><LoadingSpinner size="sm" /> Submitting...</> : 'Mark as Lost'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}