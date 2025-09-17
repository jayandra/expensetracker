import { useEffect, useState } from 'react';
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

type IconProps = {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

export const Icon = ({ name, className = '', size = 'md' }: IconProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload the Material Icons font once when the component mounts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined';
    link.rel = 'stylesheet';
    
    link.onload = () => setIsLoaded(true);
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Fallback to a simple span if the icon hasn't loaded yet
  if (!isLoaded) {
    return <span className={cn('inline-block w-5 h-5', className)} />;
  }

  const sizeClass = {
    'sm': 'text-base',
    'md': 'text-lg',
    'lg': 'text-xl'
  }[size];

  return (
    <span 
      className={`material-icons-outlined ${sizeClass} ${className || ''}`}
      aria-hidden="true"
    >
      {name}
    </span>
  );
};

// Predefined icon names organized into super groups
export const ICON_GROUPS = {
  // ===== HOME & LIVING =====
  HOME: {
    // Basic Home
    HOME: 'home',
    APARTMENT: 'apartment',
    HOUSE: 'house',
    
    // Rooms
    KITCHEN: 'kitchen',
    BEDROOM: 'king_bed',
    BATHROOM: 'bathtub',
    LIVING_ROOM: 'weekend',
    DINING_ROOM: 'dining',
    
    // Home Features
    AC_UNIT: 'ac_unit',
    LIGHTBULB: 'lightbulb',
    WINDOW: 'window',
    DOOR: 'door_front',
    
    // Cleaning & Laundry
    CLEANING_SERVICES: 'cleaning_services',
    LOCAL_LAUNDRY_SERVICE: 'local_laundry_service',
    IRON: 'iron',
    TRASH: 'delete',
    RECYCLING: 'recycling',
    
    // Home Maintenance
    HANDYMAN: 'handyman',
    CONSTRUCTION: 'construction',
    HOME_REPAIR_SERVICE: 'home_repair_service',
    BUILD: 'build',
    PLUMBING: 'plumbing',
    ELECTRICAL: 'electrical_services',
    ROOFING: 'roofing',
    
    // Outdoor
    YARD: 'yard',
    GRASS: 'grass',
    GARDEN: 'local_florist',
    GARAGE: 'garage',
    DECK: 'deck',
  },

  // ===== SHOPPING & RETAIL =====
  SHOPPING: {
    // Shopping
    SHOPPING_CART: 'shopping_cart',
    SHOPPING_BAG: 'shopping_bag',
    SHOPPING_BASKET: 'shopping_basket',
    LOCAL_MALL: 'local_mall',
    STORE: 'store',
    STOREFRONT: 'storefront',
    SHOP: 'shop',
    
    // Payments & Receipts
    CREDIT_CARD: 'credit_card',
    RECEIPT: 'receipt',
    RECEIPT_LONG: 'receipt_long',
    LOCAL_OFFER: 'local_offer',
    PERCENT: 'percent',
    TAG: 'sell',
    COUPON: 'confirmation_number',
    
    // Groceries
    LOCAL_GROCERY_STORE: 'local_grocery_store',
    LOCAL_CAFE: 'local_cafe',
    LOCAL_DINING: 'local_dining',
    BAKERY_DINING: 'bakery_dining',
    RAMEN_DINING: 'ramen_dining',
  },

  // ===== FOOD & DINING =====
  DINING: {
    // Meals
    RESTAURANT: 'restaurant',
    FASTFOOD: 'fastfood',
    SET_MEAL: 'set_meal',
    BREAKFAST: 'breakfast_dining',
    LUNCH: 'lunch_dining',
    DINNER: 'dinner_dining',
    
    // Food Types
    LOCAL_PIZZA: 'local_pizza',
    BURGER: 'lunch_dining',
    SUSHI: 'dinner_dining',
    ICECREAM: 'icecream',
    CAKE: 'cake',
    
    // Drinks
    LOCAL_BAR: 'local_bar',
    WINE_BAR: 'wine_bar',
    COFFEE: 'coffee',
    TEA: 'emoji_food_beverage',
    LIQUOR: 'liquor',
  },

  // ===== TRANSPORTATION =====
  TRANSPORT: {
    // Vehicles
    DIRECTIONS_CAR: 'directions_car',
    TWO_WHEELER: 'two_wheeler',
    BIKE: 'directions_bike',
    SCOOTER: 'electric_scooter',
    
    // Public Transport
    DIRECTIONS_BUS: 'directions_bus',
    DIRECTIONS_SUBWAY: 'directions_subway',
    TRAIN: 'train',
    TRAM: 'tram',
    
    // Travel
    FLIGHT: 'flight',
    LOCAL_AIRPORT: 'local_airport',
    LOCAL_TAXI: 'local_taxi',
    LOCAL_GAS_STATION: 'local_gas_station',
    LOCAL_PARKING: 'local_parking',
  },

  // ===== BILLS & UTILITIES =====
  UTILITIES: {
    // Utilities
    ELECTRIC_BOLT: 'electric_bolt',
    WATER_DROP: 'water_drop',
    WIFI: 'wifi',
    ROUTER: 'router',
    
    // Services
    PHONE: 'phone',
    PHONE_IPHONE: 'phone_iphone',
    TV: 'tv',
    SUBSCRIPTIONS: 'subscriptions',
  },

  // ===== PERSONAL CARE =====
  PERSONAL: {
    // Health & Hygiene
    PERSON: 'person',
    FACE: 'face',
    SPA: 'spa',
    SHOWER: 'shower',
    BATHTUB: 'bathtub',
    
    // Grooming
    CUT: 'content_cut',
    WASH: 'wash',
    SOAP: 'soap',
  },

  // ===== FAMILY =====
  FAMILY: {
    // Children
    CHILD_CARE: 'child_care',
    CHILD_FRIENDLY: 'child_friendly',
    TOYS: 'toys',
    STROLLER: 'stroller',
    
    // Pets
    PETS: 'pets',
    PET_SUPPLIES: 'pets',
  },

  // ===== ENTERTAINMENT =====
  ENTERTAINMENT: {
    // Media
    MOVIE: 'movie',
    TV_SHOW: 'tv',
    MUSIC_NOTE: 'music_note',
    HEADPHONES: 'headphones',
    
    // Activities
    SPORTS_ESPORTS: 'sports_esports',
    SPORTS_BASKETBALL: 'sports_basketball',
    SPORTS_SOCCER: 'sports_soccer',
    CASINO: 'casino',
  },

  // ===== HEALTH & WELLNESS =====
  HEALTH: {
    // Medical
    LOCAL_HOSPITAL: 'local_hospital',
    MEDICAL_SERVICES: 'medical_services',
    MEDICATION: 'medication',
    VACCINES: 'vaccines',
    
    // Fitness
    FITNESS_CENTER: 'fitness_center',
    SELF_IMPROVEMENT: 'self_improvement',
    RUN: 'directions_run',
  },

  // ===== FINANCIAL =====
  FINANCE: {
    // Banking
    ACCOUNT_BALANCE: 'account_balance',
    ACCOUNT_BALANCE_WALLET: 'account_balance_wallet',
    SAVINGS: 'savings',
    LOCAL_ATM: 'local_atm',
    
    // Transactions
    ATTACH_MONEY: 'attach_money',
    PAYMENTS: 'payments',
    CURRENCY_EXCHANGE: 'currency_exchange',
  },

  // ===== TECHNOLOGY =====
  TECH: {
    // Devices
    DEVICES: 'devices',
    SMARTPHONE: 'smartphone',
    LAPTOP: 'laptop',
    LAPTOP_MAC: 'laptop_mac',
    
    // Accessories
    HEADSET: 'headset',
    HEADSET_MIC: 'headset_mic',
    SPEAKER: 'speaker',
  },

  // ===== TRAVEL =====
  TRAVEL: {
    // Accommodation
    HOTEL: 'hotel',
    KING_BED: 'king_bed',
    
    // Luggage
    LUGGAGE: 'luggage',
    BEACH_ACCESS: 'beach_access',
    
    // Navigation
    MAP: 'map',
    EXPLORE: 'explore',
  },

  // ===== MISCELLANEOUS =====
  MISC: {
    // Status
    CHECK_CIRCLE: 'check_circle',
    WARNING: 'warning',
    ERROR: 'error',
    INFO: 'info',
    HELP: 'help',
    
    // Actions
    DOWNLOAD: 'download',
    UPLOAD: 'upload',
    CLOUD: 'cloud',
    STREAM: 'stream'
  }
} as const;