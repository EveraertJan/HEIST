import { useEffect, useState, useRef } from 'react'
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMediums()
    loadArtworks()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
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

          {/* Medium Filters Dropdown */}
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
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    maxWidth: '300px',
                    padding: '12px 16px',
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--primary-text)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>
                    {selectedMediums.length === 0 
                      ? 'All mediums' 
                      : `${selectedMediums.length} medium${selectedMediums.length > 1 ? 's' : ''} selected`
                    }
                  </span>
                  <span style={{ 
                    marginLeft: '8px',
                    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}>
                    ▼
                  </span>
                </button>

                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    right: '0',
                    zIndex: 1000,
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    marginTop: '4px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ padding: '8px' }}>
                      {mediums.map(medium => {
                        const isActive = selectedMediums.includes(medium.uuid)
                        return (
                          <label
                            key={medium.uuid}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px 12px',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              transition: 'background-color 0.2s ease',
                              ':hover': {
                                backgroundColor: 'var(--secondary-bg)'
                              }
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--secondary-bg)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={() => handleMediumToggle(medium.uuid)}
                              style={{ cursor: 'pointer', width: 'auto', margin: 0 }}
                            />
                            <span style={{ 
                              color: isActive ? 'var(--accent-blue)' : 'var(--primary-text)',
                              fontSize: '14px'
                            }}>
                              {medium.name}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                    
                    {selectedMediums.length > 0 && (
                      <div style={{
                        padding: '12px',
                        borderTop: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                          {selectedMediums.length} selected
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMediums([])
                            setIsDropdownOpen(false)
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            color: 'var(--secondary-text)',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--secondary-bg)'
                            e.currentTarget.style.color = 'var(--primary-text)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = 'var(--secondary-text)'
                          }}
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
