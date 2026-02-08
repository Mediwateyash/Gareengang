import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Hero from './components/Hero'
import About from './components/About'
import WorkInProgress from './components/WorkInProgress'
import Socials from './components/Socials'
import Footer from './components/Footer'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Leaders from './components/Leaders'
import MemoriesTimeline from './pages/MemoriesTimeline'
import MemoriesFeat from './components/MemoriesFeat'
import './index.css'

const LandingPage = () => (
  <>
    <Hero />
    <MemoriesFeat />
    <About />
    <Leaders />
    <WorkInProgress />
    <Socials />
    <Footer />
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
          <Route path="/memories" element={<MemoriesTimeline />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
