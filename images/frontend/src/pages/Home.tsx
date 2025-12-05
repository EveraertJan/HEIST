import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchArtworks, getAllMediums } from '../services/api'
import type { Artwork, Medium } from '../types'
import Button from '../components/common/Button'

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
      console.log(response.data.data)
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
              <Button type="submit" variant="primary" size="medium">
                Search
              </Button>
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

        {/* Artworks Table */}
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
              <div className="table-container">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Size</th>
                        <th>Medium</th>
                      </tr>
                    </thead>
                    <tbody>
                      {artworks.map(artwork => (
                        <tr key={artwork.uuid}>
                          <td>
                            <Link
                              to={`/artworks/${artwork.uuid}`}
                              style={{
                                textDecoration: 'none',
                                color: 'var(--accent-blue)',
                                fontWeight: '600',
                                fontSize: '16px'
                              }}
                            >
                              {artwork.title}
                            </Link>
                          </td>
                          <td>
                            <span style={{ color: 'var(--secondary-text)', fontSize: '14px' }}>
                              {artwork.description && artwork.description.length > 100
                                ? `${artwork.description.substring(0, 100)}...`
                                : artwork.description || '-'}
                            </span>
                          </td>
                          <td>
                            <span style={{ color: 'var(--secondary-text)', fontSize: '14px' }}>
                              {artwork.size || '-'}
                            </span>
                          </td>
                          <td>
                            <span style={{ color: 'var(--secondary-text)', fontSize: '14px' }}>
                              {artwork.medium?.name || '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
