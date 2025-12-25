import { Listing, User, UserRole, Condition, ChatSession, ChatMessage, Region, SimStatus, ProductCategory } from '../types';
import { LISTING_IMAGES, LISTING_VIDEOS, MOCK_USER, ALL_MODELS, MODELS_BY_CATEGORY } from '../constants';

// --- MOCK DATABASE STATE ---
const conditions = [Condition.DM, Condition.DDM, Condition.BM, Condition.CM, Condition.OFF_ID, Condition.BACK_CRACK, Condition.SCREEN_CRACK, Condition.CLEAN];

let listings: Listing[] = Array.from({ length: 30 }).map((_, i) => {
  const isDemand = i % 4 === 0; 
  const isQuickSale = !isDemand && i % 5 === 0;
  
  const category: ProductCategory = 'iPhone';
  const models = MODELS_BY_CATEGORY[category];
  const model = models[i % models.length];

  // Randomly assign 1 or 2 conditions
  const hasMultipleConditions = i % 3 === 0;
  const itemConditions = hasMultipleConditions 
    ? [conditions[i % conditions.length], conditions[(i + 1) % conditions.length]]
    : [conditions[i % conditions.length]];

  return {
    id: `lst_${i}`,
    type: isDemand ? 'demand' : 'supply',
    category,
    isQuickSale: isQuickSale,
    allowOffers: isQuickSale || isDemand,
    brand: 'Apple',
    model: model,
    storage: i % 2 === 0 ? '128GB' : '256GB',
    condition: itemConditions,
    region: (['UK', 'Dubai', 'China', 'New', 'Used'] as Region[])[i % 5],
    simStatus: (['Physical Sim', 'E-Sim', 'Dual Sim'] as SimStatus[])[i % 3],
    price: isDemand ? 0 : 350000 + (i * 10000), 
    currency: '₦',
    batteryHealth: 80 + (i % 20),
    color: i % 2 === 0 ? 'Graphite' : 'Silver',
    description: isDemand 
      ? `I urgently need a clean ${model}. Please contact if available.` 
      : `Selling ${model}. Condition: ${itemConditions.join(', ')}.`,
    images: isDemand ? [] : [LISTING_IMAGES[i % 3]],
    videoUrl: !isDemand ? LISTING_VIDEOS[i % 3] : undefined,
    sellerId: i < 5 ? MOCK_USER.id : 'seller_2',
    sellerName: i < 5 ? MOCK_USER.name : 'Emeka Phones Ltd',
    sellerPhone: '+234 811 000 0000',
    sellerVerified: true,
    location: 'Ikeja, Lagos',
    createdAt: Date.now() - (i * 10000000),
    status: 'active',
    offers: []
  };
});

let chats: ChatSession[] = [
  {
    id: 'chat_1',
    listingId: 'lst_1',
    listingModel: 'iPhone 15 Pro',
    buyerId: 'buyer_1',
    sellerId: MOCK_USER.id,
    lastMessage: 'Is this still available?',
    lastUpdated: Date.now() - 50000,
    unreadCount: 2
  }
];

let messages: Record<string, ChatMessage[]> = {
  'chat_1': [
    { id: 'm1', text: 'Hello, I saw your iPhone 15 Pro.', senderId: 'buyer_1', timestamp: Date.now() - 100000, type: 'text' },
    { id: 'm2', text: 'Is this still available?', senderId: 'buyer_1', timestamp: Date.now() - 90000, type: 'text' }
  ]
};

// --- SERVICE METHODS ---

export interface FilterOptions {
  category?: ProductCategory | 'All';
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc';
  conditions?: Condition[];
  regions?: Region[];
  storage?: string[];
}

