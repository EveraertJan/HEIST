import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getRentalByUuid, approveRental, rejectRental, finalizeRental } from '../services/api'
import type { Rental } from '../types'
import Button from '../components/common/Button'

export default function RentalDetail() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { uuid } = useParams<{ uuid: string }>()

  const [rental, setRental] = useState<Rental | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/home')
      return
    }
    if (uuid) {
      loadRental()
    }
  }, [user, uuid, navigate])

  const loadRental = async () => {
    try {
      setLoading(true)
      const response = await getRentalByUuid(uuid!)
      setRental(response.data.data)
    } catch (err) {
      setError('Failed to load rental details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!confirm('Approve this rental request?')) return

    try {
      await approveRental(uuid!)
      setSuccess('Rental approved successfully')
      loadRental()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve rental')
    }
  }

  const handleReject = async () => {
    if (!confirm('Reject this rental request?')) return

    try {
      await rejectRental(uuid!)
      setSuccess('Rental rejected')
      loadRental()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject rental')
    }
  }

  const handleFinalize = async () => {
    if (!confirm('Mark this rental as finalized (artwork returned)?')) return

    try {
      await finalizeRental(uuid!)
      setSuccess('Rental finalized successfully')
      loadRental()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to finalize rental')
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
        return 'Pending'
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

  if (!rental) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
        <div className="container" style={{ padding: '48px 24px', maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2 style={{ marginBottom: '16px' }}>Rental not found</h2>
            <Button onClick={() => navigate('/admin/rentals')} variant="secondary">
              Back to Rentals
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <div className="container" style={{ padding: '48px 24px', maxWidth: '1000px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <Button 
            onClick={() => navigate('/admin/rentals')} 
            variant="secondary" 
            size="small"
          >
            ← Back to Rentals
          </Button>
          <h1 style={{ margin: 0 }}>Rental Details</h1>
        </div>

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

        {success && (
          <div style={{
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Rental Information */}
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '24px'
          }}>
            <h2 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Rental Information</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                Rental ID
              </div>
              <div style={{ fontSize: '14px', color: 'var(--primary-text)' }}>
                {rental.uuid}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                Status
              </div>
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: `${getStatusColor(rental.status)}20`,
                color: getStatusColor(rental.status),
                border: `1px solid ${getStatusColor(rental.status)}40`
              }}>
                {getStatusLabel(rental.status)}
              </span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                Requested Date
              </div>
              <div style={{ fontSize: '14px', color: 'var(--primary-text)' }}>
                {new Date(rental.created_at).toLocaleDateString()} at {new Date(rental.created_at).toLocaleTimeString()}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                Expected Return Date
              </div>
              <div style={{ fontSize: '14px', color: 'var(--primary-text)' }}>
                {new Date(rental.expected_return_date).toLocaleDateString()}
              </div>
            </div>

            {rental.approved_at && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                  Approved Date
                </div>
                <div style={{ fontSize: '14px', color: 'var(--primary-text)' }}>
                  {new Date(rental.approved_at).toLocaleDateString()} at {new Date(rental.approved_at).toLocaleTimeString()}
                </div>
              </div>
            )}

            {rental.finalized_at && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                  Completed Date
                </div>
                <div style={{ fontSize: '14px', color: 'var(--primary-text)' }}>
                  {new Date(rental.finalized_at).toLocaleDateString()} at {new Date(rental.finalized_at).toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '24px'
          }}>
            <h2 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Customer Information</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                Name
              </div>
              <div style={{ fontSize: '14px', color: 'var(--primary-text)' }}>
                {rental.user_first_name} {rental.user_last_name}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                Email
              </div>
              <div style={{ fontSize: '14px', color: 'var(--primary-text)' }}>
                {rental.user_email}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                Phone
              </div>
              <div style={{ fontSize: '14px', color: 'var(--primary-text)' }}>
                {rental.phone_number}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                Address
              </div>
              <div style={{ fontSize: '14px', color: 'var(--primary-text)', lineHeight: '1.5' }}>
                {rental.address}
              </div>
            </div>
          </div>
        </div>

        {/* Artwork Information */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '24px',
          marginTop: '24px'
        }}>
          <h2 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Artwork Information</h2>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
              Title
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--accent-color)' }}>
              {rental.artwork_title}
            </div>
          </div>

          {rental.artwork?.description && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                Description
              </div>
              <div style={{ fontSize: '14px', color: 'var(--primary-text)', lineHeight: '1.5' }}>
                {rental.artwork.description}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
              Artwork ID
            </div>
            <div style={{ fontSize: '14px', color: 'var(--primary-text)' }}>
              {rental.artwork_uuid || rental.artwork?.uuid}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '24px',
          marginTop: '24px'
        }}>
          <h2 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Actions</h2>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {rental.status === 'requested' && (
              <>
                <Button onClick={handleApprove} variant="success" size="large">
                  Approve Rental
                </Button>
                <Button onClick={handleReject} variant="danger" size="large">
                  Reject Rental
                </Button>
              </>
            )}
            
            {rental.status === 'approved' && (
              <Button onClick={handleFinalize} variant="primary" size="large">
                Mark as Returned
              </Button>
            )}
            
            {rental.status === 'finalized' && (
              <div style={{ padding: '12px 20px', backgroundColor: 'var(--hover-bg)', borderRadius: '8px', color: 'var(--secondary-text)' }}>
                This rental has been completed
              </div>
            )}
            
            {rental.status === 'rejected' && (
              <div style={{ padding: '12px 20px', backgroundColor: 'var(--hover-bg)', borderRadius: '8px', color: 'var(--secondary-text)' }}>
                This rental was rejected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}