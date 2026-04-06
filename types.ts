export type OrderType = 'DINE_IN' | 'DELIVERY' | 'PICK_UP';
export type OrderStatus = 'PLACED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
export type PaymentMode = 'CASH' | 'CARD' | 'UPI' | 'DUE' | 'PART';
export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';

export interface Floor {
  id: string;
  name: string;
  sortOrder?: number;
}

export interface Table {
  id: string;
  name: string;
  status: TableStatus;
  currentOrderId?: string;
  capacity?: number;
  floorId?: string;
}

export interface RestaurantInfo {
  name: string;
  phone: string;
  address: string;
  gstNo?: string;
}

export type VegType = 'VEG' | 'NON_VEG' | 'SEAFOOD' | 'BOTH';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  isVeg: boolean;
  vegType: VegType;
  vegPrice?: number;
  nonVegPrice?: number;
  seafoodPrice?: number;
  hasPortions?: boolean;
  halfPrice?: number;
  image?: string;
  quantityStr?: string;
}

export interface Category {
  id: string;
  name: string;
  type?: 'FOOD' | 'DRINK';
}

export interface CartItem extends MenuItem {
  quantity: number;
  selectedVegChoice?: 'VEG' | 'NON_VEG' | 'SEAFOOD';
  selectedPortion?: 'HALF' | 'FULL';
}

export interface Order {
  id: string;
  billNo: string;
  customerName?: string;
  tableId?: string;
  tableName?: string;
  date: string;
  time: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMode: PaymentMode;
  orderType: OrderType;
  staffName: string;
  status: OrderStatus;
}

export interface SalesReportEntry {
  date: string;
  totalOrders: number;
  totalSales: number;
  paymentModes: Record<PaymentMode, number>;
}