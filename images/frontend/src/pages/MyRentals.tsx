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
              to="/"
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
          <div className="table-container">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Artwork</th>
                    <th>Status</th>
                    <th>Delivery Address</th>
                    <th>Contact</th>
                    <th>Dates</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals.map(rental => (
                    <tr key={rental.uuid}>
                      <td>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--accent-color)', marginBottom: '4px' }}>
                            {rental.artwork_title || rental.artwork?.title}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                            Rental ID: {rental.uuid.substring(0, 8)}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`table-status ${rental.status}`}>
                          {getStatusLabel(rental.status)}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '14px', color: 'var(--primary-text)', maxWidth: '200px', wordBreak: 'break-word' }}>
                          {rental.address}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '14px', color: 'var(--primary-text)' }}>
                          {rental.phone_number}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                          <div>Requested: {new Date(rental.created_at).toLocaleDateString()}</div>
                          {rental.rental_date && (
                            <div>For: {new Date(rental.rental_date).toLocaleDateString()}</div>
                          )}
                          {rental.approved_at && (
                            <div>Approved: {new Date(rental.approved_at).toLocaleDateString()}</div>
                          )}
                          {rental.finalized_at && (
                            <div>Completed: {new Date(rental.finalized_at).toLocaleDateString()}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="table-actions">
                          {rental.artwork_uuid && (
                            <Link
                              to={`/artworks/${rental.artwork_uuid}`}
                              style={{
                                display: 'inline-block',
                                padding: '6px 12px',
                                backgroundColor: 'var(--hover-bg)',
                                color: 'var(--accent-color)',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500',
                                border: '1px solid var(--border-color)'
                              }}
                            >
                              View Artwork
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
