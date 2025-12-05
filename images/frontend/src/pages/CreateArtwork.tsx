import { Link } from 'react-router-dom'

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createArtwork, getAllMediums, getAllUsers, uploadArtworkImages } from '../services/api'
import type { Medium, User } from '../types'
import Button from '../components/common/Button'

export default function CreateArtwork() {
  const { user } = useAuth()
  const navigate = useNavigate()

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

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/home')
      return
    }
    loadData()
  }, [user, navigate])

  const loadData = async () => {
    try {
      setLoading(true)
      const [mediumsRes, usersRes] = await Promise.all([
        getAllMediums(),
        getAllUsers()
      ])
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

      // Create artwork first
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

      setSuccess('Artwork created successfully')
      
      // Reset form after successful creation
      setTimeout(() => {
        navigate('/admin/artworks')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create artwork')
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
          <Button 
            onClick={() => navigate('/admin/artworks')} 
            variant="secondary" 
            size="small"
          >
            ← Back to Artworks
          </Button>
          <h1 style={{ margin: 0 }}>Create New Artwork</h1>
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
            {users.length > 0 && (
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
            {mediums.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '12px', color: 'var(--secondary-text)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Mediums (Select one or more) 

                  <Link to="/admin/mediums" style={{marginLeft: '10px'}}>
                    Manage Mediums
                  </Link>
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
                Images (Optional)
              </label>
              
              <div style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '8px',
                padding: '32px',
                textAlign: 'center',
                backgroundColor: 'var(--hover-bg)',
                transition: 'all 0.2s ease'
              }}>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <label 
                  htmlFor="image-upload"
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
                  margin: '16px 0 0 0', 
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
                <div style={{ marginTop: '16px' }}>
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
                          width: '80px',
                          height: '80px',
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
                        <p style={{ 
                          margin: '0 0 8px 0', 
                          fontSize: '12px', 
                          color: 'var(--secondary-text)'
                        }}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
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
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <Button 
                type="submit" 
                variant="primary" 
                size="large"
                disabled={isUploading}
              >
                {isUploading ? 'Creating Artwork...' : 'Create Artwork'}
              </Button>
              <Button 
                type="button" 
                onClick={() => navigate('/admin/artworks')} 
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
    </div>
  )
}