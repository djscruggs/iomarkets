import { Investment } from '../types/investment'
import { DollarSign, TrendingUp, Calendar } from 'lucide-react'

interface DealHeaderProps {
  investment: Investment
}

export function DealHeader({ investment }: DealHeaderProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-4">
        {/* Small photo */}
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={investment.imageUrl}
            alt={investment.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Deal info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">
            {investment.name}
          </h1>
          <p className="text-sm text-gray-600">{investment.sponsor}</p>
        </div>

        {/* Key metrics */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="text-center">
            <div className="flex items-center gap-1 text-gray-600 mb-1">
              <DollarSign className="w-3 h-3" />
              <span className="text-xs font-medium">Target</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(investment.targetRaise)}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-1 text-gray-600 mb-1">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-medium">IRR</span>
            </div>
            <p className="text-sm font-semibold text-green-600">
              {investment.projectedReturn}%
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-1 text-gray-600 mb-1">
              <Calendar className="w-3 h-3" />
              <span className="text-xs font-medium">Term</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {investment.term}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-1 text-gray-600 mb-1">
              <DollarSign className="w-3 h-3" />
              <span className="text-xs font-medium">Min Investment</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(investment.minInvestment)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
