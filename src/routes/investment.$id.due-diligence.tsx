import { useState } from 'react'
import { useParams, Navigate, Link, useLoaderData, LoaderFunctionArgs } from 'react-router-dom'
import { ArrowLeft, FileText, Image as ImageIcon, Video } from 'lucide-react'
import { mockInvestments } from '../data/mockInvestments'
import { getSponsorsForInvestment, getAssetsForInvestment } from '../data/mockDueDiligence'
import { DueDiligenceAsset, Sponsor } from '../types/dueDiligence'
import { DealHeader } from '../components/DealHeader'
import { SponsorCard } from '../components/SponsorCard'
import { AssetViewer } from '../components/AssetViewer'
import { AIChat } from '../components/AIChat'
import { Investment } from '../types/investment'

interface DueDiligenceLoaderData {
  investment: Investment | null
  sponsors: Sponsor[]
  assets: DueDiligenceAsset[]
}

export async function loader({ params }: LoaderFunctionArgs): Promise<DueDiligenceLoaderData> {
  const investment = mockInvestments.find((inv) => inv.id === params.id) || null
  const sponsors = params.id ? getSponsorsForInvestment(params.id) : []
  const assets = params.id ? getAssetsForInvestment(params.id) : []

  return { investment, sponsors, assets }
}

export default function DueDiligence() {
  const { id } = useParams<{ id: string }>()
  const { investment, sponsors, assets } = useLoaderData() as DueDiligenceLoaderData
  const [selectedAsset, setSelectedAsset] = useState<DueDiligenceAsset | null>(null)

  if (!investment || !id) {
    return <Navigate to="/" replace />
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />
      case 'image':
        return <ImageIcon className="w-4 h-4 text-blue-500" />
      case 'video':
        return <Video className="w-4 h-4 text-purple-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with deal info */}
      <DealHeader investment={investment} />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            {/* Back button */}
            <Link
              to={`/investment/${id}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Deal Overview
            </Link>

            {/* Deal Sponsors Section */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Deal Sponsors
              </h2>
              <div className="space-y-3">
                {sponsors.map((sponsor) => (
                  <SponsorCard key={sponsor.id} sponsor={sponsor} />
                ))}
              </div>
            </div>

            {/* Due Diligence Documents Section */}
            <div>
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Due Diligence Materials
              </h2>
              <div className="space-y-1">
                {assets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      selectedAsset?.id === asset.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getAssetIcon(asset.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {asset.name}
                        </p>
                        <p className="text-xs text-gray-500">{asset.size}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Asset viewer */}
          <div className="flex-1 p-6 overflow-auto">
            <AssetViewer asset={selectedAsset} />
          </div>

          {/* AI Chat - fixed at bottom */}
          <div className="p-6 pt-0">
            <AIChat />
          </div>
        </div>
      </div>
    </div>
  )
}
