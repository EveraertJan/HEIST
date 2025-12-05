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
      navigate('/')
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

        {/* Rentals Table */}
        {filteredRentals.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--secondary-text)', padding: '40px' }}>
            No rentals found
          </p>
        ) : (
          <div className="table-container">
            <div className="table-responsive">
              <table className="table">
                 <thead>
                   <tr>
                     <th>Artwork</th>
                     <th>Customer</th>
                     <th>Contact</th>
                     <th>Status</th>
                     <th>Actions</th>
                   </tr>
                 </thead>
                <tbody>
                  {filteredRentals.map(rental => (
                    <tr key={rental.uuid}>
                       <td>
                         <div style={{ fontWeight: '600', color: 'var(--accent-color)' }}>
                           {rental.artwork_title}
                         </div>
                       </td>
                       <td>
                         <div>
                           <div style={{ fontWeight: '500', color: 'var(--primary-text)' }}>
                             {rental.user_first_name} {rental.user_last_name}
                           </div>
                           <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                             {rental.user_email}
                           </div>
                         </div>
                       </td>
                       <td>
                         <div style={{ fontSize: '14px', color: 'var(--primary-text)' }}>
                           {rental.phone_number}
                         </div>
                       </td>
                       <td>
                         <span className={`table-status ${rental.status}`}>
                           {getStatusLabel(rental.status)}
                         </span>
                       </td>
                       <td>
                         <div className="table-actions">
                           <Button 
                             onClick={() => navigate(`/admin/rentals/${rental.uuid}`)} 
                             variant="info" 
                             size="small"
                           >
                             View Details
                           </Button>
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
                               Return
                             </Button>
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
