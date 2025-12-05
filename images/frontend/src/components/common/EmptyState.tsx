/**
 * Props for the EmptyState component
 */
interface EmptyStateProps {
  /** Main message to display */
  message: string
  /** Optional secondary message or suggestion */
  description?: string
  /** Optional icon or emoji to display */
  icon?: string
}

/**
 * EmptyState Component
 *
 * Displays a centered empty state message with optional icon and description.
 * Used when there are no items to display (e.g., no search results, no artworks).
 *
 * @component
 * @example
 * ```tsx
 * <EmptyState
 *   icon="🎨"
 *   message="No artworks found"
 *   description="Try adjusting your search or filters"
 * />
 * ```
 */
export default function EmptyState({ message, description, icon }: EmptyStateProps) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '80px 20px',
      color: 'var(--secondary-text)'
    }}>
      {icon && (
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>
          {icon}
        </div>
      )}
      <p style={{
        fontSize: '18px',
        marginBottom: description ? '16px' : '0'
      }}>
        {message}
      </p>
      {description && (
        <p style={{ fontSize: '14px' }}>
          {description}
        </p>
      )}
    </div>
  )
}