export const getListings = async (
  query?: string, 
  tab: 'supply' | 'demand' | 'quicksale' = 'supply',
  filters?: FilterOptions
): Promise<Listing[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let result = listings.filter(l => l.status === 'active');
      
      // Tab Filtering
      if (tab === 'quicksale') {
        // Quick sales ONLY
        result = result.filter(l => l.isQuickSale && l.type === 'supply');
      } else if (tab === 'demand') {
        // Demand ONLY
        result = result.filter(l => l.type === 'demand');
      } else {
        // Supply Tab: Regular supply ONLY (No quick sales)
        result = result.filter(l => l.type === 'supply' && !l.isQuickSale);
      }

      // Search Filter
      if (query) {
        const lower = query.toLowerCase();
        result = result.filter(l => 
          l.model.toLowerCase().includes(lower) || 
          l.location.toLowerCase().includes(lower)
        );
      }

      // Advanced Filters
      if (filters) {
        if (filters.minPrice !== undefined) {
          result = result.filter(l => l.price >= filters.minPrice!);
        }
        if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
          result = result.filter(l => l.price <= filters.maxPrice!);
        }
        
        // Condition Filter (Array overlap logic)
        if (filters.conditions && filters.conditions.length > 0) {
          result = result.filter(l => 
            // Check if ANY of the listing's conditions match ANY of the selected filter conditions
            l.condition.some(c => filters.conditions?.includes(c))
          );
        }

        // Region Filter
        if (filters.regions && filters.regions.length > 0) {
          result = result.filter(l => filters.regions?.includes(l.region));
        }

        // Storage Filter
        if (filters.storage && filters.storage.length > 0) {
          result = result.filter(l => filters.storage?.includes(l.storage));
        }
        
        // Sort
        if (filters.sortBy) {
          if (filters.sortBy === 'newest') {
            result.sort((a, b) => b.createdAt - a.createdAt);
          } else if (filters.sortBy === 'price_asc') {
            result.sort((a, b) => a.price - b.price);
          } else if (filters.sortBy === 'price_desc') {
            result.sort((a, b) => b.price - a.price);
          }
        }
      }

      resolve(result);
    }, 400);
  });
};

export const deleteListing = async (id: string): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      listings = listings.filter(l => l.id !== id);
      resolve(true);
    }, 500);
  });
};

export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  if (!query) return [];
  return new Promise((resolve) => {
    const lower = query.toLowerCase();
    const matches = ALL_MODELS.filter(m => m.toLowerCase().includes(lower));
    resolve(matches.slice(0, 5));
  });
};

export const getListingById = async (id: string): Promise<Listing | undefined> => {
  return new Promise(resolve => setTimeout(() => resolve(listings.find(l => l.id === id)), 300));
};

export const createListing = async (listingData: Partial<Listing>): Promise<Listing> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Ensure condition is always an array
      const conditions = Array.isArray(listingData.condition) 
        ? listingData.condition 
        : [listingData.condition || Condition.CLEAN];

      const newListing: Listing = {
        id: `lst_${Date.now()}`,
        type: listingData.type || 'supply',
        category: 'iPhone',
        isQuickSale: listingData.isQuickSale || false,
        allowOffers: listingData.allowOffers || false,
        brand: 'Apple',
        model: listingData.model || 'Unknown Model',
        storage: listingData.storage || '128GB',
        condition: conditions,
        region: listingData.region || 'UK',
        simStatus: listingData.simStatus || 'Physical Sim',
        price: listingData.price || 0,
        currency: '₦',
        batteryHealth: listingData.batteryHealth || 100,
        color: listingData.color || 'Black',
        description: listingData.description || '',
        images: listingData.images || [],
        videoUrl: listingData.videoUrl,
        sellerId: MOCK_USER.id,
        sellerName: MOCK_USER.name,
        sellerPhone: MOCK_USER.phone,
        sellerVerified: MOCK_USER.isVerified,
        location: MOCK_USER.location,
        createdAt: Date.now(),
        status: 'active',
        offers: []
      };
      listings = [newListing, ...listings];
      resolve(newListing);
    }, 800);
  });
};

export const getChats = async (): Promise<ChatSession[]> => {
  return new Promise(resolve => setTimeout(() => resolve(chats), 400));
};

export const getMessages = async (chatId: string): Promise<ChatMessage[]> => {
  return new Promise(resolve => setTimeout(() => resolve(messages[chatId] || []), 300));
};

export const sendMessage = async (chatId: string, content: string, senderId: string, type: 'text' | 'image' | 'sticker' | 'offer' = 'text', offerAmount?: number): Promise<ChatMessage> => {
  return new Promise(resolve => {
    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId,
      timestamp: Date.now(),
      type: type,
      text: type === 'text' ? content : undefined,
      imageUrl: type === 'image' ? content : undefined,
      stickerUrl: type === 'sticker' ? content : undefined,
      offerAmount: offerAmount
    };
    if (!messages[chatId]) messages[chatId] = [];
    messages[chatId].push(msg);
    resolve(msg);
  });
};

export const parseAgentText = (text: string): Partial<Listing> | null => {
  if (!text) return null;
  const lower = text.toLowerCase();
  
  // Find model
  const model = ALL_MODELS.find(m => lower.includes(m.toLowerCase()));
  
  if (!model) return null;

  return {
    model,
    description: text
  };
};