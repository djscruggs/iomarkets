export interface Investment {
  id: string;
  name: string;
  sponsor: string;
  targetRaise: number;
  amountRaised: number;
  imageUrl: string;
  type: "real-estate" | "private-equity";
  location?: string;
  minInvestment: number;
  projectedReturn: number;
  term: string;
  featured: boolean;
}
