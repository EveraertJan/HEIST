import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchArtworks, getAllMediums } from '../services/api'
import type { Artwork, Medium } from '../types'

export default function Home() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [mediums, setMediums] = useState<Medium[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMediums, setSelectedMediums] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadMediums()
    loadArtworks()
  }, [])

  const loadMediums = async () => {
    try {
      const response = await getAllMediums()
      setMediums(response.data.data)
    } catch (err) {
      console.error('Failed to load mediums:', err)
    }
  }

  const loadArtworks = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await searchArtworks(
        searchTerm || undefined,
        selectedMediums.length > 0 ? selectedMediums : undefined
      )
      setArtworks(response.data.data)
    } catch (err) {
      setError('Failed to load artworks')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadArtworks()
  }

  const handleMediumToggle = (mediumUuid: string) => {
    setSelectedMediums(prev => {
      if (prev.includes(mediumUuid)) {
        return prev.filter(m => m !== mediumUuid)
      } else {
        return [...prev, mediumUuid]
      }
    })
  }

  useEffect(() => {
    loadArtworks()
  }, [selectedMediums])

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <div className="container" style={{ padding: '48px 24px' }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '64px'
        }}>
          <h1 style={{
            fontSize: '4rem',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: '700',
            letterSpacing: '-0.03em'
          }}>
            Art Gallery
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'var(--secondary-text)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Explore our curated collection of contemporary artworks
          </p>
        </div>

        {/* Search and Filter Section */}
        <div style={{
          backgroundColor: 'var(--secondary-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '48px'
        }}>
          <form onSubmit={handleSearch} style={{ marginBottom: mediums.length > 0 ? '24px' : '0' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or artist name..."
                style={{
                  flex: '1',
                  minWidth: '300px',
                  fontSize: '16px',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  color: 'var(--primary-text)'
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Search
              </button>
            </div>
          </form>

          {/* Medium Filters */}
          {mediums.length > 0 && (
            <div>
              <h3 style={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--secondary-text)',
                marginBottom: '16px',
                fontWeight: '600'
              }}>
                Filter by Medium:
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {mediums.map(medium => {
                  const isActive = selectedMediums.includes(medium.uuid)
                  return (
                    <label
                      key={medium.uuid}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        padding: '8px 16px',
                        backgroundColor: isActive ? 'var(--accent-blue)' : 'var(--card-bg)',
                        color: isActive ? 'var(--primary-bg)' : 'var(--primary-text)',
                        border: `1px solid ${isActive ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                        borderRadius: '20px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => handleMediumToggle(medium.uuid)}
                        style={{ cursor: 'pointer', width: 'auto', margin: 0 }}
                      />
                      {medium.name}
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
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

        {/* Loading State */}
        {loading && (
          <p style={{
            textAlign: 'center',
            padding: '80px',
            color: 'var(--secondary-text)',
            fontSize: '18px'
          }}>
            Loading artworks...
          </p>
        )}

        {/* Artworks Grid */}
        {!loading && (
          <>
            {artworks.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                color: 'var(--secondary-text)'
              }}>
                <p style={{ fontSize: '18px', marginBottom: '16px' }}>No artworks found.</p>
                <p style={{ fontSize: '14px' }}>
                  {searchTerm || selectedMediums.length > 0
                    ? 'Try adjusting your search or filters'
                    : 'Check back soon for new artworks'}
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '24px'
              }}>
                {artworks.map(artwork => (
                  <Link
                    key={artwork.uuid}
                    to={`/artworks/${artwork.uuid}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-blue)'
                        e.currentTarget.style.transform = 'translateY(-8px)'
                        e.currentTarget.style.boxShadow = '0 20px 60px rgba(74, 158, 255, 0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color)'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div style={{ padding: '24px' }}>
                        <h3 style={{
                          fontSize: '1.5rem',
                          marginBottom: '12px',
                          color: 'var(--accent-color)',
                          fontWeight: '600'
                        }}>
                          {artwork.title}
                        </h3>
                        {artwork.description && (
                          <p style={{
                            color: 'var(--secondary-text)',
                            fontSize: '14px',
                            lineHeight: '1.6',
                            marginBottom: '12px'
                          }}>
                            {artwork.description.length > 150
                              ? `${artwork.description.substring(0, 150)}...`
                              : artwork.description}
                          </p>
                        )}
                        {artwork.size && (
                          <p style={{
                            fontSize: '12px',
                            color: 'var(--secondary-text)',
                            marginTop: '8px'
                          }}>
                            Size: {artwork.size}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
