import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, updateProfile, changePassword, deleteAccount } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import MD5 from 'crypto-js/md5'
import Button from '../components/common/Button'

export default function Profile() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Profile fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // Account deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await getProfile()
      setFirstName(response.data.first_name)
      setLastName(response.data.last_name)
      setEmail(response.data.email)
      setIsAdmin(response.data.is_admin || false)
      // Format date to YYYY-MM-DD for HTML date input
      if (response.data.date_of_birth) {
        const date = new Date(response.data.date_of_birth)
        const formattedDate = date.toISOString().split('T')[0]
        setDateOfBirth(formattedDate)
      } else {
        setDateOfBirth('')
      }
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const response = await updateProfile({
        first_name: firstName,
        last_name: lastName,
        email,
        date_of_birth: dateOfBirth || null
      })

      // Update token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
      }

      setSuccess('Profile updated successfully')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }

    setChangingPassword(true)

    try {
      // Hash the passwords before sending
      const hashedCurrentPassword = MD5(currentPassword).toString()
      const hashedNewPassword = MD5(newPassword).toString()

      await changePassword(hashedCurrentPassword, hashedNewPassword)
      setPasswordSuccess('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setPasswordError(error.response?.data?.message || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return
    }

    setDeleting(true)

    try {
      await deleteAccount()
      logout()
      navigate('/')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Failed to delete account')
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="single_container container"><p>Loading...</p></div>
  }

  return (
    <div className="single_container container">
      <div className="row">
        <div className="twelve columns">

          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}

          <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd' }}>
            <div style={{display: 'flex'}}>
              <h4>Profile Information</h4>
              
              {/* Admin Status Display */}
              <div style={{ 
                marginBottom: '20px', 
                padding: '12px 16px', 
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: isAdmin ? '#155724' : '#6c757d'
                }}>
                    {isAdmin ? 'Administrator' : 'Regular User'}
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="row">
                <div className="six columns">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    className="u-full-width"
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="six columns">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    className="u-full-width"
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <label htmlFor="email">Email</label>
              <input
                className="u-full-width"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                className="u-full-width"
                type="date"
                id="dateOfBirth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />

              <Button type="submit" variant="primary" size="medium" disabled={saving}>
                {saving ? 'Saving...' : 'Update Profile'}
              </Button>
            </form>
          </div>

          <div style={{ padding: '20px', border: '1px solid #ddd', marginBottom: '30px' }}>
            <h4>Change Password</h4>
            {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
            {passwordSuccess && <p style={{ color: 'green' }}>{passwordSuccess}</p>}
            <form onSubmit={handleChangePassword}>
              <label htmlFor="currentPassword">Current Password</label>
              <input
                className="u-full-width"
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <label htmlFor="newPassword">New Password</label>
              <input
                className="u-full-width"
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                className="u-full-width"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button type="submit" variant="primary" size="medium" disabled={changingPassword}>
                {changingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </div>

          <div style={{ padding: '20px', border: '2px solid #dc3545' }}>
            <h4 style={{ color: '#dc3545' }}>Delete Account</h4>
            <p style={{ color: '#dc3545', marginBottom: '15px' }}>
              <strong>Warning:</strong> This action cannot be undone. When you delete your account:
            </p>
            <ul style={{ color: '#fff', marginBottom: '15px' }}>
              <li>Your personal information will be permanently removed</li>
              <li>Your feedback content will be replaced with "[Student account removed]"</li>
              <li>Teachers will still see you listed as a removed student</li>
              <li>All your uploaded images and documents will be deleted</li>
            </ul>

            {!showDeleteConfirm ? (
              <Button
                variant="danger"
                size="medium"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete My Account
              </Button>
            ) : (
              <div>
                <p style={{ color: '#dc3545', fontWeight: 'bold', marginBottom: '10px' }}>
                  Are you absolutely sure? This cannot be undone!
                </p>
                <p style={{ marginBottom: '10px' }}>
                  Type <strong>DELETE</strong> to confirm:
                </p>
                <input
                  className="u-full-width"
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  style={{ marginBottom: '10px' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button
                    variant="danger"
                    size="medium"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE' || deleting}
                    style={{ opacity: deleteConfirmText === 'DELETE' ? 1 : 0.5 }}
                  >
                    {deleting ? 'Deleting...' : 'Confirm Delete Account'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="medium"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteConfirmText('')
                    }}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
