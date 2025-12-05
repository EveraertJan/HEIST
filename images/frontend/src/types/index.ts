export interface User {
  id: number
  uuid: string
  email: string
  first_name: string
  last_name: string
  date_of_birth?: string | null
  user_type: 'student' | 'teacher'
  is_admin?: boolean
  token?: string
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  register: (first_name: string, last_name: string, email: string, password: string, user_type: 'student' | 'teacher') => Promise<void>
  logout: () => void
  loading: boolean
}

export interface Medium {
  id: number
  uuid: string
  name: string
  created_at: string
  updated_at: string
}

export interface Artist {
  uuid: string
  first_name: string
  last_name: string
  email: string
}

export interface Artwork {
  id: number
  uuid: string
  title: string
  description?: string
  size?: string  // Legacy field, will be deprecated
  width?: string
  height?: string
  depth?: string
  created_at: string
  updated_at: string
  artists?: Artist[]
  mediums?: Medium[]
}

export interface Rental {
  id: number
  uuid: string
  artwork_id: number
  user_id: number
  address: string
  phone_number: string
  start_date: string
  end_date: string
  status: 'requested' | 'approved' | 'finalized' | 'rejected'
  approved_by?: number
  approved_at?: string
  finalized_by?: number
  finalized_at?: string
  created_at: string
  updated_at: string
  artwork?: {
    uuid: string
    title: string
    description?: string
  }
  user?: {
    uuid: string
    first_name: string
    last_name: string
    email: string
  }
  artwork_title?: string
  artwork_uuid?: string
  user_first_name?: string
  user_last_name?: string
  user_email?: string
}
