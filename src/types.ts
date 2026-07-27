export type Role = "admin" | "counter" | "kitchen" | "waiter" | "manager";
export type FoodType = "veg" | "nonveg" | "dessert";
export type OrderChannel = "kiosk" | "counter";
export type OrderMode = "dine_in" | "takeaway";
export type PaymentMode = "cash" | "upi";
export type OrderStatus =
  | "cash_pending"
  | "upi_pending"
  | "active"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "cancelled"
  | "refunded";

export type MenuCategory = {
  id: string;
  name: string;
  type: FoodType;
  sort: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  type: FoodType;
  categoryId: string;
  imageUrl?: string;
  isActive: boolean;
  taxPercent?: number;
};

export type OrderItem = {
  itemId: string;
  name: string;
  type: FoodType;
  qty: number;
  unitPrice: number;
  notes?: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  lastVisitAt: number;
  createdAt: number;
};

export type Order = {
  id: string;
  token: number;
  createdAt: number;
  updatedAt: number;
  channel: OrderChannel;
  status: OrderStatus;
  paymentMode: PaymentMode;
  mode: OrderMode;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  tableNo?: string;
  flags?: {
    vegPrintedAt?: number;
    nonvegPrintedAt?: number;
    billPrintedAt?: number;
  };
};

export type InventoryItem = {
  id: string;
  name: string;
  unit: "kg" | "g" | "l" | "ml" | "pcs";
  stock: number;
  lowStockAt: number;
  updatedAt: number;
};

export type User = {
  id: string;
  displayName: string;
  role: Role;
  pinHash: string;
  isActive: boolean;
  createdAt: number;
};

export type AppSettings = {
  restaurantName: string;
  upiMerchantVpa: string;
  upiMerchantName: string;
  kioskAutoReturnMs: number;
  kioskSoundEnabled: boolean;
  printers: {
    vegIp: string;
    nonvegIp: string;
    billIp: string;
  };
  theme: {
    accent: "indigo" | "emerald" | "rose" | "amber";
  };
};

export type AuthSession = {
  userId: string;
  displayName: string;
  role: Role;
  issuedAt: number;
};

