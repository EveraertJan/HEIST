import axios from 'axios'
import MD5 from 'crypto-js/md5'
import type { User, Artwork, Medium, Rental } from '../types'

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

// User APIs
export const getAllUsers = () =>
  api.get<{ success: boolean; data: User[] }>('/users')

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

// Artwork APIs
export const getAllArtworks = (limit = 50, offset = 0) =>
  api.get<{ success: boolean; data: Artwork[]; pagination: any }>('/artworks', { params: { limit, offset } })

export const searchArtworks = (search?: string, mediums?: string[], limit = 50, offset = 0) =>
  api.get<{ success: boolean; data: Artwork[]; filters: any; pagination: any }>('/artworks/search', {
    params: {
      search,
      mediums: mediums?.join(','),
      limit,
      offset
    }
  })

export const getArtworkByUuid = (uuid: string) =>
  api.get<{ success: boolean; data: Artwork }>(`/artworks/${uuid}`)

export const createArtwork = (data: { title: string; description?: string; width?: string; height?: string; depth?: string; artistUuids: string[]; mediumUuids?: string[] }) =>
  api.post<{ success: boolean; data: Artwork }>('/artworks', data)

export const updateArtwork = (uuid: string, data: { title?: string; description?: string; width?: string; height?: string; depth?: string }) =>
  api.put<{ success: boolean; data: Artwork }>(`/artworks/${uuid}`, data)

export const deleteArtwork = (uuid: string) =>
  api.delete(`/artworks/${uuid}`)

// Medium APIs
export const getAllMediums = () =>
  api.get<{ success: boolean; data: Medium[] }>('/mediums')

export const createMedium = (name: string) =>
  api.post<{ success: boolean; data: Medium }>('/mediums', { name })

// Rental APIs
export const getMyRentals = () =>
  api.get<{ success: boolean; data: Rental[] }>('/rentals/my-rentals')

export const getAllRentals = (limit = 50, offset = 0) =>
  api.get<{ success: boolean; data: Rental[]; pagination: any }>('/rentals', { params: { limit, offset } })

export const getPendingRentals = () =>
  api.get<{ success: boolean; data: Rental[] }>('/rentals/pending')

export const getRentalByUuid = (uuid: string) =>
  api.get<{ success: boolean; data: Rental }>(`/rentals/${uuid}`)

export const checkArtworkAvailability = (artworkUuid: string, startDate: string, endDate: string) =>
  api.post<{ success: boolean; data: { available: boolean } }>('/rentals/check-availability', { artworkUuid, startDate, endDate })

export const createRentalRequest = (data: { artworkUuid: string; address: string; phoneNumber: string; startDate: string; endDate: string }) =>
  api.post<{ success: boolean; data: Rental }>('/rentals', data)

export const approveRental = (uuid: string) =>
  api.put<{ success: boolean; data: Rental }>(`/rentals/${uuid}/approve`)

export const rejectRental = (uuid: string) =>
  api.put<{ success: boolean; data: Rental }>(`/rentals/${uuid}/reject`)

export const finalizeRental = (uuid: string) =>
  api.put<{ success: boolean; data: Rental }>(`/rentals/${uuid}/finalize`)

export default api
