import { useState } from 'react'
import { getImageUrl } from '../../utils'
import ImageModal from '../common/ImageModal'
import type { ArtworkImage } from '../../types'

/**
 * Props for the ImageGrid component
 */
interface ImageGridProps {
  /** Array of images to display */
  images: ArtworkImage[]
  /** Alt text prefix for images */
  altPrefix: string
  /** Whether to show image descriptions as overlays */
  showDescriptions?: boolean
  /** Whether to show image number indicators */
  showNumbers?: boolean
}

/**
 * ImageGrid Component
 *
 * Displays a responsive grid of images with click-to-enlarge functionality.
 * Automatically adjusts layout based on number of images.
 *
 * Features:
 * - Single image: full-width display (500px height)
 * - Multiple images: responsive grid (280px height per image)
 * - Hover effects with scale and shadow
 * - Click to open modal with full-size image
 * - Optional description overlays
 * - Optional image number indicators
 *
 * @component
 * @example
 * ```tsx
 * <ImageGrid
 *   images={artwork.images}
 *   altPrefix={artwork.title}
 *   showDescriptions
 *   showNumbers
 * />
 * ```
 */
export default function ImageGrid({
  images,
  altPrefix,
  showDescriptions = true,
  showNumbers = true
}: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Sort images by sort_order
  const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order)

  if (!images || images.length === 0) {
    return null
  }

  return (
    <>
      <div style={{
        marginBottom: '32px'
      }}>
        <h3 style={{
          fontSize: '14px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--secondary-text)',
          marginBottom: '16px',
          fontWeight: '600'
        }}>
          {images.length === 1 ? 'Image' : `Images (${images.length})`}
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: images.length === 1
            ? '1fr'
            : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {sortedImages.map((image, index) => (
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
                alt={image.description || `${altPrefix} - Image ${index + 1}`}
                style={{
                  width: '100%',
                  height: images.length === 1 ? '500px' : '280px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />

              {/* Description overlay */}
              {showDescriptions && image.description && (
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
              {showNumbers && (
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
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          altText={altPrefix}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  )
}
