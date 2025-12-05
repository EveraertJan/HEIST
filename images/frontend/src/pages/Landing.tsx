import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div style={{ marginTop: '-50px' }}>
      <section className="museum-hero">
        <div className="container">
          <h1 className="museum-title">
            <span className="museum-accent">HEIST</span>
          </h1>
          <p className="museum-subtitle">
            Experience Art & Culture From Your Home
          </p>
          <Link to="/login" className="button-primary">
            Begin Your Journey
          </Link>
        </div>
      </section>

      <section className="museum-section">
        <div className="container">
          <div className="museum-card">
            <h2>Welcome to Your Virtual Gallery</h2>
            <p>
              Immerse yourself in curated collections and interactive exhibitions 
              that bring the museum experience directly to you. Explore masterpieces, 
              discover hidden gems, and connect with art in ways never before possible.
            </p>
            <hr className="museum-divider" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginTop: '40px' }}>
              <div>
                <h3 style={{ color: 'var(--museum-burgundy)', marginBottom: '15px' }}>Curated Collections</h3>
                <p>Expertly selected artworks spanning centuries and cultures</p>
              </div>
              <div>
                <h3 style={{ color: 'var(--museum-burgundy)', marginBottom: '15px' }}>Interactive Tours</h3>
                <p>Guided experiences that bring art to life</p>
              </div>
              <div>
                <h3 style={{ color: 'var(--museum-burgundy)', marginBottom: '15px' }}>Educational Content</h3>
                <p>Deep insights into artists, movements, and techniques</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
