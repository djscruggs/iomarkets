import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/clerk-react'
import { Link } from 'react-router'

export default function Dashboard() {
  const { user } = useUser()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SignedOut>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please sign in to view the dashboard
          </h2>
          <SignInButton mode="modal">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 mb-8">
            Welcome back, {user?.firstName || user?.emailAddresses[0]?.emailAddress}!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Overview</h3>
              <p className="text-gray-600">View current market trends and insights</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Portfolio</h3>
              <p className="text-gray-600">Track your investments and performance</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600">Deep dive into market analytics</p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </SignedIn>
    </div>
  )
}
