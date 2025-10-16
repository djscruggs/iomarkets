export interface Sponsor {
  id: string
  name: string
  email: string
  phone: string
  linkedInUrl: string
  photoUrl: string
  totalDeals: number
  totalValue: number
}

export type AssetType = 'pdf' | 'image' | 'video'

export interface DueDiligenceAsset {
  id: string
  name: string
  type: AssetType
  url: string
  thumbnailUrl?: string
  uploadedDate: string
  size?: string
}
