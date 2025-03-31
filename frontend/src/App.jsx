import { Routes, Route } from 'react-router-dom'
import LandingPage from "./pages/Landing";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from './pages/Dashboard';
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

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
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
        <Footer />
      </main>
    </>
  )
}

export default App
