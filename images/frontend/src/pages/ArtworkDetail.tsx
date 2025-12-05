import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getArtworkByUuid } from '../services/api'
import { ImageGrid } from '../components/artworks'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import type { Artwork } from '../types'

/**
 * ArtworkDetail Page Component
 *
 * Displays detailed information about a single artwork including:
 * - Image gallery with click-to-enlarge
 * - Title and description
 * - Dimensions (width, height, depth)
 * - Associated artists
 * - Associated mediums
 * - Creation and update timestamps
 * - Rent artwork button
 *
 * @component
 */
export default function ArtworkDetail() {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
          <EmptyState
            icon="⚠️"
            message={error || 'Artwork not found'}
            description="This artwork may have been removed or the link is incorrect."
          />
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Button onClick={() => navigate('/gallery')} variant="primary" size="large">
              Back to Gallery
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <div className="container" style={{ padding: '48px 24px', maxWidth: '1000px' }}>
        {/* Back Button and Actions */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <Button onClick={() => navigate('/gallery')} variant="secondary" size="medium">
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
            <ImageGrid
              images={artwork.images}
              altPrefix={artwork.title}
              showDescriptions
              showNumbers
            />
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

      </div>
    </div>
  )
}
