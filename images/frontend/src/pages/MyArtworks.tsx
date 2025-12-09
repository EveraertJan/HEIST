import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getMyArtworks, getAllArtworks, deleteArtwork, updateArtworkStatus } from '../services/api'
import type { Artwork } from '../types'
import Button from '../components/common/Button'

export default function MyArtworks() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadArtworks()
  }, [user])

  const loadArtworks = async () => {
    try {
      setLoading(true)
      let response
      if (user?.is_admin) {
        // Admins see all artworks with all statuses
        response = await getAllArtworks(100, 0, true)
      } else {
        // Regular users see only their own artworks
        response = await getMyArtworks(100, 0)
      }
      setArtworks(response.data.data)
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
    if (!confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) return

    try {
      await deleteArtwork(uuid)
      setSuccess('Artwork deleted successfully')
      loadArtworks()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete artwork')
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review'
      case 'approved':
        return 'Approved'
      case 'declined':
        return 'Declined'
      default:
        return status
    }
  }

  const getStatusDescription = (status: string, reviewNotes?: string) => {
    switch (status) {
      case 'pending':
        return 'Your artwork is waiting for admin review'
      case 'approved':
        return 'Your artwork has been approved and is visible in the gallery'
      case 'declined':
        return reviewNotes || 'Your artwork was not approved. Please review the feedback.'
      default:
        return ''
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
          <h1 style={{ margin: 0 }}>My Artworks</h1>
          <Button onClick={() => navigate('/artworks/create')} variant="primary" size="large">
            + Create New Artwork
          </Button>
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
            border: '1px solid var(--accent-yellow)',
            borderRadius: '8px',
            color: 'var(--accent-yellow)',
            marginBottom: '24px'
          }}>
            {success}
          </div>
        )}

        {artworks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <p style={{ color: 'var(--secondary-text)', marginBottom: '24px', fontSize: '18px' }}>
              You haven't submitted any artworks yet
            </p>
            <Button onClick={() => navigate('/artworks/create')} variant="primary" size="large">
              Submit Your First Artwork
            </Button>
          </div>
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
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {artworks.map(artwork => (
                    <tr key={artwork.uuid}>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--accent-color)', marginBottom: '4px' }}>
                          {artwork.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                          ID: {artwork.uuid.substring(0, 8)}
                        </div>
                        {artwork.description && (
                          <div style={{ fontSize: '12px', color: 'var(--secondary-text)', marginTop: '4px', maxWidth: '200px' }}>
                            {artwork.description.length > 50 ? `${artwork.description.substring(0, 50)}...` : artwork.description}
                          </div>
                        )}
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
                        <div>
                          <span className={`table-status ${artwork.status}`}>
                            {getStatusLabel(artwork.status)}
                          </span>
                          <div style={{ fontSize: '12px', color: 'var(--secondary-text)', marginTop: '4px', maxWidth: '200px' }}>
                            {getStatusDescription(artwork.status, artwork.review_notes)}
                          </div>
                          {artwork.review_notes && artwork.status === 'declined' && (
                            <div style={{ 
                              fontSize: '11px', 
                              color: 'var(--accent-pink)', 
                              marginTop: '4px',
                              fontStyle: 'italic'
                            }}>
                              Feedback: {artwork.review_notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                          {new Date(artwork.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className="table-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <Button onClick={() => handleEdit(artwork)} variant="info" size="small">
                            Edit
                          </Button>
                          {artwork.status === 'pending' && (
                            <span style={{ 
                              fontSize: '11px', 
                              color: 'var(--secondary-text)',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '4px 8px'
                            }}>
                              Under Review
                            </span>
                          )}
                          {artwork.status === 'declined' && (
                            <Button onClick={() => handleEdit(artwork)} variant="warning" size="small">
                              Resubmit
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