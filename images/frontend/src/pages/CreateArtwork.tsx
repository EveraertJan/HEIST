/**
 * CreateArtwork Page
 *
 * Unified interface for creating new artworks and editing existing ones.
 *
 * Structure:
 * - Back button and page title (Create/Edit Artwork)
 * - Success/Error message notifications
 * - Form with the following sections:
 *   1. Basic Information: Title, Description
 *   2. Dimensions: Width, Height, Depth
 *   3. Artist Selection: Multi-select checkboxes
 *   4. Medium Selection: Multi-select chips with link to manage mediums
 *   5. Image Management (context-aware):
 *      - Edit mode: Shows existing images with delete/update description
 *      - Edit mode: Separate upload section for adding new images
 *      - Create mode: Single upload section for initial images
 * - Submit button (Create/Update) and Cancel button
 * - Image modal for viewing full-size images
 *
 * Features:
 * - Detects edit mode via :uuid route parameter
 * - Pre-loads artwork data in edit mode
 * - Validates at least one artist is selected
 * - Image upload with descriptions
 * - Existing image management (edit descriptions, delete)
 * - Redirects to AdminArtworks on success
 */

import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createArtwork, updateArtwork, getAllMediums, getAllUsers, uploadArtworkImages, deleteArtworkImage, updateArtworkImage, getArtworkByUuid } from '../services/api'
import type { Medium, User, Artwork } from '../types'
import Button from '../components/common/Button'
import ImageModal from '../components/common/ImageModal'
import ExistingImagesSection from '../components/artworks/ExistingImagesSection'
import NewImageUploadSection from '../components/artworks/NewImageUploadSection'

