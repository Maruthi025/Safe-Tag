import { useForm } from 'react-hook-form'
import { useAuth } from '../../store/AuthContext'
import { useState } from 'react'
import ErrorMessage from '../../components/shared/ErrorMessage'
import SuccessMessage from '../../components/shared/SuccessMessage'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { name: user?.name || '', phone: user?.phone || '' }
  })

  const onSubmit = async (data) => {
    setError(''); setSuccess('')
    try {
      await updateProfile(data)
      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.')
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>
      <div className="card">
        <div className="mb-6 pb-6 border-b border-gray-100 flex items-center gap-4">
          <div className="bg-brand-800 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-400 text-xs">{user?.email}</p>
          </div>
        </div>
        <ErrorMessage message={error} className="mb-4" />
        <SuccessMessage message={success} className="mb-4" />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input {...register('name')} className="input" />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input {...register('phone')} className="input" placeholder="+1 234 567 8900" />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input value={user?.email || ''} disabled className="input bg-gray-50 text-gray-400 cursor-not-allowed" />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary text-sm mt-2">
            {isSubmitting ? <><LoadingSpinner size="sm" /> Saving...</> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}