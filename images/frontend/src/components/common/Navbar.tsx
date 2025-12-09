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

  const mobileNavLinkStyle = (active: boolean) => ({
    color: active ? 'var(--accent-color)' : 'var(--secondary-text)',
    fontSize: '16px',
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    padding: '16px 24px',
    display: 'block',
    textDecoration: 'none',
    borderLeft: active ? '3px solid var(--accent-color)' : '3px solid transparent'
  })

  const handleLinkClick = () => {
    setMobileMenuOpen(false)
  }

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
            to="/"
            onClick={handleLinkClick}
            style={{
              fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
              fontWeight: '700',
              letterSpacing: '-0.03em',
              color: 'var(--accent-color)',
              textDecoration: 'none',
              textTransform: 'uppercase'
            }}
          >
            Ontastbaar
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-toggle"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              zIndex: 1001
            }}
            aria-label="Toggle menu"
          >
            <span style={{
              width: '28px',
              height: '2px',
              backgroundColor: 'var(--accent-color)',
              transition: 'all 0.3s ease',
              transform: mobileMenuOpen ? 'rotate(45deg) translateY(8px)' : 'none'
            }}></span>
            <span style={{
              width: '28px',
              height: '2px',
              backgroundColor: 'var(--accent-color)',
              transition: 'all 0.3s ease',
              opacity: mobileMenuOpen ? 0 : 1
            }}></span>
            <span style={{
              width: '28px',
              height: '2px',
              backgroundColor: 'var(--accent-color)',
              transition: 'all 0.3s ease',
              transform: mobileMenuOpen ? 'rotate(-45deg) translateY(-8px)' : 'none'
            }}></span>
          </button>

          {/* Desktop Navigation */}
          <div style={{
            display: 'flex',
            gap: '32px',
            alignItems: 'center'
          }} className="desktop-nav">
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
                <Link to="/gallery" style={navLinkStyle(isActive('/gallery'))}>
                  Gallery
                </Link>
                <Link to="/my-rentals" style={navLinkStyle(isActive('/my-rentals'))}>
                  My Rentals
                </Link>
                {user.is_admin && (
                  <>
                    <Link to="/admin/artworks" style={navLinkStyle(isActive('/admin/artworks'))}>
                      Manage Artworks
                    </Link>
                    <Link to="/admin/rentals" style={navLinkStyle(isActive('/admin/rentals'))}>
                      Manage Rentals
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

      {/* Mobile Menu Backdrop */}
      {!mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998
          }}
          className="mobile-menu-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (

        <div
          style={{
            width: '100%',
            maxWidth: '80vw',
            backgroundColor: 'rgba(10, 10, 10, 0.98)',
            backdropFilter: 'blur(10px)',
            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            overflowY: 'auto',
            zIndex: 999,
            boxShadow: mobileMenuOpen ? '-4px 0 12px rgba(0, 0, 0, 0.3)' : 'none',
            borderLeft: '1px solid var(--border-color)'
          }}
          className="mobile-menu"
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 0'
          }}>
            {!user ? (
              <>
                <Link to="/" style={mobileNavLinkStyle(isActive('/'))} onClick={handleLinkClick}>
                  Home
                </Link>
                <Link to="/login" style={mobileNavLinkStyle(isActive('/login'))} onClick={handleLinkClick}>
                  Login
                </Link>
                <Link
                  to="/register"
                  style={{
                    ...mobileNavLinkStyle(isActive('/register')),
                    margin: '16px 24px',
                    backgroundColor: 'var(--accent-color)',
                    color: 'var(--primary-bg)',
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: 'none',
                    borderLeft: 'none'
                  }}
                  onClick={handleLinkClick}
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link to="/gallery" style={mobileNavLinkStyle(isActive('/gallery'))} onClick={handleLinkClick}>
                  Gallery
                </Link>
                <Link to="/my-rentals" style={mobileNavLinkStyle(isActive('/my-rentals'))} onClick={handleLinkClick}>
                  My Rentals
                </Link>
                {user.is_admin && (
                  <>
                    <Link to="/artworks" style={mobileNavLinkStyle(isActive('/artworks'))} onClick={handleLinkClick}>
                      Manage Artworks
                    </Link>
                    <Link to="/admin/rentals" style={mobileNavLinkStyle(isActive('/admin/rentals'))} onClick={handleLinkClick}>
                      Manage Rentals
                    </Link>
                  </>
                )} 
                <Link to="/profile" style={mobileNavLinkStyle(isActive('/profile'))} onClick={handleLinkClick}>
                  {user.first_name} {user.last_name}
                </Link>
                <a
                  onClick={() => {
                    logout()
                    handleLinkClick()
                  }}
                  style={{
                    ...mobileNavLinkStyle(false),
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
