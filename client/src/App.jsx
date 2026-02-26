import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Hero from './components/Hero'
import About from './components/About'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
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
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthModal from './components/AuthModal'
import WelcomeToast from './components/WelcomeToast'
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

const ProtectedRoute = ({ children }) => {
  const { user, showAuthModal } = useAuth();

  if (!user) {
    // Show modal instead of redirecting
    setTimeout(() => showAuthModal('login'), 0);
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <AuthModal />
          <WelcomeToast />
          <FloatingNav />
          <Routes>
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/memories" element={
              <ProtectedRoute>
                <MemoriesTimeline />
              </ProtectedRoute>
            } />
            <Route path="/memories/:id" element={
              <ProtectedRoute>
                <MemoryDetail />
              </ProtectedRoute>
            } />
            <Route path="/vlogs" element={<Vlogs />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/trips/:id" element={<TripDetails />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
