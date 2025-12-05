import { useEffect, useState } from 'react'
import { searchArtworks, getAllMediums } from '../services/api'
import { ArtworkCard } from '../components/artworks'
import { SearchBar, MediumFilter } from '../components/search'
import EmptyState from '../components/common/EmptyState'
import type { Artwork, Medium } from '../types'

/**
 * Home Page Component
 *
 * Main gallery page displaying all artworks with search and filter functionality.
 * Features:
 * - Search by title or artist name
 * - Filter by multiple mediums
 * - Responsive card grid layout
 * - Real-time filtering when medium selection changes
 *
 * @component
 */
export default function Home() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [mediums, setMediums] = useState<Medium[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMediums, setSelectedMediums] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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
          <div style={{ marginBottom: mediums.length > 0 ? '24px' : '0' }}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onSubmit={loadArtworks}
              placeholder="Search by title or artist name..."
              loading={loading}
            />
          </div>

          <MediumFilter
            mediums={mediums}
            selectedMediums={selectedMediums}
            onToggle={handleMediumToggle}
            onClearAll={() => setSelectedMediums([])}
            isOpen={isDropdownOpen}
            setIsOpen={setIsDropdownOpen}
          />
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
              <EmptyState
                icon="🎨"
                message="No artworks found."
                description={
                  searchTerm || selectedMediums.length > 0
                    ? 'Try adjusting your search or filters'
                    : 'Check back soon for new artworks'
                }
              />
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                {artworks.map(artwork => (
                  <ArtworkCard key={artwork.uuid} artwork={artwork} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
