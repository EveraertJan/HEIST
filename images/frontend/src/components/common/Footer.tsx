import { Link } from 'react-router-dom'

export default function Footer() {
  const footerSectionStyle = {
    marginBottom: '24px'
  }

  const footerTitleStyle = {
    fontSize: '14px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    marginBottom: '16px',
    color: 'var(--accent-color)',
    fontWeight: '600'
  }

  const footerLinkStyle = {
    color: 'var(--secondary-text)',
    fontSize: '14px',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '8px',
    transition: 'color 0.2s ease'
  }

  return (
    <footer style={{
      backgroundColor: 'var(--secondary-bg)',
      borderTop: '1px solid var(--border-color)',
      padding: '80px 0 24px',
      marginTop: '80px'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '48px',
          marginBottom: '48px'
        }}>
          {/* About Section */}
          <div style={footerSectionStyle}>
            <h4 style={footerTitleStyle}>About</h4>
            <p style={{ color: 'var(--secondary-text)', fontSize: '14px', lineHeight: '1.6' }}>
              HEIST is a digital gallery showcasing contemporary art and technology.
              Explore immersive artworks from artists around the world.
            </p>
          </div>

          {/* Visit Section */}
          <div style={footerSectionStyle}>
            <h4 style={footerTitleStyle}>Visit</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li><Link to="/gallery" style={footerLinkStyle}>Gallery</Link></li>
              <li><Link to="/faq" style={footerLinkStyle}>FAQ</Link></li>
              <li><Link to="/contact" style={footerLinkStyle}>Contact</Link></li>
            </ul>
          </div>

          {/* Legal Section */}
          <div style={footerSectionStyle}>
            <h4 style={footerTitleStyle}>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li><Link to="/terms" style={footerLinkStyle}>Terms of Service</Link></li>
              <li><Link to="/privacy" style={footerLinkStyle}>Privacy Policy</Link></li>
              <li><Link to="/gdpr" style={footerLinkStyle}>GDPR</Link></li>
            </ul>
          </div>

          {/* Connect Section */}
          <div style={footerSectionStyle}>
            <h4 style={footerTitleStyle}>Connect</h4>
            <p style={{ color: 'var(--secondary-text)', fontSize: '14px', marginBottom: '16px' }}>
              Stay updated with our latest exhibitions and events.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a
                href="#"
                style={{
                  ...footerLinkStyle,
                  display: 'inline-block',
                  marginBottom: 0
                }}
              >
                Instagram
              </a>
              <a
                href="#"
                style={{
                  ...footerLinkStyle,
                  display: 'inline-block',
                  marginBottom: 0
                }}
              >
                Twitter
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap' as const,
          gap: '16px'
        }}>
          <p style={{
            color: 'var(--secondary-text)',
            fontSize: '12px',
            margin: 0
          }}>
            &copy; {new Date().getFullYear()} HEIST Gallery. All rights reserved.
          </p>
          <p style={{
            color: 'var(--secondary-text)',
            fontSize: '12px',
            margin: 0,
            fontStyle: 'italic'
          }}>
            Art meets Technology
          </p>
        </div>
      </div>
    </footer>
  )
}
