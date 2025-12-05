import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getArtworkByUuid } from '../services/api'
import type { Artwork } from '../types'

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
          <button
            onClick={() => navigate('/home')}
            style={{
              padding: '14px 32px',
              backgroundColor: 'var(--accent-color)',
              color: 'var(--primary-bg)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Back to Gallery
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <div className="container" style={{ padding: '48px 24px', maxWidth: '1000px' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/home')}
          style={{
            padding: '10px 20px',
            backgroundColor: 'transparent',
            color: 'var(--secondary-text)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '32px',
            transition: 'all 0.2s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--accent-color)'
            e.currentTarget.style.borderColor = 'var(--accent-color)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--secondary-text)'
            e.currentTarget.style.borderColor = 'var(--border-color)'
          }}
        >
          ← Back to Gallery
        </button>

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

          {/* Size */}
          {artwork.size && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--secondary-text)',
                marginBottom: '12px',
                fontWeight: '600'
              }}>
                Size
              </h3>
              <p style={{ color: 'var(--primary-text)', fontSize: '16px' }}>
                {artwork.size}
              </p>
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
