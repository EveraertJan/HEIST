import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createMedium, getAllMediums } from '../services/api'
import type { Medium } from '../types'

export default function AdminMediums() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [mediums, setMediums] = useState<Medium[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/home')
      return
    }
    loadMediums()
  }, [user])

  const loadMediums = async () => {
    try {
      setLoading(true)
      const response = await getAllMediums()
      setMediums(response.data.data)
    } catch (err) {
      setError('Failed to load mediums')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await createMedium(name)
      setSuccess('Medium created successfully')
      setName('')
      loadMediums()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create medium')
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--secondary-text)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <div className="container" style={{ padding: '48px 24px', maxWidth: '800px' }}>
        <h1 style={{ marginBottom: '32px' }}>Admin: Manage Mediums</h1>

        {error && (
          <div className="error-message" style={{
            padding: '16px',
            backgroundColor: 'rgba(255, 107, 157, 0.1)',
            border: '1px solid var(--accent-pink)',
            borderRadius: '8px',
            color: 'var(--accent-pink)',
            marginBottom: '24px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message" style={{
            padding: '16px',
            backgroundColor: 'rgba(74, 158, 255, 0.1)',
            border: '1px solid var(--accent-blue)',
            borderRadius: '8px',
            color: 'var(--accent-blue)',
            marginBottom: '24px'
          }}>
            {success}
          </div>
        )}

        {/* Create Form */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '48px'
        }}>
          <h2 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>Create New Medium</h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--secondary-text)',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                Medium Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g., Oil Paint, Watercolor, Digital"
                style={{ width: '100%' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '14px 32px',
                backgroundColor: 'var(--accent-color)',
                color: 'var(--primary-bg)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Create Medium
            </button>
          </form>
        </div>

        {/* Mediums List */}
        <h2 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>Existing Mediums</h2>
        {mediums.length === 0 ? (
          <p style={{ color: 'var(--secondary-text)', textAlign: 'center', padding: '40px' }}>
            No mediums created yet
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {mediums.map(medium => (
              <div
                key={medium.uuid}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  fontSize: '16px',
                  color: 'var(--primary-text)'
                }}
              >
                {medium.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
