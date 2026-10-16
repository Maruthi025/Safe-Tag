import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../store/AuthContext'
import ErrorMessage from '../../components/shared/ErrorMessage'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { Eye, EyeOff } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().max(20).optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/\d/, 'Password must contain a number'),
  confirmPassword: z.string(),
  agreeTerms: z.literal(true, { errorMap: () => ({ message: 'You must agree to the terms' }) }),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export default function RegisterPage() {
  const { register: registerUser, user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  if (user) { navigate('/admin'); return null }

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setError('')
    try {
      await registerUser({ name: data.name, email: data.email, phone: data.phone, password: data.password, confirmPassword: data.confirmPassword })
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-brand-800 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl mx-auto mb-4">ST</div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Register to protect and manage your belongings</p>
        </div>
        <div className="card">
          <ErrorMessage message={error} className="mb-4" />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input type="text" {...register('name')} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Jane Smith" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email address</label>
              <input type="email" {...register('email')} className={`input ${errors.email ? 'input-error' : ''}`} placeholder="you@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Phone number <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="tel" {...register('phone')} className="input" placeholder="+1 234 567 8900" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} {...register('password')} className={`input pr-10 ${errors.password ? 'input-error' : ''}`} placeholder="Min 8 chars, uppercase, lowercase, digit" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label">Confirm password</label>
              <input type={showPwd ? 'text' : 'password'} {...register('confirmPassword')} className={`input ${errors.confirmPassword ? 'input-error' : ''}`} placeholder="Repeat your password" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <div className="flex items-start gap-2 pt-1">
              <input type="checkbox" id="agreeTerms" {...register('agreeTerms')} className="mt-1 h-4 w-4 text-brand-600 rounded border-gray-300" />
              <label htmlFor="agreeTerms" className="text-xs text-gray-600 leading-tight">
                I agree to the <Link to="/terms" className="text-brand-700 hover:underline">Terms of Use</Link> and <Link to="/privacy" className="text-brand-700 hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.agreeTerms && <p className="text-red-500 text-xs">{errors.agreeTerms.message}</p>}
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5 text-base mt-2">
              {isSubmitting ? <><LoadingSpinner size="sm" /> Creating account...</> : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account? <Link to="/login" className="text-brand-700 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}