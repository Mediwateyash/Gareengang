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
import MemoryDetail from './pages/MemoryDetail'
import MemoriesFeat from './components/MemoriesFeat'
import Faces from './components/Faces'
import VideoReviews from './components/VideoReviews'
import Vlogs from './pages/Vlogs'
import HomeVlogs from './components/HomeVlogs'
import Stats from './components/Stats'
import DonateSection from './components/DonateSection'
import './index.css'

// ... existing imports ...

const LandingPage = () => (
  <>
    <Hero />
    <MemoriesFeat />
    <Stats />
    <HomeVlogs />
    {/* HomeVlogs will be added here later */}
    <About />
    <Leaders />
    <VideoReviews />
    <Faces />
    <WorkInProgress />
    <DonateSection />
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
          <Route path="/memories/:id" element={<MemoryDetail />} />
          <Route path="/vlogs" element={<Vlogs />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
