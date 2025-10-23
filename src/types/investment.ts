export interface Investment {
  id: string;
  name: string;
  sponsor: string;
  targetRaise: number;
  amountRaised: number;
  imageUrl: string;
  type: "real-estate" | "private-equity" | "venture-capital";
  location?: string;
  minInvestment: number;
  projectedReturn: number;
  term: string;
  featured: boolean;
  description?: string;
}
