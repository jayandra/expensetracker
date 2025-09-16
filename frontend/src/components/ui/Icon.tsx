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

// Predefined icon names for better type safety
export const ICON_NAMES = {
  // Food & Dining
  RESTAURANT: 'restaurant',
  FASTFOOD: 'fastfood',
  LOCAL_CAFE: 'local_cafe',
  LOCAL_PIZZA: 'local_pizza',
  CAKE: 'cake',
  SET_MEAL: 'set_meal',
  LIQUOR: 'liquor',
  LOCAL_BAR: 'local_bar',

  // Shopping
  SHOPPING_CART: 'shopping_cart',
  LOCAL_MALL: 'local_mall',
  RECEIPT: 'receipt',
  CREDIT_CARD: 'credit_card',
  RECEIPT_LONG: 'receipt_long',
  SHOPPING_BAG: 'shopping_bag',
  
  // Grocery & Retail Brands
  LOCAL_GROCERY_STORE: 'local_grocery_store',
  STORE: 'store',
  STOREFRONT: 'storefront',
  SHOPPING_BASKET: 'shopping_basket',
  INVENTORY: 'inventory',
  INVENTORY_2: 'inventory_2',
  LOCAL_OFFER: 'local_offer',
  PERCENT: 'percent',
  TAG: 'sell',
  COUPON: 'confirmation_number',
  STORE_MALL_DIRECTORY: 'store_mall_directory',
  SHOP: 'shop',

  // Transportation
  DIRECTIONS_CAR: 'directions_car',
  DIRECTIONS_BUS: 'directions_bus',
  LOCAL_TAXI: 'local_taxi',
  DIRECTIONS_BIKE: 'directions_bike',
  DIRECTIONS_BOAT: 'directions_boat',
  FLIGHT: 'flight',
  DIRECTIONS_SUBWAY: 'directions_subway',
  LOCAL_GAS_STATION: 'local_gas_station',
  LOCAL_PARKING: 'local_parking',
  CAR_REPAIR: 'car_repair',

  // Bills & Utilities
  HOUSE: 'house',
  ELECTRIC_BOLT: 'electric_bolt',
  WATER_DROP: 'water_drop',
  WIFI: 'wifi',
  PHONE_IPHONE: 'phone_iphone',
  TV: 'tv',
  BUILD: 'build',
  PLUMBING: 'plumbing',
  
  // Entertainment
  MOVIE: 'movie',
  SPORTS_ESPORTS: 'sports_esports',
  MUSIC_NOTE: 'music_note',
  SPORTS_BASKETBALL: 'sports_basketball',
  SPORTS_SOCCER: 'sports_soccer',
  CASINO: 'casino',
  LOCAL_PLAY: 'local_play',

  // Health & Fitness
  LOCAL_HOSPITAL: 'local_hospital',
  MEDICATION: 'medication',
  FITNESS_CENTER: 'fitness_center',
  SELF_IMPROVEMENT: 'self_improvement',
  SPA: 'spa',

  // Education
  SCHOOL: 'school',
  MENU_BOOK: 'menu_book',
  COMPUTER: 'computer',

  // Income
  ATTACH_MONEY: 'attach_money',
  ACCOUNT_BALANCE: 'account_balance',
  PAYMENTS: 'payments',
  REDEEM: 'redeem',
  CURRENCY_EXCHANGE: 'currency_exchange',

  // Business
  WORK: 'work',
  BUSINESS: 'business',

  // Home & Personal
  HOME: 'home',
  LOCAL_LAUNDRY_SERVICE: 'local_laundry_service',
  PETS: 'pets',
  CHILD_CARE: 'child_care',
  LOCAL_ATM: 'local_atm',
  SAVINGS: 'savings',
  ACCOUNT_BALANCE_WALLET: 'account_balance_wallet'
} as const;

export type IconName = keyof typeof ICON_NAMES;
export type IconValue = (typeof ICON_NAMES)[IconName];

// Array of all icon values for components that need to iterate over them
export const ICONS = Object.values(ICON_NAMES) as IconValue[];
