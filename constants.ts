import { Listing, UserRole, Condition, ProductCategory } from './types';

export const MOCK_USER = {
  id: 'u1',
  name: 'Tunde Johnson',
  phone: '+234 800 123 4567',
  role: UserRole.USER, 
  location: 'Computer Village, Ikeja',
  state: 'Lagos',
  country: 'Nigeria',
  isVerified: true,
  email: 'tunde@applesize.ng',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
};

export const LISTING_VIDEOS = [
  'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smart-phone-with-a-green-screen-3290-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-man-holding-a-smartphone-with-a-green-screen-3426-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-woman-holding-a-smartphone-with-a-green-screen-3427-large.mp4',
];

// Fallback images
export const LISTING_IMAGES = [
  'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=600&q=80',
];

export const CATEGORIES: ProductCategory[] = ['iPhone'];

export const MODELS_BY_CATEGORY: Record<ProductCategory, string[]> = {
  'iPhone': [
    'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16',
    'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
    'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
    'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 mini',
    'iPhone 12 Pro Max', 'iPhone 12', 'iPhone 11 Pro Max', 'iPhone 11', 'iPhone XR',
    'iPhone XS Max', 'iPhone XS', 'iPhone X', 'iPhone 8 Plus'
  ]
};

// Flattened list for search
export const ALL_MODELS = Object.values(MODELS_BY_CATEGORY).flat();