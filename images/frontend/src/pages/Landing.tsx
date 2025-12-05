import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchArtworks } from '../services/api'
import { getImageUrl } from '../utils'
import type { Artwork } from '../types'
import Button from './../components/common/Button'

/**
 * Landing Page Component
 *
 * Bold, immersive landing experience inspired by NXT Museum.
 * Positions the service as home-scale immersive art experiences.
 *
 * Design Philosophy:
 * - Bold, minimal typography
 * - Dark, sophisticated color palette
 * - Large hero imagery
 * - Clear value proposition
 * - Strong CTAs
 *
 * @component
 */
export default function Landing() {
  const navigate = useNavigate()
  const [featuredArtworks, setFeaturedArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedArtworks()
  }, [])

  const loadFeaturedArtworks = async () => {
    try {
      setLoading(true)
      const response = await searchArtworks()
      setFeaturedArtworks(response.data.data.slice(0, 4))
    } catch (err) {
      console.error('Failed to load featured artworks:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000'
    }}>
      {/* HERO SECTION - Bold & Immersive */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #000000 0%, #111111 100%)'
      }}>
        {/* Background Effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.3,
          background: 'radial-gradient(circle at 30% 40%, rgba(139, 92, 246, 0.2) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(74, 158, 255, 0.2) 0%, transparent 60%)',
          animation: 'subtlePulse 10s ease-in-out infinite'
        }} />

        <div style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          textAlign: 'center'
        }}>
          {/* Main Headline */}
          <h1 style={{
            fontSize: 'clamp(3rem, 10vw, 7rem)',
            fontWeight: '900',
            lineHeight: '0.95',
            letterSpacing: '-0.04em',
            color: '#ffffff',
            marginBottom: '32px',
            textTransform: 'uppercase',
            wordSpacing: '100vw',
          }}>
            Immersive Art Experiences For Your Space
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: 'clamp(1.125rem, 2.5vw, 1.75rem)',
            fontWeight: '300',
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: '800px',
            margin: '0 auto 64px',
            lineHeight: '1.6'
          }}>
            Rent curated art installations designed for homes and events.
            Transform spaces. Spark conversations.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Button
              variant="primary"
              size="xl"
              onClick={() => navigate('/gallery')} 
            >
              Explore Experiences
            </Button>

            <Button
              onClick={() => {
                const element = document.getElementById('for-companies')
                element?.scrollIntoView({ behavior: 'smooth' })
              }}
              size="xl"
              variant="secundary"
            >
              For Companies
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '48px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          opacity: 0.5,
          animation: 'fadeInOut 3s ease-in-out infinite'
        }}>
          <span style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.2em'
          }}>
            Scroll
          </span>
          <div style={{
            width: '1px',
            height: '40px',
            backgroundColor: 'rgba(255, 255, 255, 0.3)'
          }} />
        </div>
      </section>

      {/* FEATURED EXPERIENCES */}
      <section style={{
        padding: '160px 24px',
        backgroundColor: '#0a0a0a'
      }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          <div style={{ marginBottom: '96px' }}>
            <h2 style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              color: '#ffffff',
              marginBottom: '24px'
            }}>
              Featured
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: 'rgba(255, 255, 255, 0.6)',
              maxWidth: '600px'
            }}>
              Curated immersive experiences designed to transform your environment and ignite meaningful dialogue
            </p>
          </div>

          {!loading && featuredArtworks.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '32px'
            }}>
              {featuredArtworks.map((artwork, index) => {
                const firstImage = artwork.images?.[0]
                return (
                  <Link
                    key={artwork.uuid}
                    to={`/artworks/${artwork.uuid}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'block',
                      position: 'relative',
                      aspectRatio: '4/5',
                      overflow: 'hidden',
                      backgroundColor: '#1a1a1a'
                    }}
                  >
                    {firstImage ? (
                      <img
                        src={getImageUrl(firstImage.filename)}
                        alt={artwork.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.6s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(135deg,
                          ${index === 0 ? '#C2FE0B' : index === 1 ? '#4A9EFF' : index === 2 ? '#FF6B9D' : '#10B981'} 30%,
                          #000000 100%)`
                      }} />
                    )}

                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '24px 40px',
                      background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 60%)'
                    }}>
                      <span style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#ffffff',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {artwork.title}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          <div style={{ marginTop: '96px', textAlign: 'center' }}>
            <Link
              to="/gallery"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px 56px',
                fontSize: '16px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#ffffff',
                textDecoration: 'none',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)'
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              View All Experiences
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{
        padding: '160px 24px',
        backgroundColor: '#000000',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            color: '#ffffff',
            marginBottom: '96px',
            textAlign: 'center'
          }}>
            How It Works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '64px'
          }}>
            {[
              { number: '01', title: 'Browse', description: 'Explore our curated collection of immersive digital art experiences designed for intimate spaces' },
              { number: '02', title: 'Select', description: 'Choose the perfect experience that resonates with your space and intention' },
              { number: '03', title: 'Install', description: 'We provide all equipment and setup guidance for a seamless installation' },
              { number: '04', title: 'Experience', description: 'Transform your environment and watch conversations unfold naturally' }
            ].map((step) => (
              <div key={step.number}>
                <div style={{
                  fontSize: '4rem',
                  fontWeight: '900',
                  color: 'rgba(255, 255, 255, 0.1)',
                  marginBottom: '24px',
                  lineHeight: '1'
                }}>
                  {step.number}
                </div>
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#ffffff',
                  marginBottom: '16px'
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: '14pt',
                  lineHeight: '1.8',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR COMPANIES */}
      <section
        id="for-companies"
        style={{
          backgroundColor: '#0a0a0a',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          minHeight: '100vh'
        }}>
          <div style={{
            padding: '96px 64px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <h2 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              color: '#ffffff',
              marginBottom: '32px',
              lineHeight: '1'
            }}>
              For Companies & Events
            </h2>

            <p style={{
              fontSize: '12pt',
              lineHeight: '1.8',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '48px',
              maxWidth: '560px'
            }}>
              Create unforgettable corporate experiences. Our installations serve as powerful conversation catalysts,
              breaking the ice and fostering meaningful connections at conferences, offices, and exclusive events.
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              marginBottom: '48px'
            }}>
              {[
                'Custom curation for your brand narrative',
                'Full technical support and setup',
                'Flexible rental periods',
                'Perfect for conferences, offices, showrooms'
              ].map((benefit, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#C2FE0B',
                    transform: 'rotate(45deg)'
                  }} />
                  <span style={{
                    fontSize: '12pt',
                    color: 'rgba(255, 255, 255, 0.9)'
                  }}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => window.location.href = 'mailto:events@heist.gallery'}
              variant="primary"
              size="xl"
              style={{
                width: "300px"
              }}
            >
              Get In Touch
            </Button>
          </div>

          <div style={{
            backgroundColor: '#1a1a1a',
            backgroundImage: 'linear-gradient(45deg, #C2FE0B 0%, #C2FE0B 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 15s ease infinite',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 'clamp(4rem, 15vw, 12rem)',
              fontWeight: '900',
              color: 'rgba(255, 255, 255, 0.5)',
              textTransform: 'uppercase',
              lineHeight: '0.9',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}>
              HEIST
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{
        padding: '160px 24px',
        backgroundColor: '#000000',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '300',
            color: '#ffffff',
            marginBottom: '48px',
            lineHeight: '1.4'
          }}>
            Ready to transform your space into a conversation starter?
          </h2>

          <button
            onClick={() => navigate('/gallery')}
            style={{
              padding: '24px 72px',
              fontSize: '18px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(255, 255, 255, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Start Exploring
          </button>
        </div>
      </section>

      <style>{`
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.4; }
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  )
}
