/**
 * ExistingImagesSection Component
 *
 * Displays existing images for an artwork with management capabilities.
 * Used in edit mode to view, update descriptions, and delete images.
 */

import { useState } from 'react'
import type { ArtworkImage } from '../../types'
import { getImageUrl } from '../../utils'
import Button from '../common/Button'

interface ExistingImagesSectionProps {
  images: ArtworkImage[]
  onUpdateDescription: (imageUuid: string, description: string) => Promise<void>
  onDeleteImage: (imageUuid: string) => Promise<void>
  onImageClick: (imageUrl: string) => void
}

export default function ExistingImagesSection({
  images,
  onUpdateDescription,
  onDeleteImage,
  onImageClick
}: ExistingImagesSectionProps) {
  if (!images || images.length === 0) {
    return null
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <h4 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--primary-text)' }}>
        Existing Images ({images.length})
      </h4>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px'
      }}>
        {images
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((image) => (
            <div
              key={image.uuid}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: 'var(--hover-bg)'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <img
                  src={getImageUrl(image.filename)}
                  alt={image.description || 'Artwork image'}
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: '1px solid var(--border-color)'
                  }}
                  onClick={() => onImageClick(getImageUrl(image.filename))}
                />
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: '12px',
                      color: 'var(--secondary-text)',
                      wordBreak: 'break-all'
                    }}
                  >
                    {image.original_filename}
                  </p>
                  <p
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: '12px',
                      color: 'var(--secondary-text)'
                    }}
                  >
                    {(image.file_size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <input
                type="text"
                placeholder="Image description"
                defaultValue={image.description || ''}
                onBlur={(e) => onUpdateDescription(image.uuid, e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--card-bg)',
                  marginBottom: '12px'
                }}
              />
              <Button
                onClick={() => onDeleteImage(image.uuid)}
                variant="danger"
                size="small"
                style={{ width: '100%' }}
              >
                Delete Image
              </Button>
            </div>
          ))}
      </div>
    </div>
  )
}
