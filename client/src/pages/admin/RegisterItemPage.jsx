import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import api from '../../services/api'
import ErrorMessage from '../../components/shared/ErrorMessage'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const CATEGORIES = ['Mobile Phone', 'Laptop', 'Bag', 'Wallet', 'Keys', 'Water Bottle', 'Documents', 'Watch', 'Accessories', 'Other']

const schema = z.object({
  name: z.string().min(1, 'Item name is required').max(150),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(5, 'Please provide a short description').max(1000),
  brand: z.string().max(100).optional().or(z.literal('')),
  color: z.string().max(50).optional().or(z.literal('')),
  identifyingFeatures: z.string().max(500).optional().or(z.literal('')),
  serialNumber: z.string().max(100).optional().or(z.literal('')),
})

export default function RegisterItemPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { category: '' }
  })

  const onSubmit = async (data) => {
    setError('')
    try {
      await api.post('/items', data)
      navigate('/admin/items')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register item.')
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Register a Belonging</h1>
        <p className="text-gray-500 text-sm">Add item details to match against incoming found reports</p>
      </div>
      <div className="card">
        <ErrorMessage message={error} className="mb-4" />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Item Name *</label>
              <input {...register('name')} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="e.g., iPhone 14 Pro" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Category *</label>
              <select {...register('category')} className={`input ${errors.category ? 'input-error' : ''}`}>
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea {...register('description')} rows={3} className={`input resize-none ${errors.description ? 'input-error' : ''}`} placeholder="Provide recognizable details" />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Brand / Manufacturer</label>
              <input {...register('brand')} className="input" placeholder="e.g., Apple, Dell" />
            </div>
            <div>
              <label className="label">Color</label>
              <input {...register('color')} className="input" placeholder="e.g., Space Gray" />
            </div>
          </div>
          <div>
            <label className="label">Identifying Features</label>
            <textarea {...register('identifyingFeatures')} rows={2} className="input resize-none" placeholder="Engravings, scratches, case color..." />
          </div>
          <div>
            <label className="label">Serial Number (optional)</label>
            <input {...register('serialNumber')} className="input" placeholder="Helps decisively confirm ownership" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => navigate('/admin/items')} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? <><LoadingSpinner size="sm" /> Registering...</> : 'Save Belonging'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}