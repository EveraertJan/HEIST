import Button from '../common/Button'

/**
 * Props for the SearchBar component
 */
interface SearchBarProps {
  /** Current search term value */
  value: string
  /** Callback when search term changes */
  onChange: (value: string) => void
  /** Callback when search is submitted */
  onSubmit: () => void
  /** Placeholder text for the search input */
  placeholder?: string
  /** Whether the search is currently loading */
  loading?: boolean
}

/**
 * SearchBar Component
 *
 * A reusable search bar with input field and submit button.
 * Handles form submission and provides controlled input.
 *
 * @component
 * @example
 * ```tsx
 * <SearchBar
 *   value={searchTerm}
 *   onChange={setSearchTerm}
 *   onSubmit={handleSearch}
 *   placeholder="Search artworks..."
 * />
 * ```
 */
export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search...',
  loading = false
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '0' }}>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          style={{
            flex: '1',
            minWidth: '300px',
            fontSize: '16px',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--primary-text)',
            padding: '12px 16px'
          }}
        />
        <Button
          type="submit"
          variant="primary"
          size="medium"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>
    </form>
  )
}
