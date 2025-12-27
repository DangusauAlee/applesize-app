
import { Listing, User, UserRole, Condition, ChatSession, ChatMessage, Region, SimStatus, ProductCategory } from '../types';
import { LISTING_IMAGES, LISTING_VIDEOS, MOCK_USER, ALL_MODELS, MODELS_BY_CATEGORY } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";

// --- IN-MEMORY STATE ---
let authorizedUsers: User[] = [
  { ...MOCK_USER }
];

let currentUser: User | null = null;

let listings: Listing[] = Array.from({ length: 15 }).map((_, i) => {
  const isDemand = i % 4 === 0; 
  const isQuickSale = !isDemand && i % 5 === 0;
  
  const category: ProductCategory = 'iPhone';
  const models = MODELS_BY_CATEGORY[category];
  const model = models[i % models.length];

  const hasMultipleConditions = i % 3 === 0;
  const conditions = [Condition.DM, Condition.DDM, Condition.BM, Condition.CM, Condition.OFF_ID, Condition.BACK_CRACK, Condition.SCREEN_CRACK, Condition.CLEAN];
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
    sellerId: i < 3 ? authorizedUsers[0].id : `seller_${i}`,
    sellerName: i < 3 ? authorizedUsers[0].name : 'Emeka Phones Ltd',
    sellerPhone: '+234 811 000 0000',
    sellerVerified: true,
    location: 'Ikeja, Lagos',
    createdAt: Date.now() - (i * 10000000),
    status: 'active',
    offers: []
  };
});

let chatSessions: ChatSession[] = [];
let messagesByChat: Record<string, ChatMessage[]> = {};

// --- AUTH SERVICES ---

export const checkAuth = async (phone: string): Promise<User | null> => {
  await delay(800);
  const normalizedInput = phone.replace(/\D/g, '');
  const user = authorizedUsers.find(u => u.phone.replace(/\D/g, '') === normalizedInput);
  if (user) {
    currentUser = user;
    return user;
  }
  return null;
};

export const registerPendingUser = async (userData: Partial<User>): Promise<void> => {
  await delay(1000);
  console.log("Pending registration for:", userData);
};

export const getCurrentUser = () => currentUser || authorizedUsers[0];

export const updateCurrentUser = (data: Partial<User>) => {
  if (currentUser) {
    currentUser = { ...currentUser, ...data };
    return currentUser;
  }
  return authorizedUsers[0];
};

export const getTotalUnreadCount = () => {
  return chatSessions.reduce((acc, session) => acc + session.unreadCount, 0);
};

// --- LISTING SERVICES ---

export const getListings = async (
  query?: string, 
  tab: 'supply' | 'demand' | 'quicksale' = 'supply',
  filters?: any
): Promise<Listing[]> => {
  await delay(200);
  let result = [...listings].filter(l => l.status === 'active');
  
  if (tab === 'quicksale') {
    result = result.filter(l => l.isQuickSale && l.type === 'supply');
  } else if (tab === 'demand') {
    result = result.filter(l => l.type === 'demand');
  } else {
    result = result.filter(l => l.type === 'supply' && !l.isQuickSale);
  }

  if (query) {
    const lower = query.toLowerCase();
    result = result.filter(l => 
      l.model.toLowerCase().includes(lower) || 
      l.location.toLowerCase().includes(lower)
    );
  }

  return result;
};

export const deleteListing = async (id: string): Promise<boolean> => {
  listings = listings.filter(l => l.id !== id);
  return true;
};

export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  if (!query) return [];
  const lower = query.toLowerCase();
  return ALL_MODELS.filter(m => m.toLowerCase().includes(lower)).slice(0, 5);
};

export const getListingById = async (id: string): Promise<Listing | undefined> => {
  return listings.find(l => l.id === id);
};

