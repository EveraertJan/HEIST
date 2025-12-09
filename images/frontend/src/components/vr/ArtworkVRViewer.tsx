import { Canvas, useThree } from '@react-three/fiber'
import { createXRStore, XR } from '@react-three/xr'
import { Environment, OrbitControls, Text } from '@react-three/drei'
import { useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'
import type { Artwork } from '../../types'

interface ArtworkVRViewerProps {
  artwork: Artwork
  onClose: () => void
}

function ArtworkScene({ artwork }: { artwork: Artwork }) {
  const [texture, setTexture] = useState<string>('')

  useEffect(() => {
    // Get the first image of the artwork
    if (artwork.images && artwork.images.length > 0) {
      const imageUrl = `${import.meta.env.VITE_API_URL}/uploads/${artwork.images[0].filename}`
      setTexture(imageUrl)
    }
  }, [artwork])

  if (!texture) {
    return null
  }

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />

      {/* Environment */}
      <Environment preset="studio" />

      {/* Artwork frame with image texture */}
      <mesh position={[0, 1.6, -2]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial>
          <primitive attach="map" object={new THREE.TextureLoader().load(texture)} />
        </meshStandardMaterial>
      </mesh>

      {/* Title text below artwork */}
      <Text
        position={[0, 0.8, -1.99]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {artwork.title}
      </Text>

      {/* Artist names */}
      {artwork.artists && artwork.artists.length > 0 && (
        <Text
          position={[0, 0.6, -1.99]}
          fontSize={0.1}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          {artwork.artists.map(a => `${a.first_name} ${a.last_name}`).join(', ')}
        </Text>
      )}

      {/* Floor grid for spatial reference */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </>
  )
}

export default function ArtworkVRViewer({ artwork, onClose }: ArtworkVRViewerProps) {
  const [isVRSupported, setIsVRSupported] = useState(true)
  const store = useMemo(() => createXRStore(), [])

  useEffect(() => {
    // Check if WebXR is supported
    if (!('xr' in navigator)) {
      setIsVRSupported(false)
    }
  }, [])

  if (!isVRSupported) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        color: 'white',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h2>VR Not Supported</h2>
        <p>Your browser or device doesn't support WebXR.</p>
        <p>Try using a VR headset with a WebXR-compatible browser.</p>
        <button
          onClick={onClose}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: 'var(--accent-color)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000',
      zIndex: 9999
    }}>
      {/* Close button (visible before entering VR) */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '4px',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)'
        }}
      >
        Close
      </button>

      {/* VR Button */}
      <button
        onClick={() => store.enterVR()}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10000,
          padding: '16px 32px',
          fontSize: '18px',
          fontWeight: '600',
          backgroundColor: 'var(--accent-color)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}
      >
        Enter VR
      </button>

      {/* 3D Canvas */}
      <Canvas>
        <XR store={store}>
          <ArtworkScene artwork={artwork} />
          {/* OrbitControls for non-VR preview */}
          <OrbitControls />
        </XR>
      </Canvas>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: 'white',
        zIndex: 10000,
        pointerEvents: 'none'
      }}>
        <h2 style={{ marginBottom: '16px' }}>{artwork.title}</h2>
        <p style={{ opacity: 0.7, marginBottom: '32px' }}>
          Click "Enter VR" below to view in your VR headset
        </p>
        <p style={{ opacity: 0.5, fontSize: '14px' }}>
          Or use your mouse to look around
        </p>
      </div>
    </div>
  )
}
