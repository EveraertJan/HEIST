import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { updateArtwork, deleteArtwork, getAllArtworks, getArtworkByUuid, uploadArtworkImages, deleteArtworkImage, updateArtworkImage } from '../services/api'
import { getImageUrl } from '../utils'
import type { Artwork } from '../types'
import Button from '../components/common/Button'
import ImageModal from '../components/common/ImageModal'

export default function AdminArtworks() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Edit form state
  const [isEditing, setIsEditing] = useState(false)
  const [editingUuid, setEditingUuid] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [depth, setDepth] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [imageDescriptions, setImageDescriptions] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null)
  const [imageDescriptionEdits, setImageDescriptionEdits] = useState<Record<string, string>>({})

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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (!user?.uuid) {
        setError('User not authenticated')
        return
      }

      if (isEditing && editingUuid) {
        await updateArtwork(editingUuid, { title, description, width, height, depth })
        setSuccess('Artwork updated successfully')
        resetForm()
        loadData()
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update artwork')
    }
  }

  const handleEdit = (artwork: Artwork) => {
    setIsEditing(true)
    setEditingUuid(artwork.uuid)
    setEditingArtwork(artwork)
    setTitle(artwork.title)
    setDescription(artwork.description || '')
    setWidth(artwork.width || '')
    setHeight(artwork.height || '')
    setDepth(artwork.depth || '')
    setSelectedFiles(null)
    setImageDescriptions([])
    setImageDescriptionEdits({})
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
    setEditingArtwork(null)
    setTitle('')
    setDescription('')
    setWidth('')
    setHeight('')
    setDepth('')
    setSelectedFiles(null)
    setImageDescriptions([])
    setImageDescriptionEdits({})
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setSelectedFiles(files)
      setImageDescriptions(Array.from(files).map(() => ''))
    }
  }

  const handleDescriptionChange = (index: number, description: string) => {
    setImageDescriptions(prev => {
      const newDescriptions = [...prev]
      newDescriptions[index] = description
      return newDescriptions
    })
  }

  const handleImageUpload = async () => {
    if (!selectedFiles || !editingUuid) return

    try {
      setIsUploading(true)
      await uploadArtworkImages(editingUuid, selectedFiles, imageDescriptions)
      setSuccess('Images uploaded successfully')
      setSelectedFiles(null)
      setImageDescriptions([])
      await loadData()
      // Update the editing artwork with the latest data
      const updatedArtwork = await getArtworkByUuid(editingUuid)
      setEditingArtwork(updatedArtwork.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload images')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteImage = async (imageUuid: string) => {
    if (!editingUuid) return

    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      await deleteArtworkImage(editingUuid, imageUuid)
      setSuccess('Image deleted successfully')
      await loadData()
      // Update the editing artwork with the latest data
      const updatedArtwork = await getArtworkByUuid(editingUuid)
      setEditingArtwork(updatedArtwork.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete image')
    }
  }

  const handleImageDescriptionChange = (imageUuid: string, description: string) => {
    setImageDescriptionEdits(prev => ({
      ...prev,
      [imageUuid]: description
    }))
  }

  const handleUpdateImageDescription = async (imageUuid: string) => {
    if (!editingUuid) return

    const description = imageDescriptionEdits[imageUuid]
    if (description === undefined) return

    try {
      await updateArtworkImage(editingUuid, imageUuid, { description })
      setSuccess('Image description updated successfully')
      await loadData()
      // Update the editing artwork with the latest data
      const updatedArtwork = await getArtworkByUuid(editingUuid)
      setEditingArtwork(updatedArtwork.data.data)
      // Clear the edit state for this image
      setImageDescriptionEdits(prev => {
        const newEdits = { ...prev }
        delete newEdits[imageUuid]
        return newEdits
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update image description')
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

        {/* Edit Form */}
        {isEditing && (
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '32px',
            marginBottom: '48px'
          }}>
            <h2 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>
              Edit Artwork
            </h2>

            <form onSubmit={handleEditSubmit}>
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

              {/* Image Management Section */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '12px', color: 'var(--secondary-text)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Image Management
                </label>

                {/* Existing Images */}
                {editingArtwork?.images && editingArtwork.images.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--primary-text)' }}>
                      Existing Images ({editingArtwork.images.length})
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                      {editingArtwork.images
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((image) => (
                          <div key={image.uuid} style={{
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            padding: '16px',
                            backgroundColor: 'var(--hover-bg)'
                          }}>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                              <img
                                src={getImageUrl(image.filename)}
                                alt={image.description || 'Artwork image'}
                                style={{
                                  width: '80px',
                                  height: '80px',
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  border: '1px solid var(--border-color)'
                                }}
                                onClick={() => setSelectedImage(getImageUrl(image.filename))}
                              />
                              <div style={{ flex: 1 }}>
                                <p style={{ 
                                  margin: '0 0 8px 0', 
                                  fontSize: '12px', 
                                  color: 'var(--secondary-text)',
                                  wordBreak: 'break-all'
                                }}>
                                  {image.original_filename}
                                </p>
                                <p style={{ 
                                  margin: '0 0 8px 0', 
                                  fontSize: '12px', 
                                  color: 'var(--secondary-text)'
                                }}>
                                  {(image.file_size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <input
                              type="text"
                              placeholder="Image description"
                              value={imageDescriptionEdits[image.uuid] !== undefined ? imageDescriptionEdits[image.uuid] : (image.description || '')}
                              onChange={(e) => handleImageDescriptionChange(image.uuid, e.target.value)}
                              onBlur={() => handleUpdateImageDescription(image.uuid)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                fontSize: '14px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                backgroundColor: 'var(--card-bg)',
                                marginBottom: '12px'
                              }}
                            />
                            <Button
                              onClick={() => handleDeleteImage(image.uuid)}
                              variant="danger"
                              size="small"
                              style={{ width: '100%' }}
                            >
                              Delete Image
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Add New Images */}
                <div>
                  <h4 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--primary-text)' }}>
                    Add New Images
                  </h4>
                  <div style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: '8px',
                    padding: '24px',
                    textAlign: 'center',
                    backgroundColor: 'var(--hover-bg)',
                    marginBottom: '16px'
                  }}>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      id="admin-image-upload"
                    />
                    <label 
                      htmlFor="admin-image-upload"
                      style={{
                        cursor: 'pointer',
                        display: 'inline-block',
                        padding: '12px 24px',
                        backgroundColor: 'var(--accent-blue)',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--accent-purple)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--accent-blue)'
                      }}
                    >
                      Choose Images
                    </label>
                    <p style={{ 
                      margin: '12px 0 0 0', 
                      color: 'var(--secondary-text)', 
                      fontSize: '14px' 
                    }}>
                      {selectedFiles 
                        ? `${selectedFiles.length} file(s) selected` 
                        : 'Select up to 10 images (JPEG, PNG, GIF, WebP - Max 10MB each)'
                      }
                    </p>
                  </div>

                  {/* Image Previews and Descriptions */}
                  {selectedFiles && (
                    <div style={{ marginBottom: '16px' }}>
                      {Array.from(selectedFiles).map((file, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          gap: '16px',
                          alignItems: 'center',
                          padding: '16px',
                          backgroundColor: 'var(--card-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          marginBottom: '12px'
                        }}>
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                              border: '1px solid var(--border-color)'
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <p style={{ 
                              margin: '0 0 8px 0', 
                              fontSize: '14px', 
                              fontWeight: '600',
                              color: 'var(--primary-text)'
                            }}>
                              {file.name}
                            </p>
                            <input
                              type="text"
                              placeholder="Image description (optional)"
                              value={imageDescriptions[index] || ''}
                              onChange={(e) => handleDescriptionChange(index, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                fontSize: '14px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                backgroundColor: 'var(--hover-bg)'
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedFiles && selectedFiles.length > 0 && (
                    <Button
                      onClick={handleImageUpload}
                      variant="primary"
                      size="medium"
                      disabled={isUploading}
                    >
                      {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image(s)`}
                    </Button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <Button type="submit" variant="primary" size="large">
                  Update Artwork
                </Button>
                <Button type="button" onClick={resetForm} variant="secondary" size="large">
                  Cancel
                </Button>
              </div>
            </form>
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

        {/* Image Modal */}
        {selectedImage && (
          <ImageModal
            imageUrl={selectedImage}
            altText="Artwork image"
            onClose={() => setSelectedImage(null)}
          />
        )}
      </div>
    </div>
  )
}
