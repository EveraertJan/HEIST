import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createArtwork, updateArtwork, deleteArtwork, getAllArtworks, getAllMediums, getAllUsers } from '../services/api'
import type { Artwork, Medium, User } from '../types'
import Button from '../components/common/Button'

export default function AdminArtworks() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [mediums, setMediums] = useState<Medium[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [isEditing, setIsEditing] = useState(false)
  const [editingUuid, setEditingUuid] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [depth, setDepth] = useState('')
  const [selectedArtistUuids, setSelectedArtistUuids] = useState<string[]>([])
  const [selectedMediumUuids, setSelectedMediumUuids] = useState<string[]>([])

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/home')
      return
    }
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const [artworksRes, mediumsRes, usersRes] = await Promise.all([
        getAllArtworks(100, 0),
        getAllMediums(),
        getAllUsers()
      ])
      setArtworks(artworksRes.data.data)
      setMediums(mediumsRes.data.data)
      setUsers(usersRes.data.data)
    } catch (err) {
      setError('Failed to load data')
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
      if (!user?.uuid) {
        setError('User not authenticated')
        return
      }

      // Validate at least one artist is selected
      if (selectedArtistUuids.length === 0) {
        setError('Please select at least one artist')
        return
      }

      if (isEditing && editingUuid) {
        await updateArtwork(editingUuid, { title, description, width, height, depth })
        setSuccess('Artwork updated successfully')
      } else {
        await createArtwork({
          title,
          description,
          width,
          height,
          depth,
          artistUuids: selectedArtistUuids,
          mediumUuids: selectedMediumUuids
        })
        setSuccess('Artwork created successfully')
      }

      resetForm()
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save artwork')
    }
  }

  const handleEdit = (artwork: Artwork) => {
    setIsEditing(true)
    setEditingUuid(artwork.uuid)
    setTitle(artwork.title)
    setDescription(artwork.description || '')
    setWidth(artwork.width || '')
    setHeight(artwork.height || '')
    setDepth(artwork.depth || '')
    setSelectedArtistUuids(artwork.artists?.map(a => a.uuid) || [])
    setSelectedMediumUuids(artwork.mediums?.map(m => m.uuid) || [])
    window.scrollTo(0, 0)
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

  const resetForm = () => {
    setIsEditing(false)
    setEditingUuid(null)
    setTitle('')
    setDescription('')
    setWidth('')
    setHeight('')
    setDepth('')
    setSelectedArtistUuids([])
    setSelectedMediumUuids([])
  }

  const toggleArtist = (artistUuid: string) => {
    setSelectedArtistUuids(prev => {
      if (prev.includes(artistUuid)) {
        return prev.filter(id => id !== artistUuid)
      } else {
        return [...prev, artistUuid]
      }
    })
  }

  const toggleMedium = (mediumUuid: string) => {
    setSelectedMediumUuids(prev => {
      if (prev.includes(mediumUuid)) {
        return prev.filter(id => id !== mediumUuid)
      } else {
        return [...prev, mediumUuid]
      }
    })
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
        <h1 style={{ marginBottom: '32px' }}>Admin: Manage Artworks</h1>

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

        {/* Create/Edit Form */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '48px'
        }}>
          <h2 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>
            {isEditing ? 'Edit Artwork' : 'Create New Artwork'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--secondary-text)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--secondary-text)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--secondary-text)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Width
                </label>
                <input
                  type="text"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="e.g., 24 cm"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--secondary-text)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Height
                </label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g., 36 cm"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--secondary-text)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Depth
                </label>
                <input
                  type="text"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  placeholder="e.g., 5 cm"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Artist Selection */}
            {!isEditing && users.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '12px', color: 'var(--secondary-text)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Artists * (Select one or more)
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '12px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  padding: '12px',
                  backgroundColor: 'var(--hover-bg)',
                  borderRadius: '4px'
                }}>
                  {users.map(artist => (
                    <label
                      key={artist.uuid}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        padding: '8px 12px',
                        backgroundColor: selectedArtistUuids.includes(artist.uuid) ? 'var(--accent-blue)' : 'var(--card-bg)',
                        color: selectedArtistUuids.includes(artist.uuid) ? 'var(--primary-bg)' : 'var(--primary-text)',
                        border: `1px solid ${selectedArtistUuids.includes(artist.uuid) ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                        borderRadius: '4px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedArtistUuids.includes(artist.uuid)}
                        onChange={() => toggleArtist(artist.uuid)}
                        style={{ cursor: 'pointer', width: 'auto', margin: 0 }}
                      />
                      <span style={{ flex: 1 }}>
                        {artist.first_name} {artist.last_name}
                      </span>
                    </label>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--secondary-text)', marginTop: '8px' }}>
                  Selected: {selectedArtistUuids.length} artist(s)
                </p>
              </div>
            )}

            {/* Medium Selection */}
            {!isEditing && mediums.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '12px', color: 'var(--secondary-text)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Mediums (Select one or more)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {mediums.map(medium => (
                    <label
                      key={medium.uuid}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        padding: '8px 16px',
                        backgroundColor: selectedMediumUuids.includes(medium.uuid) ? 'var(--accent-purple)' : 'var(--hover-bg)',
                        color: selectedMediumUuids.includes(medium.uuid) ? 'var(--primary-bg)' : 'var(--primary-text)',
                        border: `1px solid ${selectedMediumUuids.includes(medium.uuid) ? 'var(--accent-purple)' : 'var(--border-color)'}`,
                        borderRadius: '20px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMediumUuids.includes(medium.uuid)}
                        onChange={() => toggleMedium(medium.uuid)}
                        style={{ cursor: 'pointer', width: 'auto', margin: 0 }}
                      />
                      {medium.name}
                    </label>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--secondary-text)', marginTop: '8px' }}>
                  Selected: {selectedMediumUuids.length} medium(s)
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px' }}>
              <Button type="submit" variant="primary" size="large">
                {isEditing ? 'Update' : 'Create'} Artwork
              </Button>
              {isEditing && (
                <Button type="button" onClick={resetForm} variant="secondary" size="large">
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Artworks Table */}
        <h2 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>Existing Artworks ({artworks.length})</h2>
        {artworks.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--secondary-text)', padding: '40px' }}>
            No artworks created yet. Create your first artwork above.
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
