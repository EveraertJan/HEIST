import { Link } from 'react-router-dom'
import { getImageUrl } from '../../utils'
import type { Artwork } from '../../types'

/**
 * Props for the ArtworkCard component
 */
interface ArtworkCardProps {
  /** The artwork object to display */
  artwork: Artwork
  /** Whether to show the full description or truncate it */
  showFullDescription?: boolean
}

/**
 * ArtworkCard Component
 *
 * Displays an artwork as a card with image thumbnail, title, description, and mediums.
 * Used in gallery views to show artworks in a grid layout.
 *
 * @component
 * @example
 * ```tsx
 * <ArtworkCard artwork={artwork} />
 * ```
 */
export default function ArtworkCard({ artwork, showFullDescription = false }: ArtworkCardProps) {
  // Get the first image sorted by sort_order
  const firstImage = artwork.images && artwork.images.length > 0
    ? artwork.images.sort((a, b) => a.sort_order - b.sort_order)[0]
    : null

  const truncateDescription = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text
    return `${text.substring(0, maxLength)}...`
  }

  return (
    <Link
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
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {/* Image Thumbnail */}
        <div style={{
          width: '100%',
          height: '250px',
          backgroundColor: 'var(--secondary-bg)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {firstImage ? (
            <img
              src={getImageUrl(firstImage.filename)}
              alt={artwork.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--secondary-text)',
              fontSize: '14px'
            }}>
              No image
            </div>
          )}

          {/* Multiple images indicator */}
          {artwork.images && artwork.images.length > 1 && (
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              +{artwork.images.length - 1}
            </div>
          )}
        </div>

        {/* Card Content */}
        <div style={{
          padding: '20px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Title */}
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '8px',
            color: 'var(--accent-yellow)'
          }}>
            {artwork.title}
          </h3>

          {/* Description */}
          {artwork.description && (
            <p style={{
              fontSize: '14px',
              color: 'var(--secondary-text)',
              lineHeight: '1.6',
              marginBottom: '12px',
              flex: 1
            }}>
              {showFullDescription
                ? artwork.description
                : truncateDescription(artwork.description)}
            </p>
          )}

          {/* Mediums */}
          {artwork.mediums && artwork.mediums.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: 'auto'
            }}>
              {artwork.mediums.map(medium => (
                <span
                  key={medium.uuid}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: 'var(--secondary-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--accent-purple)',
                    fontWeight: '500'
                  }}
                >
                  {medium.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
