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
            <div className="table-container" style={{ marginTop: '40px' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <h3 style={{ color: 'var(--museum-burgundy)', margin: '0', fontSize: '16px' }}>Curated Collections</h3>
                    </td>
                    <td>
                      <p style={{ margin: '0', color: 'var(--primary-text)' }}>Expertly selected artworks spanning centuries and cultures</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <h3 style={{ color: 'var(--museum-burgundy)', margin: '0', fontSize: '16px' }}>Interactive Tours</h3>
                    </td>
                    <td>
                      <p style={{ margin: '0', color: 'var(--primary-text)' }}>Guided experiences that bring art to life</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <h3 style={{ color: 'var(--museum-burgundy)', margin: '0', fontSize: '16px' }}>Educational Content</h3>
                    </td>
                    <td>
                      <p style={{ margin: '0', color: 'var(--primary-text)' }}>Deep insights into artists, movements, and techniques</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
