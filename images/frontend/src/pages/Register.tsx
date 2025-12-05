import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(firstName, lastName, email, password, 'teacher')

      navigate('/home')
    } catch (err: any) {
      // Check if the error response contains a message about duplicate email
      if (err.response?.data?.message === 'Email already in use') {
        setError('This email address is already registered. Please use a different email or try logging in.')
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="museum-section">
      <div className="container">
        <div className="museum-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Request Membership</h2>
          {error && <p style={{ color: 'var(--museum-burgundy)', textAlign: 'center', marginBottom: '20px' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label htmlFor="firstName" style={{ fontFamily: '"Inter", sans-serif', fontWeight: '500', marginBottom: '8px', display: 'block' }}>First Name</label>
                <input
                  className="u-full-width"
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  style={{ 
                    border: '1px solid var(--museum-stone)',
                    borderRadius: '4px',
                    padding: '12px',
                    fontFamily: '"Crimson Text", serif',
                    fontSize: '1.1rem'
                  }}
                />
              </div>
              <div>
                <label htmlFor="lastName" style={{ fontFamily: '"Inter", sans-serif', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Last Name</label>
                <input
                  className="u-full-width"
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  style={{ 
                    border: '1px solid var(--museum-stone)',
                    borderRadius: '4px',
                    padding: '12px',
                    fontFamily: '"Crimson Text", serif',
                    fontSize: '1.1rem'
                  }}
                />
              </div>
            </div>

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
              {loading ? 'Processing Application...' : 'Submit Application'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '30px', fontFamily: '"Crimson Text", serif' }}>
            Already a member? <Link to="/login" style={{ color: 'var(--museum-burgundy)' }}>Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
