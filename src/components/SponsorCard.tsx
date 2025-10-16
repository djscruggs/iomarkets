import { Sponsor } from '../types/dueDiligence'
import { Mail, Phone, Briefcase, DollarSign } from 'lucide-react'

interface SponsorCardProps {
  sponsor: Sponsor
}

export function SponsorCard({ sponsor }: SponsorCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(amount)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <img
          src={sponsor.photoUrl}
          alt={sponsor.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1">{sponsor.name}</h3>
          <div className="space-y-1">
            <a
              href={`mailto:${sponsor.email}`}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{sponsor.email}</span>
            </a>
            <a
              href={`tel:${sponsor.phone}`}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Phone className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{sponsor.phone}</span>
            </a>
            <a
              href={sponsor.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity"
              title="LinkedIn Profile"
            >
              <img
                src="/linkedin.png"
                alt="LinkedIn"
                className="w-3 h-3 flex-shrink-0"
              />
            </a>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-1 text-gray-600 mb-1">
            <Briefcase className="w-3 h-3" />
            <span className="text-xs font-medium">Total Deals</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{sponsor.totalDeals}</p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-gray-600 mb-1">
            <DollarSign className="w-3 h-3" />
            <span className="text-xs font-medium">Total Value</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(sponsor.totalValue)}
          </p>
        </div>
      </div>
    </div>
  )
}
