

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum Condition {
  DM = 'DM', // Display Message
  DDM = 'DDM', // Deep Display Message? (Assuming context)
  BM = 'BM', // Battery Message?
  CM = 'CM', // Camera Message?
  OFF_ID = 'OffID', // Face ID Off?
  BACK_CRACK = 'backcrack',
  SCREEN_CRACK = 'screencrack',
  CLEAN = 'Clean' // Fallback for standard used
}

export type Region = 'New' | 'Used' | 'UK' | 'Dubai' | 'China' | 'Korea';
export type SimStatus = 'Physical Sim' | 'E-Sim' | 'Dual Sim' | 'No Sim';

export type ListingType = 'supply' | 'demand';

export type ProductCategory = 'iPhone';

export interface Offer {
  id: string;
  amount: number;
  bidderId: string;
  bidderName: string;
  timestamp: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  location: string;
  state: string;
  country: string;
  isVerified: boolean;
  email?: string;
  avatarUrl?: string;
}

export interface Listing {
  id: string;
  type: ListingType; // supply (selling) or demand (buying)
  category: ProductCategory;
  isQuickSale: boolean; // true if dealer wants to cashout quick
  allowOffers: boolean; // entertain offers
  model: string; 
  brand: string; 
  storage: string; 
  condition: Condition[]; // Changed to array for multiple conditions
  region: Region; 
  simStatus: SimStatus;
  price: number;
  currency: string;
  batteryHealth: number; 
  color: string;
  description: string;
  images: string[]; // Still used for thumbnails if video fails
  videoUrl?: string; // Main media
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerVerified: boolean;
  location: string;
  createdAt: number;
  status: 'active' | 'sold' | 'pending';
  offers?: Offer[]; // Only visible to seller and specific buyer
}

export interface ChatMessage {
  id: string;
  text?: string;
  imageUrl?: string;
  stickerUrl?: string;
  audioUrl?: string;
  senderId: string;
  timestamp: number;
  isSystem?: boolean;
  type?: 'text' | 'image' | 'sticker' | 'call_log' | 'offer' | 'audio';
  offerAmount?: number;
  offerStatus?: 'pending' | 'accepted' | 'rejected';
}

export interface ChatSession {
  id: string;
  listingId: string;
  listingModel: string;
  buyerId: string;
  sellerId: string;
  lastMessage: string;
  lastUpdated: number;
  unreadCount: number;
}
