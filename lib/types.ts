export type BotStatus = "connected" | "disconnected";

export type ProductStatus = "active" | "inactive";

export type OrderStatus = "Menunggu" | "Diproses" | "Selesai" | "Dibatalkan";

export interface Bot {
  id: string;
  name: string;
  username: string;
  token: string;
  status: BotStatus;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  status: ProductStatus;
  createdAt: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerUsername: string;
  productName: string;
  quantity: number;
  total: number;
  status: OrderStatus;
  paymentStatus: "Belum Dibayar" | "Dibayar" | "Gagal" | "Kedaluwarsa" | "Refund";
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  username: string;
  totalOrders: number;
  totalSpent: number;
  joinedAt: string;
}

export interface StoreSettings {
  storeName: string;
  storeDescription: string;
  supportContact: string;
  currency: "IDR";
}


export type PaymentStatus =
  | "Menunggu"
  | "Dibayar"
  | "Gagal"
  | "Kedaluwarsa"
  | "Refund";

export interface Payment {
  id: string;
  orderId: string;
  customerName: string;
  customerUsername: string;
  amount: number;
  method: "QRIS";
  provider: "DABIS (Simulasi)";
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string;
}
