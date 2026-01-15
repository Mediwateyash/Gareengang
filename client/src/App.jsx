import Hero from './components/Hero'
import About from './components/About'
import WorkInProgress from './components/WorkInProgress'
import Socials from './components/Socials'
import Footer from './components/Footer'
import './index.css'

function App() {
  return (
    <div className="app">
      <Hero />
      <About />
      <WorkInProgress />
      <Socials />
      <Footer />
    </div>
  )
}

export default App
