import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Navbar, Footer } from './components/common'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Gallery from './pages/Gallery'
import Profile from './pages/Profile'
import ArtworkDetail from './pages/ArtworkDetail'
import AdminArtworks from './pages/AdminArtworks'
import AdminMediums from './pages/AdminMediums'
import AdminRentals from './pages/AdminRentals'
import CreateArtwork from './pages/CreateArtwork'
import RentalDetail from './pages/RentalDetail'
import RentArtwork from './pages/RentArtwork'
import MyRentals from './pages/MyRentals'
import FAQ from './pages/FAQ'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import GDPR from './pages/GDPR'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="container"><p>Loading...</p></div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="container"><p>Loading...</p></div>
  }

  if (user) {
    return <Navigate to="/gallery" />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1 , marginTop: '50px'}}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route path="/artworks/:uuid" element={
            <ArtworkDetail />
          } />
          <Route
            path="/rent/:uuid"
            element={
              <PrivateRoute>
                <RentArtwork />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-rentals"
            element={
              <PrivateRoute>
                <MyRentals />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/artworks"
            element={
              <PrivateRoute>
                <AdminArtworks />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/artworks/create"
            element={
              <PrivateRoute>
                <CreateArtwork />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/mediums"
            element={
              <PrivateRoute>
                <AdminMediums />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/rentals"
            element={
              <PrivateRoute>
                <AdminRentals />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/rentals/:uuid"
            element={
              <PrivateRoute>
                <RentalDetail />
              </PrivateRoute>
            }
          />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/gdpr" element={<GDPR />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
