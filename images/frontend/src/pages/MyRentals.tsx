import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getMyRentals } from '../services/api'
import type { Rental } from '../types'

export default function MyRentals() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadRentals()
  }, [user])

  const loadRentals = async () => {
    try {
      setLoading(true)
      const response = await getMyRentals()
      setRentals(response.data.data)
    } catch (err) {
      setError('Failed to load your rentals')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested':
        return 'var(--accent-blue)'
      case 'approved':
        return '#4caf50'
      case 'finalized':
        return 'var(--secondary-text)'
      case 'rejected':
        return 'var(--accent-pink)'
      default:
        return 'var(--primary-text)'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'requested':
        return 'Pending Approval'
      case 'approved':
        return 'Approved'
      case 'finalized':
        return 'Completed'
      case 'rejected':
        return 'Rejected'
      default:
        return status
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
      <div className="container" style={{ padding: '48px 24px', maxWidth: '1200px' }}>
        <h1 style={{ marginBottom: '32px' }}>My Rental Requests</h1>

        {error && (
          <div style={{
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

        {rentals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <p style={{ color: 'var(--secondary-text)', marginBottom: '24px', fontSize: '18px' }}>
              You haven't requested any artworks yet
            </p>
            <Link
              to="/home"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: 'var(--accent-color)',
                color: 'var(--primary-bg)',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Browse Gallery
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {rentals.map(rental => (
              <div
                key={rental.uuid}
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '24px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0' }}>
                    {rental.artwork_title || rental.artwork?.title}
                  </h3>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: `${getStatusColor(rental.status)}20`,
                    color: getStatusColor(rental.status),
                    whiteSpace: 'nowrap'
                  }}>
                    {getStatusLabel(rental.status)}
                  </span>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <p style={{ color: 'var(--secondary-text)', fontSize: '14px', marginBottom: '4px' }}>
                    <strong>Rental Period:</strong>
                  </p>
                  <p style={{ color: 'var(--primary-text)', fontSize: '14px' }}>
                    {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                  </p>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <p style={{ color: 'var(--secondary-text)', fontSize: '14px', marginBottom: '4px' }}>
                    <strong>Delivery Address:</strong>
                  </p>
                  <p style={{ color: 'var(--primary-text)', fontSize: '14px' }}>
                    {rental.address}
                  </p>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <p style={{ color: 'var(--secondary-text)', fontSize: '14px', marginBottom: '4px' }}>
                    <strong>Phone:</strong>
                  </p>
                  <p style={{ color: 'var(--primary-text)', fontSize: '14px' }}>
                    {rental.phone_number}
                  </p>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <p style={{ color: 'var(--secondary-text)', fontSize: '12px' }}>
                    Requested: {new Date(rental.created_at).toLocaleDateString()}
                  </p>
                  {rental.status === 'approved' && rental.approved_at && (
                    <p style={{ color: 'var(--secondary-text)', fontSize: '12px' }}>
                      Approved: {new Date(rental.approved_at).toLocaleDateString()}
                    </p>
                  )}
                  {rental.status === 'finalized' && rental.finalized_at && (
                    <p style={{ color: 'var(--secondary-text)', fontSize: '12px' }}>
                      Completed: {new Date(rental.finalized_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {rental.artwork_uuid && (
                  <Link
                    to={`/artworks/${rental.artwork_uuid}`}
                    style={{
                      display: 'inline-block',
                      marginTop: '12px',
                      padding: '8px 16px',
                      backgroundColor: 'var(--hover-bg)',
                      color: 'var(--accent-color)',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: '500',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    View Artwork
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
