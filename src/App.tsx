import { Routes, Route, useNavigate } from 'react-router'
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import InvestmentDetail from './pages/InvestmentDetail'
import DueDiligence from './pages/DueDiligence'

function App() {
  const navigate = useNavigate()
  const { isSignedIn, isLoaded } = useAuth()

  // Handle redirect after login (Steps 3, 4, 5)
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Step 3: Check for existence of redirectAfterLogin
      const redirectUrl = localStorage.getItem('redirectAfterLogin')

      if (redirectUrl) {
        // Step 5: Delete from storage
        localStorage.removeItem('redirectAfterLogin')

        // Step 4: Set location to that url
        navigate(redirectUrl)
      }
    }
  }, [isLoaded, isSignedIn, navigate])

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">IO Markets</h1>
            <div>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/investment/:id" element={<InvestmentDetail />} />
          <Route path="/investment/:id/due-diligence" element={<DueDiligence />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
