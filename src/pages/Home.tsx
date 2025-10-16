import { Link } from 'react-router'
import { SignedIn, SignedOut } from '@clerk/clerk-react'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to IO Markets
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your platform for market insights and analysis
        </p>

        <SignedOut>
          <p className="text-gray-500">Please sign in to access the dashboard</p>
        </SignedOut>

        <SignedIn>
          <Link
            to="/dashboard"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </SignedIn>
      </div>
    </div>
  )
}
