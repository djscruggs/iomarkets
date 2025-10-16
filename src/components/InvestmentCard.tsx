import { Link } from 'react-router'
import { Investment } from '../types/investment'

interface InvestmentCardProps {
  investment: Investment
}

export function InvestmentCard({ investment }: InvestmentCardProps) {
  const percentRaised = (investment.amountRaised / investment.targetRaise) * 100

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Link
      to={`/investment/${investment.id}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-200">
        <img
          src={investment.imageUrl}
          alt={investment.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
          {investment.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3">{investment.sponsor}</p>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Target Raise:</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(investment.targetRaise)}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(percentRaised, 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{formatCurrency(investment.amountRaised)} raised</span>
            <span>{percentRaised.toFixed(0)}%</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-600">
            {investment.type === 'real-estate' ? 'Real Estate' : 'Private Equity'}
          </span>
          <span className="text-green-600 font-medium">
            {investment.projectedReturn}% IRR
          </span>
        </div>
      </div>
    </Link>
  )
}
