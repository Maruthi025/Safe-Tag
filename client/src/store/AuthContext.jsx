import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get('/auth/me')
      setUser(res.data.data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMe() }, [fetchMe])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    if (res.data.data?.token) {
      localStorage.setItem('safetag_token', res.data.data.token)
    }
    setUser(res.data.data.user)
    return res.data.data.user
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    if (res.data.data?.token) {
      localStorage.setItem('safetag_token', res.data.data.token)
    }
    setUser(res.data.data.user)
    return res.data.data.user
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {}
    localStorage.removeItem('safetag_token')
    setUser(null)
  }

  const updateProfile = async (data) => {
    const res = await api.patch('/auth/profile', data)
    setUser(res.data.data.user)
    return res.data.data.user
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}