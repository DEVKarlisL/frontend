/**
 * Type definitions for the auction platform
 */

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  bio?: string;
  is_verified: boolean;
  is_seller: boolean;
  is_business: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_active?: boolean;
  feedback_score: number;
  total_auctions: number;
  total_bids: number;
  created_at: string;
}

export interface UserProfile {
  id: number;
  notification_preference: "email" | "sms" | "push" | "in_app";
  receive_marketing: boolean;
  receive_auction_alerts: boolean;
  kyc_verified: boolean;
  email_verified: boolean;
  phone_verified: boolean;
}

// Auction Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon?: string;
}

export interface Auction {
  id: number;
  title: string;
  description: string;
  seller: User;
  category: Category | any;
  category_id?: number;
  starting_price: number;
  current_highest_bid: number;
  current_bid?: number;
  reserve_price?: number;
  buy_now_price?: number;
  minimum_increment?: number;
  status: "ended" | "live" | "soon" | "draft" | "active";
  start_time: string;
  end_time: string;
  bid_count?: number;
  numberOfBids?: number;
  highest_bidder?: User;
  last_bidder?: {
    username: string;
    avatar?: string | null;
  };
  image?: string;
  images?: AuctionImage[];
  created_at?: string;
  updated_at?: string;
  winner?: User;
  final_price?: number;
  anti_snipe_seconds?: number;
  view_count?: number;
  location?: string;
  verified?: boolean;
  currentBid?: number;
  timeRemaining?: string;
  watchlist_count?: number;
}

export interface AuctionImage {
  id: number;
  image: string;
  alt_text: string;
  order: number;
}

export interface Watchlist {
  id: number;
  auction: Auction;
  created_at: string;
}

// Bid Types
export interface Bid {
  id: number;
  auction: number;
  bidder: User;
  amount: number;
  is_auto_bid: boolean;
  created_at: string;
}

export interface AutoBidRule {
  id: number;
  auction: number;
  max_bid: number;
  is_active: boolean;
  created_at: string;
}

// Payment Types
export interface Payment {
  id: number;
  auction?: number;
  amount: number;
  currency: string;
  payment_method: "stripe" | "paypal" | "bank_transfer";
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  transaction_id?: string;
  created_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  status: "draft" | "issued" | "paid" | "overdue" | "cancelled";
  item_price: number;
  shipping_cost: number;
  tax: number;
  total: number;
  issued_date?: string;
  due_date?: string;
  paid_date?: string;
  created_at: string;
}

// Notification Types
export interface Notification {
  id: number;
  notification_type: string;
  channel: "email" | "sms" | "push" | "in_app";
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface Message {
  id: number;
  sender: User;
  recipient: number;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

// Auth Types
export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// API Error
export interface APIError {
  detail?: string;
  message?: string;
  [key: string]: any;
}
