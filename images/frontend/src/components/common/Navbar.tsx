import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const navLinkStyle = (active: boolean) => ({
    color: active ? 'var(--accent-color)' : 'var(--secondary-text)',
    fontSize: '14px',
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    transition: 'color 0.2s ease',
    cursor: 'pointer',
    padding: '8px 0',
    borderBottom: active ? '2px solid var(--accent-color)' : '2px solid transparent'
  })

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(10, 10, 10, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 0'
        }}>
          {/* Logo */}
          <Link
            to={user ? "/home" : "/"}
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              letterSpacing: '-0.03em',
              color: 'var(--accent-color)',
              textDecoration: 'none'
            }}
          >
            HEIST
          </Link>

          {/* Desktop Navigation */}
          <div style={{
            display: 'flex',
            gap: '32px',
            alignItems: 'center'
          }}>
            {!user ? (
              <>
                <Link to="/" style={navLinkStyle(isActive('/'))}>
                  Home
                </Link>
                <Link to="/login" style={navLinkStyle(isActive('/login'))}>
                  Login
                </Link>
                <Link
                  to="/register"
                  style={{
                    ...navLinkStyle(isActive('/register')),
                    backgroundColor: 'var(--accent-color)',
                    color: 'var(--primary-bg)',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    border: 'none'
                  }}
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link to="/home" style={navLinkStyle(isActive('/home'))}>
                  Gallery
                </Link>
                {user.is_admin && (
                  <>
                    <Link to="/admin/artworks" style={navLinkStyle(isActive('/admin/artworks'))}>
                      Manage Artworks
                    </Link>
                    <Link to="/admin/mediums" style={navLinkStyle(isActive('/admin/mediums'))}>
                      Manage Mediums
                    </Link>
                  </>
                )}
                <Link to="/profile" style={navLinkStyle(isActive('/profile'))}>
                  {user.first_name} {user.last_name}
                </Link>
                <a
                  onClick={logout}
                  style={{
                    ...navLinkStyle(false),
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
