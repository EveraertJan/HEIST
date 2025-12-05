import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/common/Button'

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

      navigate('/')
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
                fontSize: '12pt',
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

            <Button type="submit" variant="primary" size="large" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Entering Gallery...' : 'Enter Gallery'}
            </Button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '30px', fontFamily: '"Crimson Text", serif' }}>
            New to our museum? <Link to="/register" style={{ color: 'var(--museum-burgundy)' }}>Request membership</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
