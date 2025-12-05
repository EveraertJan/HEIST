import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [notificationCount, setNotificationCount] = useState(0)

 
  if (!user) {
    return null
  }

  return (
    <nav style={{
      position: 'sticky',
      top: '0px',
      zIndex: 1000,
      backgroundColor: '#ffe700'
    }}>
      <div className="container navbar">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <Link to="/" className="subtleLink" style={{float: 'left'}}>
              HOME
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link to="/profile">
              {user.first_name} {user.last_name}
            </Link>
            <a
              onClick={logout}
            >
              Logout
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
