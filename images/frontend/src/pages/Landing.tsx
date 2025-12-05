import { Link } from 'react-router-dom'

export default function Landing() {
  return (
   <div style={{ width: '100vw', height: '100vh', backgroundColor: '#ffe700', marginTop: '-50px', display: 'flex', justifyContent: 'center'}}>
    <div style={{display: 'flex', flexDirection:'column', height: '400px', marginTop: '20vh', textAlign: 'center', alignItems: 'center'}}>
      
      <h1>
        HEIST
      </h1>
      <p>
        Get immersed at home.
      </p>
      <Link to="/login" className="button-primary" style={{padding: '20px 10px', width: '150px'}}>
        Get Started
      </Link>
    </div>
  </div>

  )
}