export const createListing = async (listingData: Partial<Listing>): Promise<Listing> => {
  await delay(300);
  const user = getCurrentUser();
  const newListing: Listing = {
    id: `lst_${Date.now()}`,
    type: listingData.type || 'supply',
    category: 'iPhone',
    isQuickSale: listingData.isQuickSale || false,
    allowOffers: listingData.allowOffers || false,
    brand: 'Apple',
    model: listingData.model || 'Unknown Model',
    storage: listingData.storage || '128GB',
    condition: listingData.condition || [Condition.CLEAN],
    region: listingData.region || 'UK',
    simStatus: listingData.simStatus || 'Physical Sim',
    price: listingData.price || 0,
    currency: '₦',
    batteryHealth: listingData.batteryHealth || 100,
    color: listingData.color || 'Black',
    description: listingData.description || '',
    images: listingData.images || [],
    videoUrl: listingData.videoUrl,
    sellerId: user.id,
    sellerName: user.name,
    sellerPhone: user.phone,
    sellerVerified: user.isVerified,
    location: user.location,
    createdAt: Date.now(),
    status: 'active',
    offers: []
  };
  
  listings.unshift(newListing);
  return newListing;
};

export const getChats = async (): Promise<ChatSession[]> => {
  const user = getCurrentUser();
  return chatSessions.filter(c => c.buyerId === user.id || c.sellerId === user.id)
    .sort((a,b) => b.lastUpdated - a.lastUpdated);
};

export const getOrCreateChat = async (listingId: string, buyerId: string, sellerId: string, modelName: string): Promise<string> => {
  const existing = chatSessions.find(c => c.listingId === listingId && c.buyerId === buyerId);
  if (existing) return existing.id;

  const newChat: ChatSession = {
    id: `chat_${Date.now()}`,
    listingId,
    listingModel: modelName,
    buyerId,
    sellerId,
    lastMessage: 'Chat started',
    lastUpdated: Date.now(),
    unreadCount: 0
  };

  chatSessions.push(newChat);
  return newChat.id;
};

export const getMessages = async (chatId: string): Promise<ChatMessage[]> => {
  return messagesByChat[chatId] || [];
};

export const sendMessage = async (
  chatId: string, 
  content: string, 
  senderId: string, 
  type: 'text' | 'image' | 'sticker' | 'offer' | 'audio' = 'text', 
  offerAmount?: number
): Promise<ChatMessage> => {
  const msg: ChatMessage = {
    id: `msg_${Date.now()}`,
    senderId,
    timestamp: Date.now(),
    type,
    text: type === 'text' || type === 'offer' ? content : undefined,
    imageUrl: type === 'image' ? content : undefined,
    stickerUrl: type === 'sticker' ? content : undefined,
    audioUrl: type === 'audio' ? content : undefined,
    offerAmount,
    offerStatus: type === 'offer' ? 'pending' : undefined
  };

  if (!messagesByChat[chatId]) messagesByChat[chatId] = [];
  messagesByChat[chatId].push(msg);

  const session = chatSessions.find(c => c.id === chatId);
  if (session) {
    session.lastMessage = type === 'audio' ? '🎤 Voice Message' : (type === 'image' ? '🖼️ Photo' : content);
    session.lastUpdated = Date.now();
  }

  return msg;
};

export const respondToOffer = async (chatId: string, messageId: string, status: 'accepted' | 'rejected'): Promise<boolean> => {
  const messages = messagesByChat[chatId];
  if (!messages) return false;
  const msgIndex = messages.findIndex(m => m.id === messageId);
  if (msgIndex === -1) return false;
  messages[msgIndex].offerStatus = status;
  return true;
};

export const parseAgentText = async (text: string): Promise<Partial<Listing>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Extract iPhone details from this WhatsApp text: "${text}"`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          model: { type: Type.STRING },
          price: { type: Type.NUMBER },
          storage: { type: Type.STRING },
          color: { type: Type.STRING },
          batteryHealth: { type: Type.NUMBER },
          condition: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          }
        },
        required: ['model', 'price']
      }
    }
  });

  try {
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse agent text", e);
    return {};
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
