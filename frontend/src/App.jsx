import { Routes, Route, Links } from 'react-router-dom'
import LandingPage from "./pages/LandingPage";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      
      <main className="dark bg-background text-foreground min-h-screen flex flex-col bg-glow">
        {/* Gradient backgrounds should be full width */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </div>
        <Footer />
      </main>

      
      
    </>
  )
}

export default App
