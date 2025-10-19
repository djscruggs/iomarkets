import { useState, useRef, useMemo } from 'react'
import { useParams, Navigate, Link, useLoaderData, LoaderFunctionArgs, MetaFunction } from 'react-router-dom'
import { ArrowLeft, FileText, Image as ImageIcon, Video, ChevronRight, ChevronDown } from 'lucide-react'
import { getInvestmentById, getSponsorsForInvestment, getAssetsForInvestment } from '../lib/queries'
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

// Asset Group Component
interface AssetGroupProps {
  title: string
  icon: React.ReactNode
  assets: DueDiligenceAsset[]
  isExpanded: boolean
  onToggle: () => void
  selectedAsset: DueDiligenceAsset | null
  onSelectAsset: (asset: DueDiligenceAsset) => void
}

function AssetGroup({ title, icon, assets, isExpanded, onToggle, selectedAsset, onSelectAsset }: AssetGroupProps) {
  if (assets.length === 0) return null

  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-gray-900">
            {title} ({assets.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-1 space-y-1 ml-2">
          {assets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => onSelectAsset(asset)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                selectedAsset?.id === asset.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
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
      )}
    </div>
  )
}

// Deal Sponsors Component
interface DealSponsorsProps {
  sponsors: Sponsor[]
  isExpanded: boolean
  onToggle: () => void
}

function DealSponsors({ sponsors, isExpanded, onToggle }: DealSponsorsProps) {
  return (
    <div className="mb-6">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-3 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Deal Sponsors ({sponsors.length})
        </h2>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {isExpanded && (
        <div className="space-y-3">
          {sponsors.map((sponsor) => (
            <SponsorCard key={sponsor.id} sponsor={sponsor} />
          ))}
        </div>
      )}
    </div>
  )
}

// Sidebar Component
interface SidebarProps {
  investmentId: string
  sponsors: Sponsor[]
  groupedAssets: {
    documents: DueDiligenceAsset[]
    photos: DueDiligenceAsset[]
    videos: DueDiligenceAsset[]
  }
  expandedSections: Record<string, boolean>
  selectedAsset: DueDiligenceAsset | null
  onToggleSection: (section: string) => void
  onSelectAsset: (asset: DueDiligenceAsset) => void
}

function Sidebar({ investmentId, sponsors, groupedAssets, expandedSections, selectedAsset, onToggleSection, onSelectAsset }: SidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        {/* Back button */}
        <Link
          to={`/investment/${investmentId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Deal Overview
        </Link>

        <DealSponsors
          sponsors={sponsors}
          isExpanded={expandedSections.sponsors}
          onToggle={() => onToggleSection('sponsors')}
        />

        {/* Due Diligence Documents Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
            Due Diligence Materials
          </h2>

          <AssetGroup
            title="Documents"
            icon={<FileText className="w-4 h-4 text-red-500" />}
            assets={groupedAssets.documents}
            isExpanded={expandedSections.documents}
            onToggle={() => onToggleSection('documents')}
            selectedAsset={selectedAsset}
            onSelectAsset={onSelectAsset}
          />

          <AssetGroup
            title="Photos"
            icon={<ImageIcon className="w-4 h-4 text-blue-500" />}
            assets={groupedAssets.photos}
            isExpanded={expandedSections.photos}
            onToggle={() => onToggleSection('photos')}
            selectedAsset={selectedAsset}
            onSelectAsset={onSelectAsset}
          />

          <AssetGroup
            title="Videos"
            icon={<Video className="w-4 h-4 text-purple-500" />}
            assets={groupedAssets.videos}
            isExpanded={expandedSections.videos}
            onToggle={() => onToggleSection('videos')}
            selectedAsset={selectedAsset}
            onSelectAsset={onSelectAsset}
          />
        </div>
      </div>
    </div>
  )
}

// Content Area Component
interface ContentAreaProps {
  selectedAsset: DueDiligenceAsset | null
  onAskAI: () => void
  aiChatRef: React.RefObject<HTMLDivElement>
}

function ContentArea({ selectedAsset, onAskAI, aiChatRef }: ContentAreaProps) {
  // When no asset is selected, show AI chat prominently
  if (!selectedAsset) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Empty state with AI chat */}
        <div className="flex-1 overflow-auto p-6 flex flex-col">
          <div className="flex-1 flex items-start justify-center pt-12 pb-6">
            <div className="text-center max-w-md">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium text-lg mb-2">Select a document to view</p>
              <p className="text-sm text-gray-500">
                Choose from the due diligence materials on the left, or ask AI about this investment below
              </p>
            </div>
          </div>

          {/* AI Chat - visible at bottom */}
          <div ref={aiChatRef} className="max-w-4xl mx-auto w-full pb-6">
            <AIChat autoFocus={true} startExpanded={true} />
          </div>
        </div>
      </div>
    )
  }

  // When asset is selected, show it with AI chat fixed at bottom
  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Asset viewer - scrollable area */}
      <div className="flex-1 overflow-auto p-6 pb-[200px]">
        <AssetViewer asset={selectedAsset} onAskAI={onAskAI} />
      </div>

      {/* AI Chat - fixed at bottom of content area */}
      <div ref={aiChatRef} className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-gray-50 p-4">
        <AIChat />
      </div>
    </div>
  )
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.investment) {
    return [
      { title: 'Due Diligence - IOMarkets' },
    ];
  }

  return [
    { title: `Due Diligence - ${data.investment.name} - IOMarkets` },
    { name: 'description', content: `Review due diligence materials, documents, and sponsor information for ${data.investment.name}.` },
  ];
};

export async function loader({ params }: LoaderFunctionArgs): Promise<DueDiligenceLoaderData> {
  const investment = params.id ? getInvestmentById(params.id) || null : null
  const sponsors = params.id ? getSponsorsForInvestment(params.id) : []
  const assets = params.id ? getAssetsForInvestment(params.id) : []

  return { investment, sponsors, assets }
}

export default function DueDiligence() {
  const { id } = useParams<{ id: string }>()
  const { investment, sponsors, assets } = useLoaderData() as DueDiligenceLoaderData
  const [selectedAsset, setSelectedAsset] = useState<DueDiligenceAsset | null>(null)
  const aiChatRef = useRef<HTMLDivElement>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sponsors: true,
    documents: false,
    photos: false,
    videos: false,
  })

  // Group assets by type
  const groupedAssets = useMemo(() => {
    const groups = {
      documents: assets.filter(a => a.type === 'pdf'),
      photos: assets.filter(a => a.type === 'image'),
      videos: assets.filter(a => a.type === 'video'),
    }
    return groups
  }, [assets])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleAskAI = () => {
    // Scroll AI chat into view and focus the input
    aiChatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    // Use a small delay to ensure the scroll completes before focusing
    setTimeout(() => {
      const input = aiChatRef.current?.querySelector('input')
      input?.focus()
    }, 300)
  }

  if (!investment || !id) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with deal info */}
      <DealHeader investment={investment} />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          investmentId={id}
          sponsors={sponsors}
          groupedAssets={groupedAssets}
          expandedSections={expandedSections}
          selectedAsset={selectedAsset}
          onToggleSection={toggleSection}
          onSelectAsset={setSelectedAsset}
        />

        <ContentArea
          selectedAsset={selectedAsset}
          onAskAI={handleAskAI}
          aiChatRef={aiChatRef}
        />
      </div>
    </div>
  )
}
