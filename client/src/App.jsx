import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 rounded-xl p-8 shadow-2xl border border-slate-700 text-center">
        <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Vite + React + Tailwind v4
        </h1>
        <p className="text-slate-400 mb-6">
          Tailwind CSS v4 is successfully configured and running with Vite!
        </p>
        <button
          onClick={() => setCount((c) => c + 1)}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 font-semibold rounded-lg shadow-md transition duration-200 ease-in-out transform hover:-translate-y-0.5"
        >
          Count is {count}
        </button>
      </div>
    </div>
  )
}

export default App
