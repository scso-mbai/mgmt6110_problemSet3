export type InkColor = 'Amber' | 'Amethyst' | 'Emerald' | 'Ruby' | 'Sapphire' | 'Steel';

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Super Rare' | 'Legendary';

export type CardType = 'Character' | 'Action' | 'Item' | 'Location';

export interface PublicTransitInfo {
  nearestMrt: string;
  mrtDistance: string;
  busServices: string;
  accessibilitySummary: string;
}

export interface CardStoreInventory {
  storeId: string;
  storeName: string;
  location: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  publicTransit: PublicTransitInfo;
  distanceKm: number;
  price: number;
  quantity: number;
  condition: 'Near Mint' | 'Lightly Played';
  verifiedSeller: boolean;
  sellerRating: number;
  ratingCount: number;
}

export interface HobbyStore {
  id: string;
  name: string;
  location: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  publicTransit: PublicTransitInfo;
  sellerRating: number;
  ratingCount: number;
  verified: boolean;
  openingHours: string;
  contactNumber: string;
}

export interface TradingCard {
  id: string;
  name: string;
  subtitle: string;
  inkColor: InkColor;
  rarity: Rarity;
  cardType: CardType;
  cost: number;
  strength?: number;
  willpower?: number;
  lore?: number;
  marketPrice: number;
  totalQuantity: number;
  cardNumber: string;
  setName: string;
  abilityName: string;
  abilityText: string;
  flavorText: string;
  artId: string;
  stores: CardStoreInventory[];
}

export type SortStoreOption = 'distance' | 'price' | 'quantity';

export interface CartItem {
  cardId: string;
  cardName: string;
  cardSubtitle: string;
  cardNumber: string;
  inkColor: InkColor;
  rarity: Rarity;
  artId: string;
  storeId: string;
  storeName: string;
  storeLocation: string;
  storeNeighborhood: string;
  price: number;
  quantity: number;
  availableStock: number;
  condition: 'Near Mint' | 'Lightly Played';
}

export type BaseLocationStatus = 'loading' | 'success' | 'empty' | 'refused' | 'unreachable';

