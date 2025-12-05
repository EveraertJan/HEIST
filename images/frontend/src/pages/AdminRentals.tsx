import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getAllRentals, approveRental, rejectRental, finalizeRental } from '../services/api'
import type { Rental } from '../types'
import Button from '../components/common/Button'

export default function AdminRentals() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState<'all' | 'requested' | 'approved' | 'finalized'>('all')

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/home')
      return
    }
    loadRentals()
  }, [user])

  const loadRentals = async () => {
    try {
      setLoading(true)
      const response = await getAllRentals()
      setRentals(response.data.data)
    } catch (err) {
      setError('Failed to load rentals')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (uuid: string) => {
    if (!confirm('Approve this rental request?')) return

    try {
      await approveRental(uuid)
      setSuccess('Rental approved successfully')
      loadRentals()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve rental')
    }
  }

  const handleReject = async (uuid: string) => {
    if (!confirm('Reject this rental request?')) return

    try {
      await rejectRental(uuid)
      setSuccess('Rental rejected')
      loadRentals()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject rental')
    }
  }

  const handleFinalize = async (uuid: string) => {
    if (!confirm('Mark this rental as finalized (artwork returned)?')) return

    try {
      await finalizeRental(uuid)
      setSuccess('Rental finalized successfully')
      loadRentals()
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

  const filteredRentals = rentals.filter(rental => {
    if (filter === 'all') return true
    return rental.status === filter
  })

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--secondary-text)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <div className="container" style={{ padding: '48px 24px', maxWidth: '1400px' }}>
        <h1 style={{ marginBottom: '32px' }}>Admin: Manage Rentals</h1>

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

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'primary' : 'secondary'}
            size="small"
          >
            All ({rentals.length})
          </Button>
          <Button
            onClick={() => setFilter('requested')}
            variant={filter === 'requested' ? 'primary' : 'secondary'}
            size="small"
          >
            Pending ({rentals.filter(r => r.status === 'requested').length})
          </Button>
          <Button
            onClick={() => setFilter('approved')}
            variant={filter === 'approved' ? 'primary' : 'secondary'}
            size="small"
          >
            Approved ({rentals.filter(r => r.status === 'approved').length})
          </Button>
          <Button
            onClick={() => setFilter('finalized')}
            variant={filter === 'finalized' ? 'primary' : 'secondary'}
            size="small"
          >
            Completed ({rentals.filter(r => r.status === 'finalized').length})
          </Button>
        </div>

        {/* Rentals Grid */}
        {filteredRentals.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--secondary-text)', padding: '40px' }}>
            No rentals found
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '24px'
          }}>
            {filteredRentals.map(rental => (
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
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
                      {rental.artwork_title}
                    </h3>
                    <p style={{ color: 'var(--secondary-text)', fontSize: '14px' }}>
                      Requested by: {rental.user_first_name} {rental.user_last_name}
                    </p>
                  </div>
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
                    Up to 1 month from approval
                  </p>
                  {rental.expected_return_date && (
                    <p style={{ color: 'var(--secondary-text)', fontSize: '12px' }}>
                      Expected return: {new Date(rental.expected_return_date).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <p style={{ color: 'var(--secondary-text)', fontSize: '14px', marginBottom: '4px' }}>
                    <strong>Contact:</strong>
                  </p>
                  <p style={{ color: 'var(--primary-text)', fontSize: '14px' }}>
                    {rental.user_email}
                  </p>
                  <p style={{ color: 'var(--primary-text)', fontSize: '14px' }}>
                    {rental.phone_number}
                  </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: 'var(--secondary-text)', fontSize: '14px', marginBottom: '4px' }}>
                    <strong>Delivery Address:</strong>
                  </p>
                  <p style={{ color: 'var(--primary-text)', fontSize: '14px' }}>
                    {rental.address}
                  </p>
                </div>

                <div style={{ marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
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

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {rental.status === 'requested' && (
                    <>
                      <Button onClick={() => handleApprove(rental.uuid)} variant="success" size="small">
                        Approve
                      </Button>
                      <Button onClick={() => handleReject(rental.uuid)} variant="danger" size="small">
                        Reject
                      </Button>
                    </>
                  )}
                  {rental.status === 'approved' && (
                    <Button onClick={() => handleFinalize(rental.uuid)} variant="primary" size="small">
                      Mark as Returned
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
