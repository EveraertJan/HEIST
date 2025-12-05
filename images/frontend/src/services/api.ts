import axios from 'axios'
import MD5 from 'crypto-js/md5'
import type { User} from '../types'

// Use /api prefix for Vite proxy, or direct URL for development
const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  config.headers['Content-Type'] = "application/json"
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Hash password with MD5 before sending
const hashPassword = (password: string): string => {
  return MD5(password).toString()
}

// Auth APIs
export const loginUser = (email: string, password: string) =>
  api.post<User & { token: string }>('/users/login', { email, password: hashPassword(password) })

export const registerUser = (first_name: string, last_name: string, email: string, password: string, user_type: 'student' | 'teacher') =>
  api.post<User & { token: string }>('/users/register', { first_name, last_name, email, password: hashPassword(password), user_type })

export const validateToken = () =>
  api.get<User>('/users/validate_token')

export const getProfile = () =>
  api.get<User>('/users/profile')

export const updateProfile = (data: { first_name?: string; last_name?: string; email?: string; date_of_birth?: string | null }) =>
  api.put<User & { token: string }>('/users/profile', data)

export const changePassword = (current_password: string, new_password: string) =>
  api.put('/users/password', { current_password, new_password })

export const deleteAccount = () =>
  api.delete('/users/account')


export default api
