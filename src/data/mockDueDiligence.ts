import { Sponsor, DueDiligenceAsset } from '../types/dueDiligence'

export const mockSponsors: Record<string, Sponsor[]> = {
  '1': [
    {
      id: 's1',
      name: 'Michael Rodriguez',
      email: 'mrodriguez@urbancapital.com',
      phone: '+1 (512) 555-0123',
      linkedInUrl: 'https://linkedin.com/in/michael-rodriguez',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop',
      totalDeals: 23,
      totalValue: 450000000
    },
    {
      id: 's2',
      name: 'Sarah Chen',
      email: 'schen@urbancapital.com',
      phone: '+1 (512) 555-0124',
      linkedInUrl: 'https://linkedin.com/in/sarah-chen',
      photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop',
      totalDeals: 18,
      totalValue: 320000000
    },
    {
      id: 's4',
      name: 'James Thompson',
      email: 'jthompson@urbancapital.com',
      phone: '+1 (512) 555-0125',
      linkedInUrl: 'https://linkedin.com/in/james-thompson',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop',
      totalDeals: 27,
      totalValue: 580000000
    },
    {
      id: 's5',
      name: 'Emily Martinez',
      email: 'emartinez@urbancapital.com',
      phone: '+1 (512) 555-0126',
      linkedInUrl: 'https://linkedin.com/in/emily-martinez',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop',
      totalDeals: 21,
      totalValue: 410000000
    }
  ],
  '2': [
    {
      id: 's3',
      name: 'David Park',
      email: 'dpark@techventures.com',
      phone: '+1 (650) 555-0200',
      linkedInUrl: 'https://linkedin.com/in/david-park',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop',
      totalDeals: 31,
      totalValue: 890000000
    }
  ]
}

export const mockDueDiligenceAssets: Record<string, DueDiligenceAsset[]> = {
  '1': [
    {
      id: 'a1',
      name: 'Investment Memorandum',
      type: 'pdf',
      url: 'https://example.com/memo.pdf',
      uploadedDate: '2024-01-15',
      size: '2.4 MB'
    },
    {
      id: 'a2',
      name: 'Financial Projections',
      type: 'pdf',
      url: 'https://example.com/projections.pdf',
      uploadedDate: '2024-01-20',
      size: '1.8 MB'
    },
    {
      id: 'a3',
      name: 'Property Survey',
      type: 'pdf',
      url: 'https://example.com/survey.pdf',
      uploadedDate: '2024-01-22',
      size: '5.2 MB'
    },
    {
      id: 'a4',
      name: 'Site Photos - Exterior',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&auto=format&fit=crop',
      uploadedDate: '2024-01-25',
      size: '3.1 MB'
    },
    {
      id: 'a5',
      name: 'Site Photos - Interior',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&auto=format&fit=crop',
      uploadedDate: '2024-01-25',
      size: '2.8 MB'
    },
    {
      id: 'a6',
      name: 'Property Walkthrough Video',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=5ZDBnjgQCtA',
      thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&auto=format&fit=crop',
      uploadedDate: '2024-01-28',
      size: '45 MB'
    },
    {
      id: 'a7',
      name: 'Market Analysis Report',
      type: 'pdf',
      url: 'https://example.com/market-analysis.pdf',
      uploadedDate: '2024-02-01',
      size: '3.6 MB'
    },
    {
      id: 'a8',
      name: 'Legal Documents',
      type: 'pdf',
      url: 'https://example.com/legal.pdf',
      uploadedDate: '2024-02-03',
      size: '4.2 MB'
    }
  ],
  '2': [
    {
      id: 'a9',
      name: 'Investment Thesis',
      type: 'pdf',
      url: 'https://example.com/thesis.pdf',
      uploadedDate: '2024-01-10',
      size: '1.9 MB'
    },
    {
      id: 'a10',
      name: 'Company Financials',
      type: 'pdf',
      url: 'https://example.com/financials.pdf',
      uploadedDate: '2024-01-12',
      size: '2.1 MB'
    },
    {
      id: 'a11',
      name: 'Pitch Deck',
      type: 'pdf',
      url: 'https://example.com/deck.pdf',
      uploadedDate: '2024-01-18',
      size: '8.5 MB'
    }
  ]
}

// Default fallback data for investments without specific mock data
export const getSponsorsForInvestment = (investmentId: string): Sponsor[] => {
  // If investment has specific sponsors, return them
  if (mockSponsors[investmentId]) {
    return mockSponsors[investmentId]
  }

  // Otherwise, return one of the existing sponsors as fallback (cycle through them)
  const sponsorKeys = Object.keys(mockSponsors)
  const fallbackKey = sponsorKeys[parseInt(investmentId) % sponsorKeys.length] || '1'
  return mockSponsors[fallbackKey]
}

export const getAssetsForInvestment = (investmentId: string): DueDiligenceAsset[] => {
  return mockDueDiligenceAssets[investmentId] || [
    {
      id: 'default-asset',
      name: 'Investment Overview',
      type: 'pdf',
      url: 'https://example.com/overview.pdf',
      uploadedDate: '2024-01-01',
      size: '1.5 MB'
    }
  ]
}
