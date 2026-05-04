export type UserRole = 'buyer' | 'seller' | 'advisor' | 'admin';
export type KYCStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type DealType = 'sell_100' | 'sell_equity' | 'fundraising';
export type DealStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'published' | 'negotiation' | 'closed';
export type DocumentCategory = 'financial' | 'legal' | 'hr' | 'contracts' | 'tech';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  userType: UserRole;
  country: string;
  kycStatus: KYCStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  ownerId: string;
  legalName: string;
  taxId: string;
  country: string;
  foundedYear: number;
  industry: string;
  products: string;
  targetMarket: string;
  ownershipStructure: {
    founderPct: number;
    investorPct: number;
    esopPct: number;
  };
  createdAt: string;
}

export interface Deal {
  id: string;
  sellerId: string;
  companyId: string;
  title: string;
  industry: string;
  location: string;
  dealType: DealType;
  status: DealStatus;
  financials: {
    revenue: number[]; // Last 3 years
    ebitda: number;
    netProfit: number;
    growthRate: number;
  };
  mandaInfo: {
    valuation: number;
    equityOffered: number;
    employeeCount?: number;
    foundedYear?: number;
  };
  strategy: {
    reasonForSale: string;
    futurePlans: string;
  };
  aiSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealDocument {
  id: string;
  dealId: string;
  category: DocumentCategory;
  name: string;
  url: string;
  size: number;
  type: string;
  ownerId: string;
  permissions: string[];
  createdAt: string;
}

export interface Offer {
  id: string;
  dealId: string;
  buyerId: string;
  amount: number;
  equity: number;
  status: 'pending' | 'countered' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Message {
  id: string;
  dealId: string;
  senderId: string;
  content: string;
  type: 'text' | 'file' | 'offer';
  createdAt: string;
}
