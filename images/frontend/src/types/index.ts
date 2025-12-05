export interface User {
  id: number
  uuid: string
  email: string
  first_name: string
  last_name: string
  date_of_birth?: string | null
  user_type: 'student' | 'teacher'
  token?: string
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  register: (first_name: string, last_name: string, email: string, password: string, user_type: 'student' | 'teacher') => Promise<void>
  logout: () => void
  loading: boolean
}
