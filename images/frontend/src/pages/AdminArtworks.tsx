import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { deleteArtwork, getAllArtworks } from '../services/api'
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
    if (!user?.is_admin) {
      navigate('/')
      return
    }
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const artworksRes = await getAllArtworks(100, 0)
      setArtworks(artworksRes.data.data)
    } catch (err) {
      setError('Failed to load artworks')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (artwork: Artwork) => {
    navigate(`/admin/artworks/edit/${artwork.uuid}`)
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
          <h1 style={{ margin: 0 }}>Admin: Manage Artworks</h1>
          <Button onClick={() => navigate('/admin/artworks/create')} variant="primary" size="large">
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
            border: '1px solid var(--accent-blue)',
            borderRadius: '8px',
            color: 'var(--accent-blue)',
            marginBottom: '24px'
          }}>
            {success}
          </div>
        )}

        {/* Artworks Table */}
        <h2 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>Existing Artworks ({artworks.length})</h2>
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
                    <th>Description</th>
                    <th>Dimensions</th>
                    <th>Artists</th>
                    <th>Mediums</th>
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
                        <div style={{ fontSize: '14px', color: 'var(--primary-text)', maxWidth: '200px' }}>
                          {artwork.description && artwork.description.length > 100
                            ? `${artwork.description.substring(0, 100)}...`
                            : artwork.description || '-'}
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
                          {artwork.artists?.length > 0
                            ? artwork.artists.map(a => `${a.first_name} ${a.last_name}`).join(', ')
                            : '-'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '14px', color: 'var(--primary-text)' }}>
                          {artwork.mediums?.length > 0
                            ? artwork.mediums.map(m => m.name).join(', ')
                            : '-'}
                        </div>
                      </td>
                      <td>
                        <span className={`table-status ${artwork.is_available ? 'active' : 'cancelled'}`}>
                          {artwork.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <Button onClick={() => handleEdit(artwork)} variant="info" size="small">
                            Edit
                          </Button>
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
