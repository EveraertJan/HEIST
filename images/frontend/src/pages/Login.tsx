import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const userData = await login(email, password)

      // Check user_type and redirect accordingly
      if (userData.user_type === 'student') {
        // Redirect to student domain
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        if (isLocalhost) {
          window.location.href = 'http://localhost:5174/home'
        } else {
          window.location.href = 'https://student.checkpoint.academy/home'
        }
      } else {
        navigate('/home')
      }
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="museum-section">
      <div className="container">
        <div className="museum-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Member Access</h2>
          {error && <p style={{ color: 'var(--museum-burgundy)', textAlign: 'center', marginBottom: '20px' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="email" style={{ fontFamily: '"Inter", sans-serif', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Email</label>
            <input
              className="u-full-width"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ 
                border: '1px solid var(--museum-stone)',
                borderRadius: '4px',
                padding: '12px',
                fontFamily: '"Crimson Text", serif',
                fontSize: '1.1rem',
                marginBottom: '20px'
              }}
            />

            <label htmlFor="password" style={{ fontFamily: '"Inter", sans-serif', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Password</label>
            <input
              className="u-full-width"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ 
                border: '1px solid var(--museum-stone)',
                borderRadius: '4px',
                padding: '12px',
                fontFamily: '"Crimson Text", serif',
                fontSize: '1.1rem',
                marginBottom: '30px'
              }}
            />

            <button className="button-primary u-full-width" type="submit" disabled={loading} style={{ padding: '15px' }}>
              {loading ? 'Entering Gallery...' : 'Enter Gallery'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '30px', fontFamily: '"Crimson Text", serif' }}>
            New to our museum? <Link to="/register" style={{ color: 'var(--museum-burgundy)' }}>Request membership</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
