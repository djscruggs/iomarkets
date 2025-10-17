import { Routes, Route, useNavigate } from 'react-router'
import { useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { Layout } from './components/layouts/Main'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import InvestmentDetail from './pages/InvestmentDetail'
import DueDiligence from './pages/DueDiligence'
import SponsorDeals from './pages/SponsorDeals'
import DealPayouts from './pages/DealPayouts'

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
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/investment/:id" element={<InvestmentDetail />} />
        <Route path="/investment/:id/due-diligence" element={<DueDiligence />} />
        <Route path="/sponsor/:sponsorId/deals" element={<SponsorDeals />} />
        <Route path="/sponsor/:sponsorId/deals/:dealId" element={<DealPayouts />} />
      </Routes>
    </Layout>
  )
}

export default App
