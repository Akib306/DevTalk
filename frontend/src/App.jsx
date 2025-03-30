import { Routes, Route, Links } from 'react-router-dom'
import LandingPage from "./pages/Landing";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Channels from './pages/Channels';
import Footer from "./components/Footer";

function App() {
  return (
    <>
      
      <main className="dark bg-background text-foreground min-h-screen flex flex-col bg-glow">
        {/* Gradient backgrounds should be full width */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/channels" element={<Channels />} />
          </Routes>
        </div>
        <Footer />
      </main>
    </>
  )
}

export default App
