/**
 * AdminArtworks Page
 *
 * Admin interface for managing artworks in the system.
 *
 * Structure:
 * - Header with "Create New Artwork" button
 * - Success/Error message notifications
 * - Artworks table displaying all artworks with:
 *   - Title, Description, Dimensions, Artists, Mediums, Availability
 *   - Edit button (navigates to CreateArtwork page in edit mode)
 *   - Delete button (with confirmation)
 *
 * Features:
 * - View all artworks in a table format
 * - Navigate to create new artwork
 * - Navigate to edit existing artwork
 * - Delete artwork with confirmation
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { deleteArtwork, getAllArtworks, getMyArtworks, updateArtworkStatus } from '../services/api'
import type { Artwork } from '../types'
import Button from '../components/common/Button'

export default function AdminArtworks() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      // Admins get all artworks, creators get only their own
      const artworksRes = user?.is_admin
        ? await getAllArtworks(100, 0, true) // Admin: all statuses
        : await getMyArtworks(100, 0) // Creator: own artworks only
      setArtworks(artworksRes.data.data)
    } catch (err) {
      setError('Failed to load artworks')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (artwork: Artwork) => {
    navigate(`/artworks/edit/${artwork.uuid}`)
  }

  const handleDelete = async (uuid: string) => {
    if (!confirm('Are you sure you want to delete this artwork?')) return

    try {
      await deleteArtwork(uuid)
      setSuccess('Artwork deleted successfully')
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete artwork')
    }
  }

  const handleApprove = async (uuid: string) => {
    try {
      await updateArtworkStatus(uuid, 'approved')
      setSuccess('Artwork approved successfully')
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve artwork')
    }
  }

  const handleDecline = async (uuid: string) => {
    const reviewNotes = prompt('Please provide review notes for declining this artwork:')
    if (reviewNotes === null) return // User cancelled

    try {
      await updateArtworkStatus(uuid, 'declined', reviewNotes)
      setSuccess('Artwork declined successfully')
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to decline artwork')
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ margin: 0 }}>
            {user?.is_admin ? 'Manage Artworks' : 'My Artworks'}
          </h1>
          <Button onClick={() => navigate('/artworks/create')} variant="primary" size="large">
            + Create New Artwork
          </Button>
        </div>

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
            border: '1px solid var(--accent-yellow)',
            borderRadius: '8px',
            color: 'var(--accent-yellow)',
            marginBottom: '24px'
          }}>
            {success}
          </div>
        )}

        {/* Artworks Table */}
        {artworks.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--secondary-text)', padding: '40px' }}>
            No artworks created yet. Click "Create New Artwork" to add your first artwork.
          </p>
        ) : (
          <div className="table-container">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Dimensions</th>
                    <th>Artists</th>
                    <th>Status</th>
                    <th>Availability</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {artworks.map(artwork => (
                    <tr key={artwork.uuid}>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--accent-color)' }}>
                          {artwork.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                          ID: {artwork.uuid.substring(0, 8)}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '14px', color: 'var(--primary-text)' }}>
                          {(artwork.width || artwork.height || artwork.depth)
                            ? [
                                artwork.width && `W: ${artwork.width}`,
                                artwork.height && `H: ${artwork.height}`,
                                artwork.depth && `D: ${artwork.depth}`
                              ].filter(Boolean).join(' × ')
                            : '-'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '14px', color: 'var(--primary-text)' }}>
                          {artwork.artists && artwork.artists.length > 0
                            ? artwork.artists.map(a => `${a.first_name} ${a.last_name}`).join(', ')
                            : '-'}
                        </div>
                      </td>
                      <td>
                        <span className={`table-status ${artwork.status}`}>
                          {artwork.status.charAt(0).toUpperCase() + artwork.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <span className="table-status active">
                          Available
                        </span>
                      </td>
                      <td>
                        <div className="table-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <Button onClick={() => handleEdit(artwork)} variant="info" size="small">
                            Edit
                          </Button>
                          {/* Only admins can approve/decline */}
                          {user?.is_admin && artwork.status === 'pending' && (
                            <>
                              <Button onClick={() => handleApprove(artwork.uuid)} variant="success" size="small">
                                Approve
                              </Button>
                              <Button onClick={() => handleDecline(artwork.uuid)} variant="warning" size="small">
                                Decline
                              </Button>
                            </>
                          )}
                          {user?.is_admin && artwork.status === 'declined' && (
                            <Button onClick={() => handleApprove(artwork.uuid)} variant="success" size="small">
                              Approve
                            </Button>
                          )}
                          <Button onClick={() => handleDelete(artwork.uuid)} variant="danger" size="small">
                            Delete
                          </Button>
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
