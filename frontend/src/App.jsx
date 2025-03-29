import { Routes, Route, Links } from 'react-router-dom'
import LandingPage from "./pages/Landing";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
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
            {/* Add other routes here */}
            <Route path="/login" element={<Login />} />
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
            {/* <Route path="/profile" element={<Profile />} /> */}
            {/* <Route path="/settings" element={<Settings />} /> */}
          </Routes>
        </div>
        <Footer />
      </main>

      
      
    </>
  )
}

export default App
