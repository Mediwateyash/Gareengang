import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Hero from './components/Hero'
import About from './components/About'
import WorkInProgress from './components/WorkInProgress'
import Socials from './components/Socials'
import Footer from './components/Footer'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import './index.css'

const LandingPage = () => (
  <>
    <Hero />
    <About />
    <WorkInProgress />
    <Socials />
    <Footer />
    {/* Secret Admin Link */}
    <div style={{ textAlign: 'center', padding: '10px', background: '#000' }}>
      <Link to="/login" style={{ fontSize: '0.8rem', color: '#333' }}>Admin Entry</Link>
    </div>
  </>
);

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
