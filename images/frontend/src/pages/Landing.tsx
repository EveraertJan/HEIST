import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Landing() {
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY })
    
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div style={{ marginTop: '-80px', overflow: 'hidden' }}>
      {/* Animated Background */}
      <div className="hero-background">
        <div 
          className="floating-orb orb-1" 
          style={{ 
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` 
          }}
        />
        <div 
          className="floating-orb orb-2" 
          style={{ 
            transform: `translate(${-mousePosition.x * 0.03}px, ${-mousePosition.y * 0.03}px)` 
          }}
        />
        <div 
          className="floating-orb orb-3" 
          style={{ 
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)` 
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="title-line">Discover</span>
              <span className="title-line title-accent">Extraordinary</span>
              <span className="title-line">Art</span>
            </h1>
            <p className="hero-subtitle">
              Immerse yourself in a world where masterpieces come alive. 
              Explore curated collections from renowned artists, rent unique artworks, 
              and transform your space with timeless beauty.
            </p>
            <div className="hero-actions">
              <Link to="/home" className="hero-btn primary">
                Explore Gallery
              </Link>
              <Link to="/login" className="hero-btn secondary">
                Sign In
              </Link>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="artwork-preview">
              <div className="preview-frame frame-1">
                <div className="frame-content" />
              </div>
              <div className="preview-frame frame-2">
                <div className="frame-content" />
              </div>
              <div className="preview-frame frame-3">
                <div className="frame-content" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose HEIST?</h2>
            <p className="section-subtitle">
              Where art meets innovation, creating unforgettable experiences
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-wrapper">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
              </div>
              <h3>Curated Collections</h3>
              <p>Handpicked masterpieces from emerging and established artists worldwide, spanning diverse styles and mediums.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-wrapper">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    <path d="M12 7v14"/>
                  </svg>
                </div>
              </div>
              <h3>Art Rental</h3>
              <p>Rent original artworks for your home or office. Experience living with art that inspires and transforms spaces.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-wrapper">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polygon points="10 8 16 12 10 16 10 8"/>
                  </svg>
                </div>
              </div>
              <h3>Virtual Tours</h3>
              <p>Immersive 360° experiences and detailed artwork stories that bring each piece's history to life.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-wrapper">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>
              <h3>Artist Support</h3>
              <p>Direct support for talented artists. Every rental and purchase helps creators continue their artistic journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Artworks</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Artists</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Happy Renters</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">25+</div>
              <div className="stat-label">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Space?</h2>
            <p className="cta-subtitle">
              Join thousands of art enthusiasts who have already discovered the joy of living with extraordinary art.
            </p>
            <div className="cta-actions">
              <Link to="/register" className="cta-btn primary">
                Get Started Free
              </Link>
              <Link to="/home" className="cta-btn secondary">
                Browse Collection
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
