
export interface User {
  id: string;
  username: string;
  email: string;
  address: string;
  phoneNumber: string;
  profilePicture?: string;
  isAdmin: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stockQuantity: number;
  colors: string[];
  specifications: Record<string, string>;
  reviews: Review[];
}

export interface Review {
  id: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  color: string;
  selected: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: string;
  orderStatus: OrderStatus;
  totalAmount: number;
  orderedAt: string;
  deliveredAt?: string;
  canCancel: boolean;
  canReplace: boolean;
  canReturn: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  color: string;
  price: number;
  status: "pending" | "processed" | "shipped" | "delivered";
}

export interface Address {
  doorNumber: string;
  street: string;
  cityOrVillage: string;
  state: string;
  pinCode: string;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "returned" | "replacement";

export type PaymentMethod = "upi" | "netBanking" | "cashOnDelivery";

export type FilterOptions = {
  category: string[];
  priceRange: {
    min: number;
    max: number;
  };
  colors: string[];
  specifications: Record<string, string[]>;
};
