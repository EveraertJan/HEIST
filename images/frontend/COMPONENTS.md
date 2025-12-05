# Frontend Component Architecture

This document outlines the component structure and organization of the frontend application.

## Directory Structure

```
src/
├── components/
│   ├── artworks/           # Artwork-related components
│   │   ├── ArtworkCard.tsx
│   │   ├── ImageGrid.tsx
│   │   └── index.ts
│   ├── search/             # Search and filter components
│   │   ├── SearchBar.tsx
│   │   ├── MediumFilter.tsx
│   │   └── index.ts
│   └── common/             # Common reusable components
│       ├── Alert.tsx
│       ├── Button.tsx
│       ├── EmptyState.tsx
│       ├── Footer.tsx
│       ├── ImageModal.tsx
│       ├── Loading.tsx
│       ├── Navbar.tsx
│       └── RichTextEditor.tsx
├── pages/                  # Page components
│   ├── Home.tsx
│   ├── ArtworkDetail.tsx
│   ├── AdminArtworks.tsx
│   └── CreateArtwork.tsx
└── services/               # API services
    └── api.ts
```

## Component Categories

### Artwork Components (`components/artworks/`)

#### ArtworkCard
Displays an artwork as a card with image thumbnail, title, description, and mediums.

**Props:**
- `artwork`: Artwork object
- `showFullDescription?`: Whether to show full or truncated description

**Features:**
- Responsive card layout
- Image thumbnail with fallback
- Multiple images indicator badge
- Hover effects
- Medium tags
- Links to artwork detail page

**Usage:**
```tsx
<ArtworkCard artwork={artwork} />
```

#### ImageGrid
Displays a responsive grid of images with click-to-enlarge functionality.

**Props:**
- `images`: Array of ArtworkImage objects
- `altPrefix`: Alt text prefix for images
- `showDescriptions?`: Show description overlays
- `showNumbers?`: Show image number indicators

**Features:**
- Adaptive layout (single image vs. grid)
- Click to open modal
- Description overlays
- Image numbering
- Hover effects

**Usage:**
```tsx
<ImageGrid
  images={artwork.images}
  altPrefix={artwork.title}
  showDescriptions
  showNumbers
/>
```

### Search Components (`components/search/`)

#### SearchBar
Reusable search input with submit button.

**Props:**
- `value`: Current search term
- `onChange`: Handler for value changes
- `onSubmit`: Handler for form submission
- `placeholder?`: Input placeholder text
- `loading?`: Loading state

**Usage:**
```tsx
<SearchBar
  value={searchTerm}
  onChange={setSearchTerm}
  onSubmit={handleSearch}
  placeholder="Search artworks..."
/>
```

#### MediumFilter
Dropdown filter for selecting multiple mediums with checkboxes.

**Props:**
- `mediums`: Array of Medium objects
- `selectedMediums`: Array of selected medium UUIDs
- `onToggle`: Handler for toggling a medium
- `onClearAll`: Handler for clearing all selections
- `isOpen`: Dropdown open state
- `setIsOpen`: Setter for dropdown state

**Features:**
- Multi-select checkboxes
- Click outside to close
- Selected count display
- Clear all button

**Usage:**
```tsx
<MediumFilter
  mediums={mediums}
  selectedMediums={selectedMediums}
  onToggle={handleMediumToggle}
  onClearAll={() => setSelectedMediums([])}
  isOpen={isDropdownOpen}
  setIsOpen={setIsDropdownOpen}
/>
```

### Common Components (`components/common/`)

#### EmptyState
Displays centered empty state messages with optional icon.

**Props:**
- `message`: Main message text
- `description?`: Secondary message
- `icon?`: Icon or emoji to display

**Usage:**
```tsx
<EmptyState
  icon="🎨"
  message="No artworks found"
  description="Try adjusting your search"
/>
```

#### Button
Reusable button component with variants and sizes.

#### ImageModal
Modal for displaying full-size images.

#### Other Common Components
- Alert: Alert/notification messages
- Loading: Loading spinners
- Navbar: Navigation bar
- Footer: Page footer
- RichTextEditor: Rich text editing

## Pages

### Home (`pages/Home.tsx`)
Main gallery page displaying all artworks.

**Features:**
- Search by title/artist
- Filter by mediums
- Card grid layout
- Real-time filtering

**Components Used:**
- ArtworkCard
- SearchBar
- MediumFilter
- EmptyState

### ArtworkDetail (`pages/ArtworkDetail.tsx`)
Detailed view of a single artwork.

**Features:**
- Image gallery
- Full artwork information
- Artist and medium details
- Rent button

**Components Used:**
- ImageGrid
- Button
- EmptyState

### AdminArtworks (`pages/AdminArtworks.tsx`)
Admin interface for managing artworks.

**Features:**
- CRUD operations
- Image management
- Inline editing

### CreateArtwork (`pages/CreateArtwork.tsx`)
Form for creating new artworks with image upload.

## Design Principles

### Component Composition
- Small, focused components with single responsibilities
- Composable and reusable across pages
- Props-based configuration for flexibility

### State Management
- Local state for UI interactions
- Prop drilling for parent-child communication
- Context for auth state

### Styling
- Inline styles with CSS variables
- Consistent design tokens
- Responsive layouts with CSS Grid/Flexbox

### Type Safety
- TypeScript interfaces for all props
- Strict type checking enabled
- Type imports from shared types file

### Documentation
- JSDoc comments for all components
- Props interface documentation
- Usage examples in comments
- Feature lists for complex components

## Best Practices

1. **Import Organization**
   - React imports first
   - Third-party libraries
   - Local components
   - Types last

2. **Component Structure**
   - Interface/props definition
   - JSDoc documentation
   - Component function
   - Helper functions inside component
   - Export at bottom

3. **File Naming**
   - PascalCase for components (e.g., `ArtworkCard.tsx`)
   - camelCase for utilities (e.g., `formatters.ts`)
   - Index files for grouped exports

4. **Code Comments**
   - JSDoc for components and functions
   - Inline comments for complex logic
   - No obvious comments

5. **Performance**
   - Memoization where appropriate
   - Lazy loading for routes
   - Optimized re-renders

## Adding New Components

When creating a new component:

1. Choose appropriate directory (`artworks/`, `search/`, `common/`)
2. Create TypeScript file with PascalCase name
3. Define Props interface with JSDoc
4. Add component documentation
5. Include usage example
6. Export from index file
7. Update this documentation

## API Integration

Components interact with the API through the `services/api.ts` module:

```tsx
import { searchArtworks } from '../services/api'

const response = await searchArtworks(term, filters)
const artworks = response.data.data
```

All API functions return Axios responses with typed data.
