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

  // Form state
  const [address, setAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [availability, setAvailability] = useState<boolean | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (uuid) {
      loadArtwork(uuid)
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

  const handleCheckAvailability = async () => {
    if (!uuid || !startDate || !endDate) return

    try {
      setCheckingAvailability(true)
      setError('')
      const response = await checkArtworkAvailability(uuid, startDate, endDate)
      setAvailability(response.data.data.available)
      if (!response.data.data.available) {
        setError('This artwork is not available for the selected dates')
      }
    } catch (err) {
      setError('Failed to check availability')
    } finally {
      setCheckingAvailability(false)
    }
  }

  useEffect(() => {
    if (startDate && endDate) {
      handleCheckAvailability()
    }
  }, [startDate, endDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!uuid) return

    if (availability === false) {
      setError('Artwork is not available for selected dates')
      return
    }

    try {
      setSubmitting(true)
      await createRentalRequest({
        artworkUuid: uuid,
        address,
        phoneNumber,
        startDate,
        endDate
      })
      setSuccess('Rental request submitted successfully! An admin will review your request.')
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

        {/* Artwork Info */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h2 style={{ marginBottom: '12px' }}>{artwork.title}</h2>
          {artwork.description && (
            <p style={{ color: 'var(--secondary-text)', marginBottom: '12px' }}>
              {artwork.description}
            </p>
          )}
          {artwork.artists && artwork.artists.length > 0 && (
            <p style={{ color: 'var(--secondary-text)', fontSize: '14px' }}>
              By: {artwork.artists.map(a => `${a.first_name} ${a.last_name}`).join(', ')}
            </p>
          )}
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
        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '32px'
        }}>
          <h3 style={{ marginBottom: '24px' }}>Rental Details</h3>

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--secondary-text)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--secondary-text)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  End Date *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  min={startDate || new Date().toISOString().split('T')[0]}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {checkingAvailability && (
              <p style={{ color: 'var(--secondary-text)', fontSize: '14px', marginBottom: '20px' }}>
                Checking availability...
              </p>
            )}

            {availability === true && !checkingAvailability && (
              <p style={{ color: 'var(--accent-blue)', fontSize: '14px', marginBottom: '20px' }}>
                ✓ Artwork is available for selected dates
              </p>
            )}

            <div style={{ display: 'flex', gap: '16px' }}>
              <Button type="submit" variant="primary" size="large" disabled={submitting || availability === false}>
                {submitting ? 'Submitting...' : 'Submit Rental Request'}
              </Button>
              <Button type="button" onClick={() => navigate(`/artworks/${uuid}`)} variant="secondary" size="large">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
