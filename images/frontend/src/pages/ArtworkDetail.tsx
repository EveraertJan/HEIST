import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getArtworkByUuid } from '../services/api'
import { getImageUrl } from '../utils'
import type { Artwork } from '../types'
import Button from '../components/common/Button'
import ImageModal from '../components/common/ImageModal'

export default function ArtworkDetail() {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (uuid) {
      loadArtwork(uuid)
    }
  }, [uuid])

  const loadArtwork = async (artworkUuid: string) => {
    try {
      setLoading(true)
      setError('')
      const response = await getArtworkByUuid(artworkUuid)
      setArtwork(response.data.data)
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Artwork not found')
      } else {
        setError('Failed to load artwork')
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--secondary-text)', fontSize: '18px' }}>Loading artwork...</p>
      </div>
    )
  }

  if (error || !artwork) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
        <div className="container" style={{ padding: '48px 24px', maxWidth: '800px' }}>
          <div className="error-message" style={{
            padding: '24px',
            backgroundColor: 'rgba(255, 107, 157, 0.1)',
            border: '1px solid var(--accent-pink)',
            borderRadius: '8px',
            color: 'var(--accent-pink)',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            {error || 'Artwork not found'}
          </div>
          <Button onClick={() => navigate('/home')} variant="primary" size="large">
            Back to Gallery
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <div className="container" style={{ padding: '48px 24px', maxWidth: '1000px' }}>
        {/* Back Button and Actions */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <Button onClick={() => navigate('/home')} variant="secondary" size="medium">
            ← Back to Gallery
          </Button>
          <Button onClick={() => navigate(`/rent/${uuid}`)} variant="primary" size="medium">
            Rent This Artwork
          </Button>
        </div>

        {/* Main Content */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '48px',
          marginBottom: '48px'
        }}>
          {/* Title */}
          <h1 style={{
            fontSize: '3rem',
            marginBottom: '32px',
            color: 'var(--accent-color)',
            fontWeight: '700',
            letterSpacing: '-0.02em'
          }}>
            {artwork.title}
          </h1>

          {/* Images */}
          {artwork.images && artwork.images.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--secondary-text)',
                marginBottom: '16px',
                fontWeight: '600'
              }}>
                {artwork.images.length === 1 ? 'Image' : `Images (${artwork.images.length})`}
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: artwork.images.length === 1
                  ? '1fr'
                  : 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                {artwork.images
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((image, index) => (
                    <div
                      key={image.uuid}
                      style={{
                        position: 'relative',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        backgroundColor: 'var(--secondary-bg)'
                      }}
                      onClick={() => setSelectedImage(getImageUrl(image.filename))}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)'
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <img
                        src={getImageUrl(image.filename)}
                        alt={image.description || `${artwork.title} - Image ${index + 1}`}
                        style={{
                          width: '100%',
                          height: artwork.images.length === 1 ? '500px' : '280px',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                      {image.description && (
                        <div style={{
                          position: 'absolute',
                          bottom: '0',
                          left: '0',
                          right: '0',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                          color: 'white',
                          padding: '16px 12px 12px 12px',
                          fontSize: '13px',
                          lineHeight: '1.4'
                        }}>
                          {image.description}
                        </div>
                      )}
                      {/* Image number indicator */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {index + 1}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Description */}
          {artwork.description && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--secondary-text)',
                marginBottom: '12px',
                fontWeight: '600'
              }}>
                Description
              </h3>
              <p style={{
                lineHeight: '1.8',
                color: 'var(--primary-text)',
                fontSize: '16px'
              }}>
                {artwork.description}
              </p>
            </div>
          )}

          {/* Dimensions */}
          {(artwork.width || artwork.height || artwork.depth) && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--secondary-text)',
                marginBottom: '12px',
                fontWeight: '600'
              }}>
                Dimensions
              </h3>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {artwork.width && (
                  <div>
                    <span style={{ color: 'var(--secondary-text)', fontSize: '14px' }}>Width: </span>
                    <span style={{ color: 'var(--primary-text)', fontSize: '16px', fontWeight: '500' }}>{artwork.width}</span>
                  </div>
                )}
                {artwork.height && (
                  <div>
                    <span style={{ color: 'var(--secondary-text)', fontSize: '14px' }}>Height: </span>
                    <span style={{ color: 'var(--primary-text)', fontSize: '16px', fontWeight: '500' }}>{artwork.height}</span>
                  </div>
                )}
                {artwork.depth && (
                  <div>
                    <span style={{ color: 'var(--secondary-text)', fontSize: '14px' }}>Depth: </span>
                    <span style={{ color: 'var(--primary-text)', fontSize: '16px', fontWeight: '500' }}>{artwork.depth}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Artists */}
          {artwork.artists && artwork.artists.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--secondary-text)',
                marginBottom: '16px',
                fontWeight: '600'
              }}>
                {artwork.artists.length === 1 ? 'Artist' : 'Artists'}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {artwork.artists.map(artist => (
                  <li
                    key={artist.uuid}
                    style={{
                      padding: '16px',
                      backgroundColor: 'var(--hover-bg)',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <strong style={{
                      color: 'var(--accent-color)',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      {artist.first_name} {artist.last_name}
                    </strong>
                    <span style={{
                      color: 'var(--secondary-text)',
                      fontSize: '14px',
                      marginLeft: '12px'
                    }}>
                      ({artist.email})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mediums */}
          {artwork.mediums && artwork.mediums.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--secondary-text)',
                marginBottom: '16px',
                fontWeight: '600'
              }}>
                {artwork.mediums.length === 1 ? 'Medium' : 'Mediums'}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {artwork.mediums.map(medium => (
                  <span
                    key={medium.uuid}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'var(--hover-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '20px',
                      fontSize: '14px',
                      color: 'var(--accent-color)',
                      fontWeight: '500'
                    }}
                  >
                    {medium.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div style={{
            marginTop: '48px',
            paddingTop: '24px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <p style={{
              fontSize: '12px',
              color: 'var(--secondary-text)',
              marginBottom: '4px'
            }}>
              Created: {new Date(artwork.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            {artwork.updated_at !== artwork.created_at && (
              <p style={{
                fontSize: '12px',
                color: 'var(--secondary-text)'
              }}>
                Last updated: {new Date(artwork.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <ImageModal
            imageUrl={selectedImage}
            altText={artwork.title}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </div>
    </div>
  )
}
