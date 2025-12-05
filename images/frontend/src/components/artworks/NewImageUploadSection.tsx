/**
 * NewImageUploadSection Component
 *
 * File upload interface for adding new images to an artwork.
 * Supports multiple image selection with descriptions and preview.
 */

interface NewImageUploadSectionProps {
  selectedFiles: FileList | null
  imageDescriptions: string[]
  isUploading: boolean
  isEditMode?: boolean
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDescriptionChange: (index: number, description: string) => void
  onUpload?: () => void
  inputId?: string
}

export default function NewImageUploadSection({
  selectedFiles,
  imageDescriptions,
  isUploading,
  isEditMode = false,
  onFileSelect,
  onDescriptionChange,
  onUpload,
  inputId = 'image-upload'
}: NewImageUploadSectionProps) {
  return (
    <div>
      {isEditMode && (
        <h4 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--primary-text)' }}>
          Add New Images
        </h4>
      )}

      <div
        style={{
          border: '2px dashed var(--border-color)',
          borderRadius: '8px',
          padding: '32px',
          textAlign: 'center',
          backgroundColor: 'var(--hover-bg)',
          transition: 'all 0.2s ease'
        }}
      >
        <input
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={onFileSelect}
          style={{ display: 'none' }}
          id={inputId}
        />
        <label
          htmlFor={inputId}
          style={{
            cursor: 'pointer',
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: 'var(--accent-blue)',
            color: 'white',
            borderRadius: '4px',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-purple)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-blue)'
          }}
        >
          Choose Images
        </label>
        <p
          style={{
            margin: '16px 0 0 0',
            color: 'var(--secondary-text)',
            fontSize: '14px'
          }}
        >
          {selectedFiles
            ? `${selectedFiles.length} file(s) selected`
            : 'Select up to 10 images (JPEG, PNG, GIF, WebP - Max 10MB each)'}
        </p>
      </div>

      {/* Image Previews and Descriptions */}
      {selectedFiles && (
        <div style={{ marginTop: '16px' }}>
          {Array.from(selectedFiles).map((file, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                marginBottom: '12px'
              }}
            >
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)'
                }}
              />
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--primary-text)'
                  }}
                >
                  {file.name}
                </p>
                <p
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '12px',
                    color: 'var(--secondary-text)'
                  }}
                >
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <input
                  type="text"
                  placeholder="Image description (optional)"
                  value={imageDescriptions[index] || ''}
                  onChange={(e) => onDescriptionChange(index, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--hover-bg)'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button for edit mode */}
      {isEditMode && onUpload && selectedFiles && selectedFiles.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <button
            onClick={onUpload}
            disabled={isUploading}
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--accent-blue)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              opacity: isUploading ? 0.6 : 1
            }}
          >
            {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image(s)`}
          </button>
        </div>
      )}
    </div>
  )
}
