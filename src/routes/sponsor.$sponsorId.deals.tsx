import { useParams, useNavigate, useLoaderData, LoaderFunctionArgs } from 'react-router-dom'
import { mockSponsors } from '../data/mockDueDiligence'
import { mockInvestments } from '../data/mockInvestments'
import { Mail, Phone, Briefcase, DollarSign, ExternalLink } from 'lucide-react'
import { Sponsor } from '../types/dueDiligence'

interface SponsorDealsLoaderData {
  sponsor: Sponsor | null
}

export async function loader({ params }: LoaderFunctionArgs): Promise<SponsorDealsLoaderData> {
  // Find sponsor across all investment sponsor lists
  let sponsor: Sponsor | null = null
  for (const investmentId in mockSponsors) {
    const sponsorList = mockSponsors[investmentId]
    const found = sponsorList.find(s => s.id === params.sponsorId)
    if (found) {
      sponsor = found
      break
    }
  }
  return { sponsor }
}

export default function SponsorDeals() {
  const { sponsorId } = useParams<{ sponsorId: string }>()
  const { sponsor } = useLoaderData() as SponsorDealsLoaderData
  const navigate = useNavigate()

  if (!sponsor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sponsor Not Found</h1>
          <p className="text-gray-600">The sponsor you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(amount)
  }

  const formatFullCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get current date for background check
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  // Generate deals based on sponsor's totalDeals count
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

  // Real Unsplash image IDs for variety
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

  const generateDeals = (count: number) => {
    const deals = []
    for (let i = 0; i < count; i++) {
      const type = dealTypes[i % 2]
      const isRealEstate = type === 'real-estate'

      const dealName = isRealEstate
        ? `${locations[i % locations.length].split(',')[0]} ${realEstateTypes[i % realEstateTypes.length]}`
        : `${privateEquityTypes[i % privateEquityTypes.length]} ${Math.floor(i / privateEquityTypes.length) + 1}`

      const targetRaise = (Math.floor(Math.random() * 20) + 5) * 1000000 // $5M-$25M
      const projectedReturn = (Math.random() * 15 + 12).toFixed(1) // 12%-27%

      const imageArray = isRealEstate ? realEstateImages : privateEquityImages

      deals.push({
        id: `${sponsor.id}-deal-${i}`,
        name: dealName,
        sponsor: sponsor.name,
        targetRaise,
        amountRaised: targetRaise * 0.75,
        imageUrl: imageArray[i % imageArray.length],
        type,
        location: isRealEstate ? locations[i % locations.length] : undefined,
        minInvestment: targetRaise * 0.01,
        projectedReturn: parseFloat(projectedReturn),
        term: terms[i % terms.length]
      })
    }
    return deals
  }

  const sponsorDeals = generateDeals(sponsor.totalDeals)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Sponsor Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            {/* Left Side - Sponsor Details */}
            <div className="flex items-start gap-4">
              <img
                src={sponsor.photoUrl}
                alt={sponsor.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">{sponsor.name}</h1>
                <div className="space-y-2">
                  <a
                    href={`mailto:${sponsor.email}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{sponsor.email}</span>
                  </a>
                  <a
                    href={`tel:${sponsor.phone}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{sponsor.phone}</span>
                  </a>
                  <a
                    href={sponsor.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
                  >
                    <img src="/linkedin.png" alt="LinkedIn" className="w-4 h-4" />
                    <span className="text-gray-600">LinkedIn Profile</span>
                  </a>
                </div>
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">{sponsor.totalDeals}</span> Total Deals
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">{formatCurrency(sponsor.totalValue)}</span> Total Value
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Links */}
            <div className="flex flex-col gap-2">
              <a
                href="#"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm font-medium">Background Check as of {currentDate}</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm font-medium">Investor Endorsements</span>
              </a>
            </div>
          </div>
        </div>

        {/* Deals Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Deals Portfolio</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {sponsorDeals.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No deals found for this sponsor
              </div>
            ) : (
              sponsorDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/sponsor/${sponsorId}/deals/${deal.id}`)}
                >
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <img
                      src={deal.imageUrl}
                      alt={deal.name}
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                    />

                    {/* Deal Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {deal.name}
                      </h3>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span>
                          <span className="font-medium text-gray-700">Type:</span>{' '}
                          {deal.type === 'real-estate' ? 'Real Estate' : 'Private Equity'}
                        </span>
                        {deal.location && (
                          <span>
                            <span className="font-medium text-gray-700">Location:</span>{' '}
                            {deal.location}
                          </span>
                        )}
                        <span>
                          <span className="font-medium text-gray-700">Term:</span>{' '}
                          {deal.term}
                        </span>
                      </div>
                    </div>

                    {/* Size/Amount */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatFullCurrency(deal.targetRaise)}
                      </div>
                      <div className="text-sm text-gray-500">Target Raise</div>
                      <div className="text-sm text-green-600 font-medium mt-1">
                        {deal.projectedReturn}% IRR
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
