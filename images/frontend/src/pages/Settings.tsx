import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/common/Button'

export default function Settings() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <div className="container" style={{ padding: '48px 24px', maxWidth: '800px' }}>
        <h1 style={{ marginBottom: '32px' }}>Settings</h1>

        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Account</h2>
          <p style={{ color: 'var(--secondary-text)', marginBottom: '24px' }}>
            Manage your account settings and preferences
          </p>
          <Button
            onClick={() => navigate('/profile')}
            variant="primary"
            size="medium"
          >
            Edit Profile
          </Button>
        </div>

        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Are you an artist and want to submit your own work?</h2>
          <p style={{ color: 'var(--secondary-text)', marginBottom: '16px' }}>
            Submit your artwork to be displayed in the gallery.
            {user?.is_admin
              ? ' As an admin, your artworks will be published immediately.'
              : ' Your submission will be reviewed by an administrator before appearing in the gallery.'
            }
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Button
              onClick={() => navigate('/submit-artwork')}
              variant="primary"
              size="medium"
            >
              Submit New Artwork
            </Button>
            <Button
              onClick={() => navigate('/my-artworks')}
              variant="secondary"
              size="medium"
            >
              View My Submissions
            </Button>
          </div>
        </div>

        {user?.is_admin && (
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--accent-yellow)',
            borderRadius: '8px',
            padding: '32px'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Admin Tools</h2>
            <p style={{ color: 'var(--secondary-text)', marginBottom: '24px' }}>
              Manage artworks, rentals, and review submissions
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Button
                onClick={() => navigate('/admin/artworks')}
                variant="info"
                size="medium"
              >
                Manage Artworks
              </Button>
              <Button
                onClick={() => navigate('/admin/rentals')}
                variant="info"
                size="medium"
              >
                Manage Rentals
              </Button>
              <Button
                onClick={() => navigate('/admin/mediums')}
                variant="info"
                size="medium"
              >
                Manage Mediums
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
