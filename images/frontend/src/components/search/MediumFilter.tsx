import { useEffect, useRef } from 'react'
import type { Medium } from '../../types'

/**
 * Props for the MediumFilter component
 */
interface MediumFilterProps {
  /** Array of available mediums */
  mediums: Medium[]
  /** Array of selected medium UUIDs */
  selectedMediums: string[]
  /** Callback when a medium is toggled */
  onToggle: (mediumUuid: string) => void
  /** Callback to clear all selections */
  onClearAll: () => void
  /** Whether the dropdown is open */
  isOpen: boolean
  /** Callback to set dropdown open state */
  setIsOpen: (isOpen: boolean) => void
}

/**
 * MediumFilter Component
 *
 * A dropdown filter for selecting multiple mediums with checkboxes.
 * Includes a clear all button and displays the count of selected items.
 *
 * Features:
 * - Multi-select checkboxes
 * - Click outside to close
 * - Selected count display
 * - Clear all button
 * - Hover effects
 *
 * @component
 * @example
 * ```tsx
 * <MediumFilter
 *   mediums={mediums}
 *   selectedMediums={selectedMediums}
 *   onToggle={handleMediumToggle}
 *   onClearAll={() => setSelectedMediums([])}
 *   isOpen={isDropdownOpen}
 *   setIsOpen={setIsDropdownOpen}
 * />
 * ```
 */
export default function MediumFilter({
  mediums,
  selectedMediums,
  onToggle,
  onClearAll,
  isOpen,
  setIsOpen
}: MediumFilterProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [setIsOpen])

  if (mediums.length === 0) {
    return null
  }

  const handleClearAll = () => {
    onClearAll()
    setIsOpen(false)
  }

  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'left', gap: '20px'}}>
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
        {/* Dropdown Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
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
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>
            ▼
          </span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
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
            {/* Medium Options */}
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
                      transition: 'background-color 0.2s ease'
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
                      onChange={() => onToggle(medium.uuid)}
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

            {/* Clear All Button */}
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
                  onClick={handleClearAll}
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
  )
}