export default function CreateArtwork() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { uuid } = useParams<{ uuid?: string }>()
  const isEditing = !!uuid

  const [mediums, setMediums] = useState<Medium[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [depth, setDepth] = useState('')
  const [selectedArtistUuids, setSelectedArtistUuids] = useState<string[]>([])
  const [selectedMediumUuids, setSelectedMediumUuids] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [imageDescriptions, setImageDescriptions] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [artwork, setArtwork] = useState<Artwork | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadData()
  }, [user, navigate])

  useEffect(() => {
    if (isEditing && uuid) {
      loadArtwork(uuid)
    }
  }, [isEditing, uuid])

  const loadArtwork = async (artworkUuid: string) => {
    try {
      const response = await getArtworkByUuid(artworkUuid)
      const artworkData = response.data.data
      setArtwork(artworkData)
      setTitle(artworkData.title)
      setDescription(artworkData.description || '')
      setWidth(artworkData.width || '')
      setHeight(artworkData.height || '')
      setDepth(artworkData.depth || '')
      setSelectedArtistUuids(artworkData.artists?.map(a => a.uuid) || [])
      setSelectedMediumUuids(artworkData.mediums?.map(m => m.uuid) || [])
    } catch (err: any) {
      setError('Failed to load artwork')
      console.error(err)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [mediumsRes, usersRes] = await Promise.all([
        getAllMediums(),
        getAllUsers()
      ])
      setMediums(mediumsRes.data.data)
      setUsers(usersRes.data.data)

      // Auto-select current user as artist if not admin and creating new artwork
      if (!user?.is_admin && !isEditing && user?.uuid) {
        setSelectedArtistUuids([user.uuid])
      }
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

      if (isEditing && uuid) {
        // Update existing artwork
        await updateArtwork(uuid, {
          title,
          description,
          width,
          height,
          depth,
          artistUuids: selectedArtistUuids,
          mediumUuids: selectedMediumUuids
        })
        setSuccess('Artwork updated successfully')
      } else {
        // Create new artwork
        const response = await createArtwork({
          title,
          description,
          width,
          height,
          depth,
          artistUuids: selectedArtistUuids,
          mediumUuids: selectedMediumUuids
        })

        const artworkUuid = response.data.data.uuid

        // Upload images if any were selected
        if (selectedFiles && selectedFiles.length > 0) {
          setIsUploading(true)
          try {
            await uploadArtworkImages(artworkUuid, selectedFiles, imageDescriptions)
          } catch (uploadError: any) {
            setError(`Artwork created but failed to upload images: ${uploadError.response?.data?.message || 'Upload failed'}`)
            setIsUploading(false)
            return
          }
        }
      }
      
      // Reset form after successful operation
      setTimeout(() => {
        navigate('/artworks')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} artwork`)
    } finally {
      setIsUploading(false)
    }
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setSelectedFiles(files)
      // Initialize descriptions array with empty strings
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

  const handleUpdateImageDescription = async (imageUuid: string, description: string) => {
    if (!isEditing || !uuid) return
    
    try {
      await updateArtworkImage(uuid, imageUuid, { description })
      setSuccess('Image description updated successfully')
      // Update local state
      if (artwork) {
        setArtwork(prev => prev ? {
          ...prev,
          images: prev.images?.map(img =>
            img.uuid === imageUuid ? { ...img, description } : img
          ) || []
        } : null)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update image description')
    }
  }

  const handleDeleteImage = async (imageUuid: string) => {
    if (!isEditing || !uuid) return
    
    if (!confirm('Are you sure you want to delete this image?')) return
    
    try {
      await deleteArtworkImage(uuid, imageUuid)
      setSuccess('Image deleted successfully')
      // Update local state
      if (artwork) {
        setArtwork(prev => prev ? {
          ...prev,
          images: prev.images?.filter(img => img.uuid !== imageUuid) || []
        } : null)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete image')
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
      <div className="container" style={{ padding: '48px 24px', maxWidth: '800px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          { user?.is_admin ? <Button 
            onClick={() => navigate('/artworks')} 
            variant="secondary" 
            size="small"
          >
            ← Back to Artworks
          </Button>  : <Button 
            onClick={() => navigate('/gallery')} 
            variant="secondary" 
            size="small"
          >
            ← Back to Gallery
          </Button> }
          <h1 style={{ margin: 0 }}>
            {isEditing ? 'Edit Artwork' : 'Create New Artwork'}
          </h1>
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

        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '32px'
        }}>
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
                  placeholder="e.g., 240 mm"
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
                  placeholder="e.g., 360 mm"
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
                  placeholder="e.g., 500 mm"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Artist Selection */}

            {(users.length > 0 && user?.is_admin) && (
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
                        backgroundColor: selectedArtistUuids.includes(artist.uuid) ? 'var(--accent-yellow)' : 'var(--card-bg)',
                        color: selectedArtistUuids.includes(artist.uuid) ? 'var(--primary-bg)' : 'var(--primary-text)',
                        border: `1px solid ${selectedArtistUuids.includes(artist.uuid) ? 'var(--accent-yellow)' : 'var(--border-color)'}`,
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
            {mediums.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '12px', color: 'var(--secondary-text)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Mediums (Select one or more) 
                  { user?.is_admin &&
                    <Link to="/admin/mediums" style={{marginLeft: '10px'}}>
                      Manage Mediums
                    </Link>
                  }
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

            {/* Image Upload Section */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '12px', color: 'var(--secondary-text)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {isEditing ? 'Image Management' : 'Images (Optional)'}
              </label>

              {/* Existing Images - only show in edit mode */}
              {isEditing && artwork?.images && (
                <ExistingImagesSection
                  images={artwork.images}
                  onUpdateDescription={handleUpdateImageDescription}
                  onDeleteImage={handleDeleteImage}
                  onImageClick={setSelectedImage}
                />
              )}

              {/* New Image Upload */}
              <NewImageUploadSection
                selectedFiles={selectedFiles}
                imageDescriptions={imageDescriptions}
                isUploading={isUploading}
                isEditMode={isEditing}
                onFileSelect={handleFileSelect}
                onDescriptionChange={handleDescriptionChange}
                onUpload={isEditing ? async () => {
                  if (!uuid) return
                  setIsUploading(true)
                  try {
                    await uploadArtworkImages(uuid, selectedFiles!, imageDescriptions)
                    setSuccess('Images uploaded successfully')
                    setSelectedFiles(null)
                    setImageDescriptions([])
                    await loadArtwork(uuid)
                  } catch (err: any) {
                    setError(err.response?.data?.message || 'Failed to upload images')
                  } finally {
                    setIsUploading(false)
                  }
                } : undefined}
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <Button 
                type="submit" 
                variant="primary" 
                size="large"
                disabled={isUploading}
              >
                {isUploading ? (isEditing ? 'Updating Artwork...' : 'Creating Artwork...') : (isEditing ? 'Update Artwork' : 'Create Artwork')}
              </Button>
              <Button 
                type="button" 
                onClick={() => navigate('/artworks')} 
                variant="secondary" 
                size="large"
                disabled={isUploading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
      
    {/* Image Modal */}
    {selectedImage && (
      <ImageModal
        imageUrl={selectedImage}
        altText="Artwork image"
        onClose={() => setSelectedImage(null)}
      />
    )}
    </div>

  )
}