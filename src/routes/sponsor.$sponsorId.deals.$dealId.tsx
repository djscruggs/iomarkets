import { useParams, useNavigate, useLoaderData, LoaderFunctionArgs } from 'react-router-dom'
import { ExternalLink, ArrowLeft } from 'lucide-react'

interface DealPayoutsLoaderData {
  dealIndex: number
  sponsorId: string
  dealId: string
}

export async function loader({ params }: LoaderFunctionArgs): Promise<DealPayoutsLoaderData> {
  const dealIndex = parseInt(params.dealId?.split('-').pop() || '0')
  return {
    dealIndex,
    sponsorId: params.sponsorId || '',
    dealId: params.dealId || ''
  }
}

export default function DealPayouts() {
  const { sponsorId, dealId, dealIndex } = useLoaderData() as DealPayoutsLoaderData
  const navigate = useNavigate()

  // Mock deal data - in real app this would come from the deal
  const dealTypes = ['real-estate', 'private-equity'] as const
  const realEstateTypes = [
    'Mixed-Use Development',
    'Residential Tower',
    'Office Complex',
    'Retail Center',
    'Industrial Park',
    'Apartment Complex',
    'Hotel & Resort',
    'Student Housing'
  ]
  const privateEquityTypes = [
    'SaaS Growth Fund',
    'Healthcare Innovation Portfolio',
    'Manufacturing Acquisition',
    'E-commerce Platform',
    'Fintech Expansion',
    'AI/ML Technology',
    'Consumer Brands Portfolio',
    'Clean Energy Ventures'
  ]
  const locations = [
    'Austin, TX', 'Miami, FL', 'Denver, CO', 'Seattle, WA', 'Boston, MA',
    'Nashville, TN', 'Portland, OR', 'Atlanta, GA', 'Phoenix, AZ', 'Charlotte, NC'
  ]
  const terms = ['3 years', '4 years', '5 years', '7 years', '10 years']

  const type = dealTypes[dealIndex % 2]
  const isRealEstate = type === 'real-estate'
  const dealName = isRealEstate
    ? `${locations[dealIndex % locations.length].split(',')[0]} ${realEstateTypes[dealIndex % realEstateTypes.length]}`
    : `${privateEquityTypes[dealIndex % privateEquityTypes.length]} ${Math.floor(dealIndex / privateEquityTypes.length) + 1}`

  const realEstateImages = [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1565402170291-8491f14678db?w=800&auto=format&fit=crop'
  ]
  const privateEquityImages = [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&auto=format&fit=crop'
  ]

  const imageArray = isRealEstate ? realEstateImages : privateEquityImages
  const imageUrl = imageArray[dealIndex % imageArray.length]

  // Use seeded random to ensure consistent values for the same deal
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  const targetRaise = (Math.floor(seededRandom(dealIndex * 1000) * 20) + 5) * 1000000
  const projectedReturn = parseFloat((seededRandom(dealIndex * 2000) * 15 + 12).toFixed(1))
  const term = terms[dealIndex % terms.length]
  const termYears = parseInt(term.split(' ')[0])
  const totalMonths = termYears * 12

  // Generate mock Algorand asset ID that looks random
  // Use dealIndex to seed a deterministic but random-looking number
  const generateAssetId = (seed: number) => {
    const base = 31415926 // Start with a more random-looking base
    const multiplier = 271828
    return (base + (seed * multiplier)) % 999999999
  }
  const assetId = generateAssetId(dealIndex)

  // Calculate monthly distribution with randomization
  const investmentAmount = targetRaise // Total equity raised for the deal
  const annualReturnAmount = investmentAmount * (projectedReturn / 100) // Return per year
  const avgMonthlyDistribution = annualReturnAmount / 12 // Average per month

  // Generate payment history with randomized amounts
  const generatePayments = () => {
    const payments = []
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - totalMonths + 1) // Start from term beginning

    // Create a seeded random number generator for consistency
    const seededRandomFn = (seed: number) => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }

    // Generate random amounts - each year should sum to the annual return
    const amounts: number[] = []

    for (let year = 0; year < termYears; year++) {
      let yearTotal = 0
      const yearAmounts: number[] = []

      // Generate 11 random payments for this year
      for (let month = 0; month < 11; month++) {
        const monthIndex = year * 12 + month

        // Use half a standard deviation (std dev = avgMonthlyDistribution * 0.15)
        const stdDev = avgMonthlyDistribution * 0.15
        const halfStdDev = stdDev * 0.5

        // Generate random variation using seeded random
        const randomFactor = (seededRandomFn(dealIndex * 100 + monthIndex) - 0.5) * 2 // -1 to 1
        const variation = randomFactor * halfStdDev

        const amount = avgMonthlyDistribution + variation
        yearAmounts.push(amount)
        yearTotal += amount
      }

      // 12th payment of the year adjusts to hit exactly the annual return
      const finalAmount = annualReturnAmount - yearTotal
      yearAmounts.push(finalAmount)

      amounts.push(...yearAmounts)
    }

    // Generate payment records
    for (let i = 0; i < totalMonths; i++) {
      const paymentDate = new Date(startDate)
      paymentDate.setMonth(paymentDate.getMonth() + i)

      // Generate mock transaction hash
      const txHash = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`.toUpperCase().substring(0, 52)

      const amount = amounts[i]
      const percentReturn = (amount / investmentAmount) * 100

      payments.push({
        month: i + 1,
        date: paymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount,
        percentReturn,
        txHash,
        assetId
      })
    }

    return payments.reverse() // Most recent first
  }

  const payments = generatePayments()
  const totalDistributed = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalReturnPercent = (totalDistributed / investmentAmount) * 100 // Total return over entire term
  const avgAnnualReturnPercent = totalReturnPercent / termYears // Average per year
  const avgMonthlyReturnPercent = projectedReturn / 12 // Average per month based on annual IRR

  const formatCurrency = (amount: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(`/sponsor/${sponsorId}/deals`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sponsor Deals</span>
        </button>

        {/* Asset Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-6">
            {/* Thumbnail */}
            <img
              src={imageUrl}
              alt={dealName}
              className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
            />

            {/* Asset Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{dealName}</h1>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">Asset Type:</span>
                  <span className="text-gray-600">{isRealEstate ? 'Real Estate' : 'Private Equity'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">Total Equity:</span>
                  <span className="text-gray-900 font-semibold">{formatCurrency(investmentAmount, 0)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">Term:</span>
                  <span className="text-gray-600">{term} ({totalMonths} months)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">Realized IRR:</span>
                  <span className="text-green-600 font-semibold">{projectedReturn}%</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">Avg Monthly Distribution:</span>
                  <span className="text-green-600 font-semibold">{avgMonthlyReturnPercent.toFixed(3)}%</span>
                </div>
              </div>
            </div>

            {/* Algorand Asset Info */}
            <div className="bg-gray-50 rounded-lg p-4 flex-shrink-0">
              <div className="text-sm text-gray-600 mb-1">Algorand Asset ID</div>
              <div className="text-2xl font-bold text-gray-900 mb-3">{assetId}</div>
              <a
                href={`https://explorer.perawallet.app/asset/${assetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on Pera Explorer</span>
              </a>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Payment Token</div>
                <div className="font-semibold text-gray-900">USDC</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">LP Distribution History</h2>
            <p className="text-sm text-gray-600 mt-1">
              All payments made in USDC on the Algorand blockchain
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (USDC)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Month {payment.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payment.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      LP Distribution
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 text-right">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                      {payment.percentReturn.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <a
                        href={`https://explorer.perawallet.app/tx/${payment.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                        title={payment.txHash}
                      >
                        <span className="font-mono text-xs">
                          {payment.txHash.substring(0, 8)}...{payment.txHash.substring(payment.txHash.length - 6)}
                        </span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-sm font-bold text-gray-900">
                    Total Distributions
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600 text-right">
                    {formatCurrency(totalDistributed)}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                    {totalReturnPercent.toFixed(2)}%
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
