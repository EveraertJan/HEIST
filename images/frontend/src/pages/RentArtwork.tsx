import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getArtworkByUuid, createRentalRequest, checkArtworkAvailability } from '../services/api'
import type { Artwork } from '../types'
import Button from '../components/common/Button'

export default function RentArtwork() {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [available, setAvailable] = useState<boolean | null>(null)

  // Form state
  const [address, setAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (uuid) {
      loadArtwork(uuid)
      checkAvailability(uuid)
    }
  }, [uuid, user])

  const loadArtwork = async (artworkUuid: string) => {
    try {
      setLoading(true)
      const response = await getArtworkByUuid(artworkUuid)
      setArtwork(response.data.data)
    } catch (err) {
      setError('Failed to load artwork')
    } finally {
      setLoading(false)
    }
  }

  const checkAvailability = async (artworkUuid: string) => {
    try {
      const response = await checkArtworkAvailability(artworkUuid)
      setAvailable(response.data.data.available)
      if (!response.data.data.available) {
        setError('This artwork is currently not available for rental')
      }
    } catch (err) {
      console.error('Failed to check availability', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!uuid) return

    if (available === false) {
      setError('Artwork is not available')
      return
    }

    try {
      setSubmitting(true)
      await createRentalRequest({
        artworkUuid: uuid,
        address,
        phoneNumber
      })
      setSuccess('Rental request submitted successfully! An admin will review your request. Maximum rental period is 1 month.')
      setTimeout(() => navigate('/my-rentals'), 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit rental request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--secondary-text)' }}>Loading...</p>
      </div>
    )
  }

  if (!artwork) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
        <div className="container" style={{ padding: '48px 24px', maxWidth: '800px' }}>
          <p style={{ color: 'var(--accent-pink)' }}>Artwork not found</p>
          <Button onClick={() => navigate('/home')} variant="secondary" size="medium">
            Back to Gallery
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <div className="container" style={{ padding: '48px 24px', maxWidth: '800px' }}>
        <h1 style={{ marginBottom: '32px' }}>Rent Artwork</h1>

        {/* Artwork Info Table */}
        <div className="table-container" style={{ marginBottom: '32px' }}>
          <table className="table">
            <tbody>
              <tr>
                <th>Title</th>
                <td>{artwork.title}</td>
              </tr>
              {artwork.description && (
                <tr>
                  <th>Description</th>
                  <td>{artwork.description}</td>
                </tr>
              )}
              {artwork.artists && artwork.artists.length > 0 && (
                <tr>
                  <th>Artists</th>
                  <td>{artwork.artists.map(a => `${a.first_name} ${a.last_name}`).join(', ')}</td>
                </tr>
              )}
              {artwork.mediums && artwork.mediums.length > 0 && (
                <tr>
                  <th>Mediums</th>
                  <td>{artwork.mediums.map(m => m.name).join(', ')}</td>
                </tr>
              )}
              {(artwork.width || artwork.height || artwork.depth) && (
                <tr>
                  <th>Dimensions</th>
                  <td>
                    {[
                      artwork.width && `W: ${artwork.width}`,
                      artwork.height && `H: ${artwork.height}`,
                      artwork.depth && `D: ${artwork.depth}`
                    ].filter(Boolean).join(' × ')}
                  </td>
                </tr>
              )}
              <tr>
                <th>Availability</th>
                <td>
                  {available === false && (
                    <span className="table-status cancelled">
                      Currently rented out and not available
                    </span>
                  )}
                  {available === true && (
                    <span className="table-status active">
                      ✓ Available for rental
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(255, 107, 157, 0.1)',
            border: '1px solid var(--accent-pink)',
            borderRadius: '8px',
            color: 'var(--accent-pink)',
            marginBottom: '24px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(74, 158, 255, 0.1)',
            border: '1px solid var(--accent-blue)',
            borderRadius: '8px',
            color: 'var(--accent-blue)',
            marginBottom: '24px'
          }}>
            {success}
          </div>
        )}

        {/* Rental Request Form */}
        {available !== false && (
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '32px'
          }}>
            <h3 style={{ marginBottom: '16px' }}>Rental Details</h3>
            

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--secondary-text)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Delivery Address *
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={3}
                  placeholder="Enter your full delivery address"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--secondary-text)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  placeholder="e.g., +1 234 567 8900"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <Button type="submit" variant="primary" size="large" disabled={submitting || available === false}>
                  {submitting ? 'Submitting...' : 'Submit Rental Request'}
                </Button>
                <Button type="button" onClick={() => navigate(`/artworks/${uuid}`)} variant="secondary" size="large">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
