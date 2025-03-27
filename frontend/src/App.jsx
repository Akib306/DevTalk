import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>Welcome to DevTalk 💬</h1>
            <p>A channel-based Q&A tool for programmers, powered by React and Node.js.</p>
            <p>Register or log in to ask questions, get help, and contribute.</p>
        </div>
    </>
  )
}

export default App
