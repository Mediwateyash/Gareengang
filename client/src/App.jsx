import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Hero from './components/Hero'
import About from './components/About'
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
import HomeTrips from './components/HomeTrips'
import TripsPage from './pages/TripsPage'
import TripDetails from './pages/TripDetails'
import Stats from './components/Stats'
import SocialScrapbook from './components/SocialScrapbook'
import DonateSection from './components/DonateSection'
import FloatingNav from './components/FloatingNav'
import './index.css'

// ... existing imports ...

const LandingPage = () => (
  <>
    <Hero />
    <MemoriesFeat />
    <HomeTrips />
    <Stats />
    <HomeVlogs />
    {/* HomeVlogs will be added here later */}
    <About />
    <Leaders />
    <Faces />
    <VideoReviews />
    <SocialScrapbook />
    <DonateSection />
    <Footer />
  </>
);

function App() {
  return (
    <Router>
      <div className="app">
        <FloatingNav />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/memories" element={<MemoriesTimeline />} />
          <Route path="/memories/:id" element={<MemoryDetail />} />
          <Route path="/vlogs" element={<Vlogs />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/trips/:id" element={<TripDetails />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
