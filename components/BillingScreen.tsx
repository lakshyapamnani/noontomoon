
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { 
  ChefHat,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  User,
  ShoppingBag,
  ShoppingCart,
  CheckCircle,
  Smartphone,
  CreditCard,
  Banknote,
  Truck,
  Package,
  UtensilsCrossed,
  Utensils,
  Users,
  ArrowLeft,
  Wallet
} from 'lucide-react';
import QRCode from 'qrcode';
import { Category, MenuItem, CartItem, OrderType, PaymentMode, Order, RestaurantInfo, Table, Floor, TableCart } from '../types';
import TablesGrid from './TablesGrid';

const BILL_UPI_ID = 'lakshaypamnani2@okaxis';

interface ItemOptionsPopupProps {
  item: MenuItem;
  onConfirm: (choice: 'VEG' | 'NON_VEG' | 'SEAFOOD' | null, portionChoice: 'HALF' | 'FULL' | null, mlChoice?: string | null) => void;
  onClose: () => void;
}

const ItemOptionsPopup: React.FC<ItemOptionsPopupProps> = ({ item, onConfirm, onClose }) => {
  const [vegChoice, setVegChoice] = useState<'VEG' | 'NON_VEG' | 'SEAFOOD' | null>(item.vegType === 'BOTH' ? null : null);
  const [portionChoice, setPortionChoice] = useState<'HALF' | 'FULL' | null>(item.hasPortions ? null : null);
  const [mlChoice, setMlChoice] = useState<string | null>(null);

  const hasMlPrices = item.mlPrices && Object.keys(item.mlPrices).length > 0;
  const mlEntries = hasMlPrices ? Object.entries(item.mlPrices!) : [];

  const handleConfirm = () => {
    // For BOTH type items, veg choice is required
    if (item.vegType === 'BOTH' && !vegChoice) return;
    // For portions, portion choice is required
    if (item.hasPortions && !portionChoice) return;
    // For ML items, ml choice is required
    if (hasMlPrices && !mlChoice) return;
    
    onConfirm(vegChoice, portionChoice, mlChoice);
  };

  // Calculate total price
  let totalPrice = 0;
  if (hasMlPrices && mlChoice) {
    totalPrice = item.mlPrices![mlChoice] || 0;
  } else if (item.vegType === 'BOTH') {
    const vegBasePrice = vegChoice === 'VEG' ? item.vegPrice : vegChoice === 'NON_VEG' ? item.nonVegPrice : vegChoice === 'SEAFOOD' ? item.seafoodPrice : 0;
    totalPrice = (item.hasPortions && portionChoice === 'HALF') ? (item.halfPrice || 0) : (vegBasePrice || 0);
  } else if (item.hasPortions && portionChoice === 'HALF') {
    totalPrice = item.halfPrice || 0;
  } else {
    totalPrice = item.price;
  }

  // If no options needed (not BOTH, no portions, no ML), auto-confirm
  useEffect(() => {
    if (item.vegType !== 'BOTH' && !item.hasPortions && !hasMlPrices) {
      onConfirm(null, null, null);
    }
  }, []);

  // Only show popup if there are options to select
  if (item.vegType !== 'BOTH' && !item.hasPortions && !hasMlPrices) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-96 max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-lg text-gray-900">Customize Order</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4 font-medium">{item.name}</p>
        
        {/* Veg/Non-Veg Choice - only for BOTH type */}
        {item.vegType === 'BOTH' && (
          <div className="mb-5">
            <label className="block text-xs font-black text-gray-500 mb-2 uppercase">Choose Type *</label>
            <div className="flex gap-3">
              <button
                onClick={() => setVegChoice('VEG')}
                className={`flex-1 py-3 rounded-xl font-black transition-all flex flex-col items-center gap-1 border-2 ${
                  vegChoice === 'VEG' 
                    ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-200' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                }`}
              >
                <span className={`w-3 h-3 rounded-full ${vegChoice === 'VEG' ? 'bg-white' : 'bg-green-500'}`}></span>
                <span className="text-sm">Veg</span>
                <span className="text-xs opacity-80">₹{item.vegPrice}</span>
              </button>
              <button
                onClick={() => setVegChoice('NON_VEG')}
                className={`flex-1 py-3 rounded-xl font-black transition-all flex flex-col items-center gap-1 border-2 ${
                  vegChoice === 'NON_VEG' 
                    ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-200' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-red-400'
                }`}
              >
                <span className={`w-3 h-3 rounded-full ${vegChoice === 'NON_VEG' ? 'bg-white' : 'bg-red-500'}`}></span>
                <span className="text-sm">Non-Veg</span>
                <span className="text-xs opacity-80">₹{item.nonVegPrice}</span>
              </button>
              {item.seafoodPrice != null && (
                <button
                  onClick={() => setVegChoice('SEAFOOD')}
                  className={`flex-1 py-3 rounded-xl font-black transition-all flex flex-col items-center gap-1 border-2 ${
                    vegChoice === 'SEAFOOD' 
                      ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-200' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${vegChoice === 'SEAFOOD' ? 'bg-white' : 'bg-blue-500'}`}></span>
                  <span className="text-sm">Seafood</span>
                  <span className="text-xs opacity-80">₹{item.seafoodPrice}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Portions Choice */}
        {item.hasPortions && (
          <div className="mb-5">
            <label className="block text-xs font-black text-gray-500 mb-2 uppercase">Choose Portion *</label>
            <div className="flex gap-3">
              <button
                onClick={() => setPortionChoice('HALF')}
                className={`flex-1 py-3 rounded-xl font-black transition-all flex flex-col items-center gap-1 border-2 ${
                  portionChoice === 'HALF' 
                    ? 'bg-[#F57C00] text-white border-[#F57C00] shadow-lg shadow-orange-200' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                }`}
              >
                <span className={`w-3 h-3 rounded-full ${portionChoice === 'HALF' ? 'bg-white' : 'bg-[#F57C00]'}`}></span>
                <span className="text-sm">Half</span>
                <span className="text-xs opacity-80">₹{item.halfPrice}</span>
              </button>
              <button
                onClick={() => setPortionChoice('FULL')}
                className={`flex-1 py-3 rounded-xl font-black transition-all flex flex-col items-center gap-1 border-2 ${
                  portionChoice === 'FULL' 
                    ? 'bg-[#F57C00] text-white border-[#F57C00] shadow-lg shadow-orange-200' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                }`}
              >
                <span className={`w-3 h-3 rounded-full ${portionChoice === 'FULL' ? 'bg-white' : 'bg-[#F57C00]'}`}></span>
                <span className="text-sm">Full</span>
                <span className="text-xs opacity-80">₹{item.vegType === 'BOTH' && vegChoice === 'VEG' ? item.vegPrice : item.vegType === 'BOTH' && vegChoice === 'NON_VEG' ? item.nonVegPrice : item.vegType === 'BOTH' && vegChoice === 'SEAFOOD' ? item.seafoodPrice : item.price}</span>
              </button>
            </div>
          </div>
        )}

        {/* ML Size Choice - for drinks with multiple sizes */}
        {hasMlPrices && (
          <div className="mb-5">
            <label className="block text-xs font-black text-gray-500 mb-2 uppercase">Choose Size *</label>
            <div className="grid grid-cols-3 gap-2">
              {mlEntries.map(([size, price]) => (
                <button
                  key={size}
                  onClick={() => setMlChoice(size)}
                  className={`py-3 px-2 rounded-xl font-black transition-all flex flex-col items-center gap-1 border-2 ${
                    mlChoice === size
                      ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                  }`}
                >
                  <span className="text-sm font-black">{size}</span>
                  <span className="text-xs opacity-80">₹{price}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Total and Confirm */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-gray-600">Total:</span>
            <span className="text-xl font-black text-[#F57C00]">₹{totalPrice}</span>
          </div>
          <button
            onClick={handleConfirm}
            disabled={(item.vegType === 'BOTH' && !vegChoice) || (item.hasPortions && !portionChoice) || (hasMlPrices && !mlChoice)}
            className="w-full py-4 bg-[#F57C00] hover:bg-orange-600 text-white rounded-xl font-black transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

interface TableCart {
  items: CartItem[];
  customerName: string;
}

const toCartItemsArray = (value: unknown): CartItem[] => {
  if (Array.isArray(value)) {
    return value as CartItem[];
  }
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, CartItem>);
  }
  return [];
};

const normalizeTableCart = (value: unknown): TableCart => {
  if (!value || typeof value !== 'object') {
    return { items: [], customerName: '' };
  }
  const cart = value as { items?: unknown; customerName?: unknown };
  return {
    items: toCartItemsArray(cart.items),
    customerName: typeof cart.customerName === 'string' ? cart.customerName : '',
  };
};

interface BillingScreenProps {
  categories: Category[];
  menuItems: MenuItem[];
  taxRate: number;
  drinkTaxRate: number;
  restaurantInfo: RestaurantInfo;
  tables: Table[];
  floors?: Floor[];
  tableCarts: Record<string, TableCart>;
  billCounter: number;
  onCreateOrder: (order: Order) => Promise<void>;
  onUpdateTableStatus: (tableId: string, status: Table['status'], currentOrderId?: string) => void;
  onUpdateTableCarts: (tableCarts: Record<string, TableCart>) => void;
  selectedTableId?: string | null;
  onBackToTables?: () => void;
  variant?: 'desktop' | 'mobile';
}

const BillingScreen: React.FC<BillingScreenProps> = ({ 
  categories, 
  menuItems, 
  taxRate, 
  drinkTaxRate,
  restaurantInfo, 
  tables,
  floors = [],
  tableCarts,
  billCounter,
  onCreateOrder,
  onUpdateTableStatus,
  onUpdateTableCarts,
  selectedTableId: selectedTableIdProp = null,
  onBackToTables,
  variant = 'desktop',
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || '');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(selectedTableIdProp ?? null);
  const [orderType, setOrderType] = useState<OrderType>('PICK_UP');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [optionsItem, setOptionsItem] = useState<MenuItem | null>(null);
  const [menuType, setMenuType] = useState<'FOOD' | 'DRINK'>('FOOD');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [mobileTab, setMobileTab] = useState<'tables' | 'menu' | 'bill'>('tables');
  const [isCategoryCollapsed, setIsCategoryCollapsed] = useState(false);
  const mobileTablesContainerRef = useRef<HTMLDivElement | null>(null);
  const mobileCategoriesScrollRef = useRef<HTMLDivElement | null>(null);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENT'>('PERCENT');
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [openItemModal, setOpenItemModal] = useState<{ isOpen: boolean, type: 'FOOD' | 'DRINK' | null }>({ isOpen: false, type: null });
  const [openItemForm, setOpenItemForm] = useState({ name: '', rate: '' });
  const mobileItemsScrollRef = useRef<HTMLDivElement | null>(null);
  const mobileBillScrollRef = useRef<HTMLDivElement | null>(null);

  const isDrinkCategory = useMemo(() => {
    const drinkNamePattern = /drink|beverage|smoothie|juice|shake|coffee|tea|soda|cola|mocktail/i;
    const byId = new Map<string, boolean>();

    categories.forEach((category) => {
      const isDrink =
        category.type === 'DRINK' ||
        (!category.type && drinkNamePattern.test(category.name || ''));
      byId.set(String(category.id), isDrink);
    });

    return (categoryId: string) => 
      categoryId === 'OPEN_BAR' || 
      categoryId === 'cat_open_bar' || 
      byId.get(String(categoryId)) === true;
  }, [categories]);
  
  const filteredCategories = useMemo(() => {
    const filtered = categories.filter(cat => 
      menuType === 'DRINK' ? cat.type === 'DRINK' : (!cat.type || cat.type === 'FOOD')
    );

    // Keep "Open" categories at the bottom (Open Food / Open Bar)
    const isOpenCategory = (cat: Category) => {
      const id = String(cat.id);
      const name = (cat.name || '').toLowerCase();
      return (
        id === 'cat_open_food' ||
        id === 'OPEN_FOOD' ||
        id === 'cat_open_bar' ||
        id === 'OPEN_BAR' ||
        name === 'open food' ||
        name === 'open bar' ||
        name === 'open drink'
      );
    };

    const normal = filtered.filter(c => !isOpenCategory(c));
    const open = filtered.filter(isOpenCategory);
    return [...normal, ...open];
  }, [categories, menuType]);

  // Ensure selectedCategoryId is always valid when categories change
  useEffect(() => {
    if (filteredCategories.length > 0) {
      // If current selection is empty or doesn't exist in filtered categories, select the first one
      const categoryExists = filteredCategories.some(cat => cat.id === selectedCategoryId);
      if (!selectedCategoryId || !categoryExists) {
        setSelectedCategoryId(filteredCategories[0].id);
      }
    }
  }, [filteredCategories, selectedCategoryId]);

  // Desktop mode is controlled from the tables screen.
  useEffect(() => {
    if (variant !== 'desktop') return;
    setSelectedTableId(selectedTableIdProp ?? null);
    setOrderType(selectedTableIdProp ? 'DINE_IN' : 'PICK_UP');
  }, [variant, selectedTableIdProp]);
  
  // Get current cart based on selected table or default cart for non-dine-in
  const [defaultCart, setDefaultCart] = useState<CartItem[]>([]);
  const [defaultCustomerName, setDefaultCustomerName] = useState('');

  // Helper to update table carts
  const updateTableCart = (tableId: string, updater: (current: TableCart) => TableCart) => {
    const currentCart = normalizeTableCart(tableCarts[tableId]);
    const updated = normalizeTableCart(updater(currentCart));
    onUpdateTableCarts({
      ...tableCarts,
      [tableId]: updated
    });
  };

  const currentCart = useMemo(() => {
    if (orderType === 'DINE_IN' && selectedTableId) {
      return toCartItemsArray(tableCarts[selectedTableId]?.items);
    }
    return defaultCart;
  }, [orderType, selectedTableId, tableCarts, defaultCart]);

  const customerName = useMemo(() => {
    if (orderType === 'DINE_IN' && selectedTableId) {
      return normalizeTableCart(tableCarts[selectedTableId]).customerName;
    }
    return defaultCustomerName;
  }, [orderType, selectedTableId, tableCarts, defaultCustomerName]);

  const setCustomerName = (name: string) => {
    if (orderType === 'DINE_IN' && selectedTableId) {
      updateTableCart(selectedTableId, (cart) => ({
        ...cart,
        customerName: name
      }));
    } else {
      setDefaultCustomerName(name);
    }
  };

  const filteredItems = useMemo(() => {
    const query = menuSearchQuery.trim().toLowerCase();
    if (query) {
      // When searching, show items across all categories
      return menuItems.filter(
        item => item && item.name && item.name.toLowerCase().includes(query)
      );
    }
    const filtered = menuItems.filter(
      item => item && item.id && item.categoryId && String(item.categoryId) === String(selectedCategoryId)
    );
    return filtered;
  }, [selectedCategoryId, menuItems, menuSearchQuery]);




  const handleOpenItemSubmit = () => {
    if (!openItemForm.name || !openItemForm.rate) {
      alert("Please enter Name and Rate");
      return;
    }
    const rateFloat = parseFloat(openItemForm.rate);
    if (isNaN(rateFloat)) {
      alert("Invalid Rate");
      return;
    }

    const timestamp = Date.now();
    const mockItem: MenuItem = {
      id: `open-${openItemModal.type}-${timestamp}`,
      name: openItemForm.name,
      price: rateFloat,
      categoryId: openItemModal.type === 'DRINK' ? 'OPEN_BAR' : 'OPEN_FOOD',
      vegType: 'VEG',
      nonVegPrice: 0,
      vegPrice: 0,
      mlPrices: {},
      hasPortions: false,
      halfPrice: 0
    };

    addToCart(mockItem);
    setOpenItemModal({ isOpen: false, type: null });
    setOpenItemForm({ name: '', rate: '' });
  };

  const handleAddItem = (item: MenuItem) => {
    if (!item) return;
    // If it's a manual open item, trigger modal instead of adding directly
    if (item.id === 'manual-open-food') {
      setOpenItemModal({ isOpen: true, type: 'FOOD' });
      return;
    }
    if (item.id === 'manual-open-bar') {
      setOpenItemModal({ isOpen: true, type: 'DRINK' });
      return;
    }

    // If item has both veg/non-veg options OR portions OR ML sizes, show popup
    if (item.vegType === 'BOTH' || item.hasPortions || (item.mlPrices && Object.keys(item.mlPrices).length > 0)) {
      setOptionsItem(item);
      return;
    }
    addToCart(item);
  };

  const handleItemOptions = (vegChoice: 'VEG' | 'NON_VEG' | 'SEAFOOD' | null, portionChoice: 'HALF' | 'FULL' | null, mlChoice?: string | null) => {
    if (!optionsItem) return;
    addToCart(optionsItem, vegChoice, portionChoice, mlChoice);
    setOptionsItem(null);
  };

  const addToCart = (item: MenuItem, vegChoice?: 'VEG' | 'NON_VEG' | 'SEAFOOD' | null, portionChoice?: 'HALF' | 'FULL' | null, mlChoice?: string | null) => {
    // Create unique id for items with veg choice, portions, and ML size
    const choiceKey = vegChoice ? `-${vegChoice}` : '';
    const portionKey = portionChoice ? `-${portionChoice}` : '';
    const mlKey = mlChoice ? `-${mlChoice}` : '';
    const cartItemId = `${item.id}${choiceKey}${portionKey}${mlKey}`;
    
    // Calculate item price
    let itemPrice = item.price;
    
    // ML price takes precedence for drink items
    if (mlChoice && item.mlPrices && item.mlPrices[mlChoice]) {
      itemPrice = item.mlPrices[mlChoice];
    } else if (vegChoice === 'VEG' && item.vegPrice) {
      itemPrice = item.vegPrice;
    } else if (vegChoice === 'NON_VEG' && item.nonVegPrice) {
      itemPrice = item.nonVegPrice;
    } else if (vegChoice === 'SEAFOOD' && item.seafoodPrice) {
      itemPrice = item.seafoodPrice;
    }
    
    // Apply half price shortcut if applicable
    if (item.hasPortions && portionChoice === 'HALF' && item.halfPrice) {
      itemPrice = item.halfPrice;
    }
    
    const totalItemPrice = itemPrice;
    
    // Append to carts...
    const composeItem = (baseItem: CartItem) => ({ 
      ...baseItem, 
      id: cartItemId, 
      price: totalItemPrice,
      selectedVegChoice: vegChoice || undefined,
      selectedPortion: portionChoice || undefined,
      selectedMl: mlChoice || undefined
    });

    if (orderType === 'DINE_IN' && selectedTableId) {
      const currentItems = toCartItemsArray(tableCarts[selectedTableId]?.items);
      const existing = currentItems.find(i => i.id === cartItemId);
      
      if (existing) {
        updateTableCart(selectedTableId, (cart) => ({
          ...cart,
          items: cart.items.map(i => i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i)
        }));
      } else {
        updateTableCart(selectedTableId, (cart) => ({
          ...cart,
          items: [...cart.items, composeItem({ ...item, quantity: 1 } as CartItem)]
        }));
      }
      
      // Mark table as occupied when items are added
      const table = tables.find(t => t.id === selectedTableId);
      if (table && table.status === 'AVAILABLE') {
        onUpdateTableStatus(selectedTableId, 'OCCUPIED');
      }
    } else {
      setDefaultCart(prev => {
        const existing = prev.find(i => i.id === cartItemId);
        if (existing) {
          return prev.map(i => i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i);
        }
        return [...prev, composeItem({ ...item, quantity: 1 } as CartItem)];
      });
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    if (orderType === 'DINE_IN' && selectedTableId) {
      const currentItems = toCartItemsArray(tableCarts[selectedTableId]?.items);
      const updatedItems = currentItems.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
      
      // If cart is now empty, reset table status to AVAILABLE
      if (updatedItems.length === 0) {
        onUpdateTableStatus(selectedTableId, 'AVAILABLE');
      }
      
      updateTableCart(selectedTableId, (cart) => ({
        ...cart,
        items: updatedItems
      }));
    } else {
      setDefaultCart(prev => prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0));
    }
  };

  const removeFromCart = (id: string) => {
    if (orderType === 'DINE_IN' && selectedTableId) {
      const currentItems = toCartItemsArray(tableCarts[selectedTableId]?.items);
      const updatedItems = currentItems.filter(item => item.id !== id);
      
      // If cart is now empty, reset table status to AVAILABLE
      if (updatedItems.length === 0) {
        onUpdateTableStatus(selectedTableId, 'AVAILABLE');
      }
      
      updateTableCart(selectedTableId, (cart) => ({
        ...cart,
        items: updatedItems
      }));
    } else {
      setDefaultCart(prev => prev.filter(item => item.id !== id));
    }
  };

  const foodSubtotal = currentCart.reduce((acc, item) => {
    const category = categories.find(c => c.id === item.categoryId);
    const isDrink = category?.type === 'DRINK';
    return !isDrink ? acc + (item.price * item.quantity) : acc;
  }, 0);

  const drinkSubtotal = currentCart.reduce((acc, item) => {
    const category = categories.find(c => c.id === item.categoryId);
    const isDrink = category?.type === 'DRINK';
    return isDrink ? acc + (item.price * item.quantity) : acc;
  }, 0);

  const subtotal = foodSubtotal + drinkSubtotal;
  
  // New tax calculation based on taxType
  const taxInfo = currentCart.reduce((acc, item) => {
    const category = categories.find(c => c.id === item.categoryId);
    const taxType = category?.taxType || (category?.type === 'DRINK' ? 'VAT' : 'GST');
    const itemSubtotal = item.price * item.quantity;
    
    if (taxType === 'VAT') {
      acc.vat += itemSubtotal * drinkTaxRate;
    } else if (taxType === 'GST') {
      acc.gst += itemSubtotal * taxRate;
    }
    // MRP has no added tax
    return acc;
  }, { gst: 0, vat: 0 });

  const discountAmount = discountType === 'PERCENT'
    ? foodSubtotal * (discountValue / 100)
    : Math.min(foodSubtotal, discountValue);
  
  const discountedFoodSubtotal = foodSubtotal - discountAmount;
  const discountedSubtotal = discountedFoodSubtotal + drinkSubtotal;
  
  // GST recalculated on discounted food; VAT (on drinks) stays unchanged
  const gst = taxInfo.gst * (discountedFoodSubtotal / (foodSubtotal || 1));
  const vat = taxInfo.vat;
  const tax = gst + vat;
  const total = discountedSubtotal + tax;

  const printReceipt = async (order: Order) => {
    // Compute GST/VAT for this order using category tax types
    const orderTaxInfo = order.items.reduce((acc, it) => {
      const category = categories.find(c => c.id === it.categoryId);
      const taxType = category?.taxType || (category?.type === 'DRINK' ? 'VAT' : 'GST');
      const itemSubtotal = it.price * it.quantity;
      
      if (taxType === 'VAT') {
        acc.vat += itemSubtotal * drinkTaxRate;
      } else if (taxType === 'GST') {
        acc.gst += itemSubtotal * taxRate;
      }
      return acc;
    }, { gst: 0, vat: 0 });

    doIframeReceiptPrint(order, orderTaxInfo.gst, orderTaxInfo.vat);
  };

  const doIframeReceiptPrint = (order: Order, orderGst: number, orderVat: number) => {
    // Fallback: iframe print
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      alert('Unable to create print frame.');
      document.body.removeChild(iframe);
      return;
    }

    const html = `
      <html>
        <head>
          <title>Invoice</title>
          <style>
            @page { margin: 0; size: 80mm auto; }
            @media print {
              @page { margin: 0; }
              body { margin: 0; }
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Arial Black', Arial, sans-serif;
              width: 76mm;
              max-width: 76mm;
              margin: 0 auto;
              padding: 3mm;
              font-size: 14px;
              color: #000 !important;
              line-height: 1.4;
              font-weight: 900;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .center { text-align: center; }
            .bold { font-weight: 900; }
            .line { border-bottom: 2px dashed #000; margin: 6px 0; }
            .header-name { font-size: 18px; font-weight: 900; margin-bottom: 2px; text-transform: uppercase; }
            .row { display: flex; justify-content: space-between; margin: 3px 0; gap: 4px; font-weight: 900; }
            .item-name { flex: 1; min-width: 0; word-break: break-word; font-weight: 900; }
            .qty { width: 24px; text-align: center; font-weight: 900; flex-shrink: 0; }
            .amt { width: 45px; text-align: right; flex-shrink: 0; font-weight: 900; }
            .total-section { font-size: 16px; font-weight: 900; margin-top: 4px; }
            .footer { font-size: 12px; margin-top: 8px; font-weight: 900; }
          </style>
        </head>
        <body>
          <div class="center header-name">${restaurantInfo.name}</div>
          <div class="center">${restaurantInfo.address}</div>
          <div class="center">Tel: ${restaurantInfo.phone}</div>
          <div class="line"></div>
          <div class="center bold" style="font-size: 16px; margin: 5px 0;">TAX INVOICE</div>
          <div class="line"></div>
          <div>Invoice No: ${order.billNo}</div>
          ${order.customerName ? '<div>Cust: ' + order.customerName + '</div>' : ''}
          <div>Date: ${order.date}</div>
          <div>Time: ${order.time}</div>
          <div>Type: ${order.orderType.replace('_', ' ')}</div>
          <div class="line"></div>
          
          <!-- Food Items Section -->
          ${(() => {
            const foodItems = order.items.filter(it => {
              const cat = categories.find(c => c.id === it.categoryId);
              return cat?.type !== 'DRINK';
            });
            if (foodItems.length === 0) return '';
            const foodSub = foodItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
            return `
              <div class="center bold" style="font-size: 12px; margin-top: 4px;">--- FOOD ITEMS ---</div>
              <div class="row bold">
                <span class="item-name">Item</span>
                <span class="qty">Qty</span>
                <span class="amt">Amt</span>
              </div>
              ${foodItems.map(it => `
                <div class="row">
                  <span class="item-name">${it.name}${it.selectedPortion === 'HALF' ? ' (H)' : it.selectedPortion === 'FULL' ? ' (F)' : ''}</span>
                  <span class="qty">${it.quantity}</span>
                  <span class="amt">${(it.price * it.quantity).toFixed(0)}</span>
                </div>
              `).join('')}
              <div class="row bold" style="border-top: 1px solid #000; margin-top: 4px;">
                <span>FOOD TOTAL:</span>
                <span>Rs ${foodSub.toFixed(0)}</span>
              </div>
              <div style="height: 8px;"></div>
            `;
          })()}

          <!-- Drink Items Section -->
          ${(() => {
            const drinkItems = order.items.filter(it => {
              const cat = categories.find(c => c.id === it.categoryId);
              return cat?.type === 'DRINK';
            });
            if (drinkItems.length === 0) return '';
            const drinkSub = drinkItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
            return `
              <div class="center bold" style="font-size: 12px; margin-top: 4px;">--- DRINK ITEMS ---</div>
              <div class="row bold">
                <span class="item-name">Item</span>
                <span class="qty">Qty</span>
                <span class="amt">Amt</span>
              </div>
              ${drinkItems.map(it => `
                <div class="row">
                  <span class="item-name">${it.name}${it.selectedPortion === 'HALF' ? ' (H)' : it.selectedPortion === 'FULL' ? ' (F)' : ''}</span>
                  <span class="qty">${it.quantity}</span>
                  <span class="amt">${(it.price * it.quantity).toFixed(0)}</span>
                </div>
              `).join('')}
              <div class="row bold" style="border-top: 1px solid #000; margin-top: 4px;">
                <span>DRINKS TOTAL:</span>
                <span>Rs ${drinkSub.toFixed(0)}</span>
              </div>
              <div style="height: 8px;"></div>
            `;
          })()}

          <div class="line"></div>
          <div class="row"><span>Subtotal:</span><span>Rs ${order.subtotal.toFixed(0)}</span></div>
          ${order.discountAmount && order.discountAmount > 0 ? `
            <div class="row" style="color: #000;">
              <span>Discount (${order.discountPercent}%):</span>
              <span>-Rs ${order.discountAmount.toFixed(0)}</span>
            </div>
          ` : ''}
          ${orderGst > 0 ? `<div class="row"><span>GST (${(taxRate * 100).toFixed(0)}%):</span><span>Rs ${orderGst.toFixed(0)}</span></div>` : ''}
          ${orderVat > 0 ? `<div class="row"><span>VAT (${(drinkTaxRate * 100).toFixed(0)}%):</span><span>Rs ${orderVat.toFixed(0)}</span></div>` : ''}
          <div class="row"><span>Tax Total:</span><span>Rs ${order.tax.toFixed(0)}</span></div>
          <div class="row bold total-section"><span>OVERALL TOTAL:</span><span>Rs ${order.total.toFixed(0)}</span></div>
          <div class="line"></div>
          <div class="center bold">Paid via ${order.paymentMode}</div>
          <div style="margin-top: 10px; font-size: 12px; font-weight: 900;">
            ${restaurantInfo.gstNo && restaurantInfo.gstNo !== 'NOT SET' ? '<div>GSTIN: ' + restaurantInfo.gstNo + '</div>' : ''}
            ${restaurantInfo.vatNo && restaurantInfo.vatNo !== 'NOT SET' ? '<div>VAT NO: ' + restaurantInfo.vatNo + '</div>' : ''}
            ${restaurantInfo.fssaiNo && restaurantInfo.fssaiNo !== 'NOT SET' ? '<div>FSSAI NO: ' + restaurantInfo.fssaiNo + '</div>' : ''}
          </div>
          <div class="footer center">
            <p class="bold">Thank you!</p>
            <p class="bold">Visit again.</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => {
                window.parent.postMessage('print-done', '*');
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    iframeDoc.write(html);
    iframeDoc.close();

    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'print-done') {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
        window.removeEventListener('message', handleMessage);
      }
    };
    window.addEventListener('message', handleMessage);
    setTimeout(() => {
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
      window.removeEventListener('message', handleMessage);
    }, 300000); // 5 minutes fallback
  };

  const doIframeKotPrint = (selectedTable: Table | undefined) => {
    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const now = new Date();
    const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const printedAt = now.toLocaleString();
    const tableName = selectedTable?.name || 'TAKEAWAY';

    const itemRows = currentCart.map((item) => {
      const optionTags: string[] = [];
      if (item.selectedPortion) optionTags.push(item.selectedPortion === 'HALF' ? 'HALF' : 'FULL');
      if (item.selectedVegChoice) optionTags.push(item.selectedVegChoice);
      if (item.selectedMl) optionTags.push(item.selectedMl);

      return `
        <div class="item-row">
          <div class="item-name">${escapeHtml(item.name.toUpperCase())}</div>
          <div class="item-qty">${item.quantity}</div>
        </div>
        ${optionTags.length ? `<div class="item-option">(${escapeHtml(optionTags.join(' | '))})</div>` : ''}
      `;
    }).join('');

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      alert('Unable to create print frame.');
      document.body.removeChild(iframe);
      return;
    }

    const html = `
      <html>
        <head>
          <title>KOT</title>
          <style>
            @page { margin: 0; size: 80mm auto; }
            @media print {
              @page { margin: 0; }
              body { margin: 0; }
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Courier New', monospace;
              width: 76mm;
              max-width: 76mm;
              margin: 0 auto;
              padding: 3mm 3mm 2mm;
              font-size: 12px;
              line-height: 1.25;
              color: #000;
            }
            .center { text-align: center; }
            .kot-title {
              font-size: 20px;
              font-weight: 900;
              letter-spacing: 1px;
              margin-bottom: 4px;
            }
            .divider {
              border-top: 2px dashed #000;
              margin: 5px 0;
            }
            .meta {
              font-weight: 700;
              margin: 2px 0;
            }
            .head-row,
            .item-row {
              display: flex;
              justify-content: space-between;
              gap: 6px;
            }
            .head-row {
              font-weight: 900;
              margin-top: 4px;
              margin-bottom: 3px;
            }
            .item-row {
              margin: 2px 0;
              font-weight: 700;
            }
            .item-name {
              flex: 1;
              min-width: 0;
              word-break: break-word;
            }
            .item-qty {
              width: 26px;
              text-align: right;
              flex-shrink: 0;
            }
            .item-option {
              font-size: 10px;
              margin: 0 0 2px 6px;
            }
            .printed-at {
              margin-top: 6px;
              font-size: 10px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="center kot-title">K. O. T.</div>
          <div class="divider"></div>
          <div class="meta">TABLE: ${escapeHtml(tableName)}</div>
          ${customerName ? `<div class="meta">CUST: ${escapeHtml(customerName)}</div>` : ''}
          <div class="meta">TIME: ${escapeHtml(timeLabel)}</div>
          <div class="divider"></div>
          <div class="head-row">
            <div>ITEM</div>
            <div class="item-qty">QTY</div>
          </div>
          ${itemRows}
          <div class="divider"></div>
          <div class="printed-at">Printed at ${escapeHtml(printedAt)}</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => {
                window.parent.postMessage('print-done', '*');
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    iframeDoc.write(html);
    iframeDoc.close();

    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'print-done') {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
        window.removeEventListener('message', handleMessage);
      }
    };
    window.addEventListener('message', handleMessage);
    setTimeout(() => {
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
      window.removeEventListener('message', handleMessage);
    }, 300000);
  };

  const printKOT = async () => {
    if (currentCart.length === 0) {
      alert("Please add items to the cart first.");
      return;
    }
    const selectedTable = tables.find(t => t.id === selectedTableId);
    doIframeKotPrint(selectedTable);
  };

  const buildKotPrintLines = (selectedTable: Table | undefined) => {
    const lineWidth = 42;
    const qtyWidth = 4;
    const itemWidth = lineWidth - qtyWidth - 1;

    const padRight = (value: string, width: number) => {
      if (value.length >= width) return value;
      return value + ' '.repeat(width - value.length);
    };

    const padLeft = (value: string, width: number) => {
      if (value.length >= width) return value;
      return ' '.repeat(width - value.length) + value;
    };

    const wrapText = (value: string, width: number) => {
      const words = value.split(/\s+/).filter(Boolean);
      const lines: string[] = [];
      let current = '';
      words.forEach(word => {
        if (!current.length) {
          current = word;
          return;
        }
        if ((current + ' ' + word).length <= width) {
          current = current + ' ' + word;
          return;
        }
        lines.push(current);
        current = word;
      });
      if (current.length) lines.push(current);
      return lines.length ? lines : [''];
    };

    const itemLines: string[] = [];
    currentCart.forEach(it => {
      const baseName = it.name.toUpperCase();
      const lines = wrapText(baseName, itemWidth);
      lines.forEach((line, idx) => {
        const qtyText = idx === 0 ? padLeft(String(it.quantity), qtyWidth) : ' '.repeat(qtyWidth);
        itemLines.push(`${padRight(line, itemWidth)} ${qtyText}`);
      });
      if (it.selectedPortion) {
        itemLines.push(`  (${it.selectedPortion === 'HALF' ? 'HALF' : 'FULL'})`);
      }
      if (it.selectedVegChoice) {
        itemLines.push(`  (${it.selectedVegChoice})`);
      }
      if (it.selectedMl) {
        itemLines.push(`  (${it.selectedMl})`);
      }
    });

    const now = new Date();
    const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const printedAt = now.toLocaleString();

    const lines: string[] = [];
    lines.push('K. O. T.');
    lines.push('------------------------------------------');
    lines.push(`TABLE: ${selectedTable?.name || 'TAKEAWAY'}`);
    if (customerName) {
      lines.push(`Cust: ${customerName}`);
    }
    lines.push(`Time: ${timeLabel}`);
    lines.push('------------------------------------------');
    lines.push(padRight('ITEM', itemWidth) + ' ' + padLeft('QTY', qtyWidth));
    itemLines.forEach(line => lines.push(line));
    lines.push('------------------------------------------');
    lines.push(`Printed at ${printedAt}`);

    return lines;
  };

  const handlePlaceOrder = async (print = false, shouldCheckout = true) => {
    const selectedTableItems = selectedTableId
      ? tableCarts[selectedTableId]?.items || []
      : [];
    const checkoutItems = currentCart.length > 0 ? currentCart : selectedTableItems;
    const effectiveOrderType: OrderType =
      selectedTableId && selectedTableItems.length > 0 ? 'DINE_IN' : orderType;

    if (checkoutItems.length === 0) {
      alert("Please add items to the cart first.");
      return;
    }

    if (effectiveOrderType === 'DINE_IN' && !selectedTableId) {
      alert("Please select a table for dine-in orders.");
      return;
    }

    const checkoutFoodSubtotal = checkoutItems.reduce((acc, item) => {
      const isDrink = isDrinkCategory(item.categoryId);
      return !isDrink ? acc + (item.price * item.quantity) : acc;
    }, 0);

    const checkoutDrinkSubtotal = checkoutItems.reduce((acc, item) => {
      const isDrink = isDrinkCategory(item.categoryId);
      return isDrink ? acc + (item.price * item.quantity) : acc;
    }, 0);

    const checkoutSubtotal = checkoutFoodSubtotal + checkoutDrinkSubtotal;
    const checkoutDiscountAmount = discountType === 'PERCENT'
      ? checkoutFoodSubtotal * (discountValue / 100)
      : Math.min(checkoutFoodSubtotal, discountValue);
    const checkoutDiscountedFood = checkoutFoodSubtotal - checkoutDiscountAmount;
    const checkoutFoodTax = checkoutDiscountedFood * taxRate;
    const checkoutDrinkTax = checkoutDrinkSubtotal * drinkTaxRate;
    const checkoutTax = checkoutFoodTax + checkoutDrinkTax;
    const checkoutTotal = (checkoutDiscountedFood + checkoutDrinkSubtotal) + checkoutTax;

    const selectedTable = tables.find(t => t.id === selectedTableId);
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      billNo: `INV-${billCounter + 1}`, // Sequential preview number
      customerName: (customerName || "").trim() || "Guest",
      tableId: effectiveOrderType === 'DINE_IN' && selectedTableId ? selectedTableId : "",
      tableName: effectiveOrderType === 'DINE_IN' && selectedTable ? selectedTable.name : "",
      date: dateStr,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: [...checkoutItems],
      subtotal: checkoutSubtotal,
      discountPercent: discountType === 'PERCENT' ? discountValue : 0,
      discountAmount: checkoutDiscountAmount,
      tax: checkoutTax,
      total: checkoutTotal,
      paymentMode,
      orderType: effectiveOrderType,
      staffName: 'Admin',
      status: 'COMPLETED'
    };

    if (shouldCheckout) {
      console.log("Finalizing order:", newOrder);
      await onCreateOrder(newOrder);
      console.log("onCreateOrder completed, real billNo:", newOrder.billNo);
    }

    if (print) {
      await printReceipt(newOrder);
    }
    
    if (!shouldCheckout) return; // Exit if we only wanted to print

    // Checkout finalizes the order, clears cart context, and returns to tables.
    if (selectedTableId && (orderType === 'DINE_IN' || (selectedTableId && toCartItemsArray(tableCarts[selectedTableId]?.items).length > 0))) {
      updateTableCart(selectedTableId, () => ({ items: [], customerName: '' }));
      onUpdateTableStatus(selectedTableId, 'AVAILABLE');
      setSelectedTableId(null);
      if (variant === 'desktop') {
        onBackToTables?.();
      } else {
        setMobileTab('tables');
      }
    } else {
      setDefaultCart([]);
      setDefaultCustomerName('');
      setSelectedTableId(null);
      if (variant === 'mobile') {
        setMobileTab('menu');
      }
    }
  };
  // Get table item count for badges
  const getTableItemCount = (tableId: string) => {
    return tableCarts[tableId]?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  const scrollElementToTop = (element: HTMLElement | null) => {
    if (!element) return;
    element.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMobileScrollToTop = () => {
    if (mobileTab === 'tables') {
      const tablesScroller = mobileTablesContainerRef.current?.querySelector('[data-mobile-scroll="tables-grid"]') as HTMLElement | null;
      scrollElementToTop(tablesScroller ?? mobileTablesContainerRef.current);
      return;
    }

    if (mobileTab === 'menu') {
      scrollElementToTop(mobileCategoriesScrollRef.current);
      scrollElementToTop(mobileItemsScrollRef.current);
      return;
    }

    if (mobileTab === 'bill') {
      scrollElementToTop(mobileBillScrollRef.current);
    }
  };

  if (variant === 'mobile') {
    const selectedTable = selectedTableId ? tables.find(t => t.id === selectedTableId) : undefined;

    return (
      <div className="flex flex-col h-full min-h-0 overflow-hidden bg-gray-100 pb-16">
        {/* Item Options Popup (Veg/Non-Veg + Addons) */}
        {optionsItem && (
          <ItemOptionsPopup
            item={optionsItem}
            onConfirm={handleItemOptions}
            onClose={() => setOptionsItem(null)}
          />
        )}

        <div className="bg-white border-b shadow-sm px-4 py-3 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#F57C00]" />
              <span className="text-xs font-black text-gray-700 uppercase tracking-wider">
                {selectedTable ? `Table ${selectedTable.name}` : 'Select Table'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsCategoryCollapsed(!isCategoryCollapsed)}
              className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full"
            >
              {isCategoryCollapsed ? 'Show Categories' : 'Hide Categories'}
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setMenuType('FOOD')}
              className={`flex-1 py-2 rounded-lg font-black text-xs transition-all border ${
                menuType === 'FOOD' ? 'bg-orange-100 text-[#F57C00] border-[#F57C00]' : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              FOOD
            </button>
            <button
              type="button"
              onClick={() => setMenuType('DRINK')}
              className={`flex-1 py-2 rounded-lg font-black text-xs transition-all border ${
                menuType === 'DRINK' ? 'bg-orange-100 text-[#F57C00] border-[#F57C00]' : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              DRINKS
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          {mobileTab === 'tables' && (
            <div
              ref={mobileTablesContainerRef}
              className="h-full min-h-0 overflow-hidden"
              style={{ overscrollBehaviorY: 'none', touchAction: 'pan-y' }}
            >
              <TablesGrid
                tables={tables}
                floors={floors}
                tableCarts={tableCarts}
                selectedTableId={selectedTableId}
                onSelectTable={(tableId) => {
                  setSelectedTableId(tableId);
                  setOrderType('DINE_IN');
                  setMobileTab('menu');
                }}
              />
            </div>
          )}

          {mobileTab === 'menu' && (
            <div className="flex h-full min-h-0">
              <div
                className={`bg-white border-r transition-all duration-200 ${
                  isCategoryCollapsed ? 'w-12' : 'w-28'
                }`}
                style={{ minHeight: 0 }}
              >
                <div
                  ref={mobileCategoriesScrollRef}
                  className="h-full overflow-y-auto custom-scrollbar"
                  style={{ WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'none', touchAction: 'pan-y' }}
                >
                  {filteredCategories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`w-full py-3 px-2 text-left border-b text-[10px] font-black uppercase tracking-tight ${
                        selectedCategoryId === cat.id
                          ? 'bg-orange-50 text-[#F57C00]'
                          : 'text-gray-600'
                      }`}
                    >
                      <span className={isCategoryCollapsed ? 'block text-center' : ''}>
                        {isCategoryCollapsed ? cat.name.slice(0, 2) : cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div
                ref={mobileItemsScrollRef}
                className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-gray-50 p-3"
                style={{ WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'none', touchAction: 'pan-y' }}
              >
                {/* Mobile Search Bar */}
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={menuSearchQuery}
                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#F57C00] outline-none"
                  />
                </div>
                {!selectedTableId ? (
                  <div className="h-full flex items-center justify-center text-gray-400 font-bold text-sm">
                    Select a table to start adding items
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border-2 border-dashed border-gray-300 mx-2 mt-4">
                    <h3 className="text-lg font-black text-gray-900 mb-2">No Categories</h3>
                    <p className="text-xs text-gray-500">
                      Go to Configuration to add {menuType === 'DRINK' ? 'drink' : 'food'} categories or reset database.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredItems.map(item => {
                      const hasMl = item.mlPrices && Object.keys(item.mlPrices).length > 0;
                      const itemHasOptions = item.vegType === 'BOTH' || item.hasPortions || hasMl;
                      const cartEntry = !itemHasOptions ? currentCart.find(ci => ci.id === item.id) : undefined;
                      return (
                        <div key={item.id} className="bg-white rounded-2xl border shadow-sm p-3 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  item.isVeg || item.vegType === 'VEG' ? 'bg-green-500' : 'bg-red-500'
                                }`}
                              />
                              <h3 className="font-bold text-sm text-gray-900 truncate">{item.name}</h3>
                            </div>
                            {item.quantityStr && (
                              <div className="text-[10px] text-gray-400 font-bold mt-1">
                                {item.quantityStr}
                              </div>
                            )}
                            <div className="text-xs font-black text-gray-800 mt-1">
                              {hasMl
                                ? `₹${Math.min(...(Object.values(item.mlPrices!) as number[]))} - ₹${Math.max(...(Object.values(item.mlPrices!) as number[]))}`
                                : item.vegType === 'BOTH' ? `Veg ₹${item.vegPrice} / Non-Veg ₹${item.nonVegPrice}` : `₹${item.price}`}
                            </div>
                          </div>

                          {itemHasOptions ? (
                            <button
                              type="button"
                              onClick={() => handleAddItem(item)}
                              className="px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-black"
                            >
                              ADD
                            </button>
                          ) : cartEntry ? (
                            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-2 py-1">
                              <button
                                onClick={() => updateQuantity(cartEntry.id, -1)}
                                className="text-green-700"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-sm font-black text-green-700">{cartEntry.quantity}</span>
                              <button
                                onClick={() => updateQuantity(cartEntry.id, 1)}
                                className="text-green-700"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddItem(item)}
                              className="px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-black"
                            >
                              ADD
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {filteredItems.length === 0 && (
                      <div className="text-center py-10 text-gray-400 font-bold text-sm">
                        No items in this category
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {mobileTab === 'bill' && (
            <div
              ref={mobileBillScrollRef}
              className="h-full min-h-0 overflow-y-auto p-4"
              style={{ WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'none', touchAction: 'pan-y' }}
            >
              {currentCart.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <ShoppingBag size={52} className="mx-auto mb-3 opacity-30" />
                  <p className="font-bold">Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentCart.map(item => (
                    <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">{item.name}</div>
                        <div className="text-[11px] text-gray-500 font-medium">₹{item.price} each</div>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 border rounded-xl p-1 shadow-sm">
                        <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-400">
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center font-black text-sm text-gray-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-400">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>GST</span>
                      <span>₹{gst.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>VAT</span>
                      <span>₹{vat.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tax Total</span>
                      <span>₹{tax.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-black mt-2">
                      <span>Total</span>
                      <span className="text-[#F57C00]">₹{total.toFixed(0)}</span>
                    </div>
                  </div>

                  {currentCart.length > 0 && (
                    <button
                      onClick={() => printKOT()}
                      className="w-full mt-4 flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-black transition-all shadow-lg active:scale-95"
                    >
                      <ChefHat size={20} /> PRINT KOT
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleMobileScrollToTop}
          aria-label="Scroll to top"
          className="fixed left-3 bottom-20 z-[60] w-11 h-11 rounded-full bg-[#F57C00] text-white shadow-lg shadow-orange-200 flex items-center justify-center"
        >
          <ChevronUp size={20} />
        </button>

        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center justify-around px-2 z-50">
          <button
            onClick={() => setMobileTab('tables')}
            className={`flex flex-col items-center justify-center w-16 h-full gap-1 ${
              mobileTab === 'tables' ? 'text-[#F57C00] font-bold' : 'text-gray-400'
            }`}
          >
            <UtensilsCrossed size={18} />
            <span className="text-[10px]">Tables</span>
          </button>
          <button
            onClick={() => setMobileTab('menu')}
            className={`flex flex-col items-center justify-center w-16 h-full gap-1 ${
              mobileTab === 'menu' ? 'text-[#F57C00] font-bold' : 'text-gray-400'
            }`}
          >
            <ShoppingBag size={18} />
            <span className="text-[10px]">Menu</span>
          </button>
          <button
            onClick={() => setMobileTab('bill')}
            className={`flex flex-col items-center justify-center w-16 h-full gap-1 ${
              mobileTab === 'bill' ? 'text-[#F57C00] font-bold' : 'text-gray-400'
            }`}
          >
            <ShoppingCart size={18} />
            <span className="text-[10px]">Bill</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
      {/* Item Options Popup (Veg/Non-Veg + Addons) */}
      {optionsItem && (
        <ItemOptionsPopup
          item={optionsItem}
          onConfirm={handleItemOptions}
          onClose={() => setOptionsItem(null)}
        />
      )}

      {variant === 'desktop' && (
        <div className="bg-white border-b shadow-sm px-4 py-3 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onBackToTables?.()}
              disabled={!onBackToTables}
              className="flex items-center gap-2 px-3 py-2 rounded-xl font-black text-xs transition-all border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={14} />
              Tables
            </button>

            <div className="flex-1 text-center">
              <div className="text-sm font-black text-gray-900">
                {selectedTableId
                  ? tables.find(t => t.id === selectedTableId)?.name || 'Table'
                  : 'Select Table'}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">
                Billing
              </div>
            </div>

            <div className="w-[90px]" />
          </div>
        </div>
      )}

      {variant !== 'desktop' && (
        <>
          {/* Table Selection Bar */}
          <div className="bg-white border-b shadow-sm px-4 py-3 shrink-0">
        <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-1">
          <div className="flex items-center gap-2 shrink-0">
            <Users size={20} className="text-[#F57C00]" />
            <span className="text-sm font-black text-gray-700 uppercase tracking-wider">Tables</span>
          </div>
          <div className="h-6 w-px bg-gray-300" />
          {tables.map(table => {
            const itemCount = getTableItemCount(table.id);
            const isSelected = selectedTableId === table.id;
            const isOccupied = table.status === 'OCCUPIED' || itemCount > 0;
            
            return (
              <button
                key={table.id}
                onClick={() => {
                  setSelectedTableId(table.id);
                  setOrderType('DINE_IN');
                }}
                className={`relative px-4 py-2 rounded-xl font-black text-sm transition-all shrink-0 ${
                  isSelected 
                    ? 'bg-[#F57C00] text-white shadow-lg shadow-orange-200' 
                    : isOccupied
                      ? 'bg-orange-100 text-[#F57C00] border-2 border-[#F57C00]'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {table.name}
                {itemCount > 0 && (
                  <span className={`absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                    isSelected ? 'bg-white text-[#F57C00]' : 'bg-[#F57C00] text-white'
                  }`}>
                    {itemCount}
                  </span>
                )}
              </button>
            );
          })}
          {selectedTableId && (
            <button
              onClick={() => setSelectedTableId(null)}
              className="px-3 py-2 rounded-xl font-bold text-xs text-gray-500 hover:bg-gray-100 transition-all shrink-0"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>
        </>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="w-32 md:w-48 bg-white border-r flex flex-col shrink-0 shadow-sm z-20">
          <div className="p-3 border-b flex flex-col gap-2">
            <button
              onClick={() => setMenuType('FOOD')}
              className={`w-full py-2 rounded-lg font-black text-xs transition-all border ${
                menuType === 'FOOD' ? 'bg-orange-100 text-[#F57C00] border-[#F57C00]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              FOOD
            </button>
            <button
              onClick={() => setMenuType('DRINK')}
              className={`w-full py-2 rounded-lg font-black text-xs transition-all border ${
                menuType === 'DRINK' ? 'bg-orange-100 text-[#F57C00] border-[#F57C00]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              DRINKS
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`w-full py-3.5 px-4 text-left transition-all flex items-center gap-3 group border-b border-gray-100 ${
                  selectedCategoryId === cat.id 
                    ? 'bg-orange-50 border-r-4 border-r-[#F57C00] text-[#F57C00]' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className={`text-xs md:text-sm font-bold uppercase tracking-tight ${selectedCategoryId === cat.id ? 'text-[#F57C00]' : 'text-gray-700'}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto custom-scrollbar">
          {/* Desktop Search Bar */}
          <div className="relative mb-4 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={menuSearchQuery}
              onChange={(e) => setMenuSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#F57C00] focus:border-[#F57C00] outline-none transition-all"
            />
          </div>
          
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <h3 className="text-xl font-black text-gray-900 mb-2">No Categories Found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              There are no {menuType === 'DRINK' ? 'drink' : 'food'} categories in the database. 
              Please go to Configuration to add them or reset the database.
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filteredItems.map(item => {
            if (!item) return null;
            return (
              <button
                key={item.id}
              onClick={() => handleAddItem(item)}
              className="bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-[#F57C00] hover:shadow-lg transition-all p-4 text-left relative group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-3">
                {item.vegType === 'BOTH' ? (
                  <span className="w-4 h-4 rounded-full border-2 p-[2px]" style={{borderImage: 'linear-gradient(90deg, #16a34a 50%, #dc2626 50%) 1'}}>
                    <div className="w-full h-full rounded-full" style={{background: 'linear-gradient(90deg, #16a34a 50%, #dc2626 50%)'}}></div>
                  </span>
                ) : (
                  <span className={`w-4 h-4 rounded-full border-2 ${item.vegType === 'VEG' || item.isVeg ? 'border-green-600 p-[2px]' : 'border-red-600 p-[2px]'}`}>
                    <div className={`w-full h-full rounded-full ${item.vegType === 'VEG' || item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                  </span>
                )}
                {item.mlPrices && Object.keys(item.mlPrices).length > 0 ? (
                  <span className="text-xs font-black text-purple-600 group-hover:text-[#F57C00]">₹{Math.min(...(Object.values(item.mlPrices) as number[]))} - ₹{Math.max(...(Object.values(item.mlPrices) as number[]))}</span>
                ) : item.vegType === 'BOTH' ? (
                  <div className="text-right">
                    <span className="text-xs font-black text-green-600">V:₹{item.vegPrice}</span>
                    <span className="text-gray-400 mx-0.5">/</span>
                    <span className="text-xs font-black text-red-600">NV:₹{item.nonVegPrice}</span>
                  </div>
                ) : (
                  <span className="text-sm font-black text-gray-900 group-hover:text-[#F57C00]">₹{item.price}</span>
                )}
              </div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base mb-1 line-clamp-2 flex-1">{item.name}</h3>
              <div className="mt-3 flex justify-end">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-[#F57C00] group-hover:text-white transition-all shadow-sm">
                  <Plus size={18} />
                </div>
              </div>
            </button>
            );
          })}
        </div>
        )}
      </div>
      </div>
      </div>

      <div className="w-[30%] bg-white border-l shadow-2xl flex flex-col shrink-0 z-10 h-full overflow-hidden">
        {/* Table indicator for Dine In */}
        {orderType === 'DINE_IN' && selectedTableId && (
          <div className="px-4 py-2 bg-[#F57C00] text-white text-center">
            <span className="font-black text-sm">
              {tables.find(t => t.id === selectedTableId)?.name || 'Table'} - Active Order
            </span>
          </div>
        )}
        
        <div className="flex p-3 bg-gray-100 border-b gap-1">
          <OrderTypeTab active={orderType === 'DINE_IN'} onClick={() => setOrderType('DINE_IN')} label="Dine In" icon={<UtensilsCrossed size={16} />} />
          <OrderTypeTab active={orderType === 'DELIVERY'} onClick={() => setOrderType('DELIVERY')} label="Delivery" icon={<Truck size={16} />} />
          <OrderTypeTab active={orderType === 'PICK_UP'} onClick={() => setOrderType('PICK_UP')} label="Pick Up" icon={<Package size={16} />} />
        </div>

        <div className="p-4 border-b bg-white">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Customer Name / Order Note"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#F57C00] outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          {currentCart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-40">
              <ShoppingBag size={64} strokeWidth={1} className="mb-3" />
              <p className="font-bold text-lg">No Items Added</p>
              {orderType === 'DINE_IN' && !selectedTableId && (
                <p className="text-sm mt-2">Select a table to start</p>
              )}
            </div>
          ) : (
            currentCart.map(item => (
              <div key={item.id} className="flex gap-3 items-center group animate-in fade-in slide-in-from-right-2 duration-200">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`shrink-0 w-2 h-2 rounded-full ${item.selectedVegChoice === 'SEAFOOD' ? 'bg-blue-500' : (item.isVeg || item.selectedVegChoice === 'VEG') ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <h4 className="font-bold text-gray-800 truncate text-sm">
                      {item.name}
                      {item.selectedPortion && (
                        <span className="ml-1 opacity-70">
                          ({item.selectedPortion === 'HALF' ? 'Half' : 'Full'})
                        </span>
                      )}
                      {item.selectedVegChoice && (
                        <span className={`ml-1 text-[10px] font-black ${item.selectedVegChoice === 'VEG' ? 'text-green-600' : item.selectedVegChoice === 'SEAFOOD' ? 'text-blue-600' : 'text-red-600'}`}>
                          ({item.selectedVegChoice === 'VEG' ? 'V' : item.selectedVegChoice === 'SEAFOOD' ? 'SF' : 'NV'})
                        </span>
                      )}
                      {item.selectedMl && (
                        <span className="ml-1 text-[10px] font-black text-purple-600">
                          ({item.selectedMl})
                        </span>
                      )}
                    </h4>
                  </div>

                  <p className="text-[11px] text-gray-500 font-medium">₹{item.price} per unit</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 border rounded-xl p-1 shadow-sm">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-[#F57C00] text-gray-400"><Minus size={14} /></button>
                  <span className="w-8 text-center font-black text-sm text-gray-900">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-[#F57C00] text-gray-400"><Plus size={14} /></button>
                </div>
                <div className="w-16 text-right font-black text-sm text-gray-900">₹{item.price * item.quantity}</div>
                <button onClick={() => removeFromCart(item.id)} className="text-gray-200 hover:text-black transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-5 border-t bg-gray-50 space-y-4 rounded-t-3xl shadow-top shrink-0 relative">
          {/* Toggle Button / Arrow */}
          <button 
            onClick={() => setShowBillDetails(!showBillDetails)}
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-white border-2 border-orange-100 shadow-lg rounded-full flex items-center justify-center text-[#F57C00] hover:bg-orange-50 hover:scale-110 active:scale-95 transition-all z-20"
          >
            {showBillDetails ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
          </button>

          {showBillDetails && (
            <>
              {/* Discount Section */}
              <div className="space-y-3 p-3 bg-white rounded-xl border border-dashed border-orange-200 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#F57C00]">
                    <TrendingUp size={16} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Discount Tab</span>
                  </div>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setDiscountType('FIXED')}
                      className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${discountType === 'FIXED' ? 'bg-white text-[#F57C00] shadow-sm' : 'text-gray-400 font-bold'}`}
                    >
                      FIXED (₹)
                    </button>
                    <button 
                      onClick={() => setDiscountType('PERCENT')}
                      className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${discountType === 'PERCENT' ? 'bg-white text-[#F57C00] shadow-sm' : 'text-gray-400 font-bold'}`}
                    >
                      PERCENT (%)
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400">Value:</span>
                  <input 
                    type="number" 
                    value={discountValue || ''} 
                    onChange={(e) => setDiscountValue(Math.max(0, discountType === 'PERCENT' ? Math.min(100, Number(e.target.value) || 0) : (Number(e.target.value) || 0)))}
                    placeholder="0"
                    className="flex-1 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-lg text-sm font-black text-[#F57C00] outline-none focus:ring-2 focus:ring-[#F57C00]"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-bold uppercase tracking-wider border-b pb-3 border-gray-100 animate-in fade-in duration-500">
                <div className="flex justify-between text-gray-400 font-medium">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discountType === 'PERCENT' ? `${discountValue}%` : `Fixed`})</span>
                    <span>-₹{discountAmount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400 font-medium">
                  <span>GST (Food ${(taxRate * 100).toFixed(0)}%)</span>
                  <span>₹{gst.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-gray-400 font-medium">
                  <span>VAT (Drinks ${(drinkTaxRate * 100).toFixed(0)}%)</span>
                  <span>₹{vat.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-gray-400 font-medium">
                  <span>Tax Total</span>
                  <span>₹{tax.toFixed(0)}</span>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between text-2xl font-black text-gray-900 pt-1">
            <span className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black leading-none mb-1">Total Payable</span>
              <span>Total</span>
            </span>
            <span className="text-[#F57C00] flex flex-col items-end">
              <span className="text-sm text-gray-400 font-medium leading-none mb-1">
                {currentCart.length} {currentCart.length === 1 ? 'Item' : 'Items'}
              </span>
              ₹{total.toFixed(0)}
            </span>
          </div>

          <div className="flex gap-2">
            <PaymentTab active={paymentMode === 'CASH'} onClick={() => setPaymentMode('CASH')} icon={<Banknote size={16} />} label="Cash" />
            <PaymentTab active={paymentMode === 'CARD'} onClick={() => setPaymentMode('CARD')} icon={<CreditCard size={16} />} label="Card" />
            <PaymentTab active={paymentMode === 'UPI'} onClick={() => setPaymentMode('UPI')} icon={<Smartphone size={16} />} label="UPI" />
            <PaymentTab active={paymentMode === 'OTHER'} onClick={() => setPaymentMode('OTHER')} icon={<Wallet size={16} />} label="Others" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => printKOT()}
              className="flex flex-col items-center justify-center gap-1 bg-indigo-600 text-white py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
            >
              <ChefHat size={18} /> 
              <span className="text-[10px] uppercase tracking-tighter">KOT</span>
            </button>
            <button 
              onClick={() => handlePlaceOrder(false, true)}
              className="flex flex-col items-center justify-center gap-1 bg-[#262626] text-white py-3 rounded-2xl font-black hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
            >
              <ShoppingCart size={18} />
              <span className="text-[10px] uppercase tracking-tighter">Checkout</span>
            </button>
            <button 
              onClick={() => handlePlaceOrder(true, false)}
              className="flex flex-col items-center justify-center gap-1 bg-[#F57C00] text-white py-3 rounded-2xl font-black hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-200"
            >
              <CheckCircle size={18} />
              <span className="text-[10px] uppercase tracking-tighter">Print Bill</span>
            </button>
          </div>
        </div>
      </div>
      {/* Open Item Modal */}
      {openItemModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-6 ${openItemModal.type === 'DRINK' ? 'bg-gray-900' : 'bg-orange-600'} text-white`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Add Open {openItemModal.type === 'DRINK' ? 'Bar' : 'Food'}</h3>
                  <p className="text-xs font-bold opacity-80 uppercase mt-1 tracking-widest">Manual Item Entry</p>
                </div>
                <button 
                  onClick={() => setOpenItemModal({ isOpen: false, type: null })}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Item Name</label>
                <input 
                  autoFocus
                  type="text"
                  placeholder="e.g. Special Platter"
                  value={openItemForm.name}
                  onChange={(e) => setOpenItemForm({...openItemForm, name: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-lg font-bold text-gray-900 focus:ring-4 focus:ring-orange-50 focus:border-orange-500 outline-none transition-all placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rate (₹)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-gray-400">₹</span>
                  <input 
                    type="number"
                    placeholder="0"
                    value={openItemForm.rate}
                    onChange={(e) => setOpenItemForm({...openItemForm, rate: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-10 pr-5 py-4 text-2xl font-black text-gray-900 focus:ring-4 focus:ring-orange-50 focus:border-orange-500 outline-none transition-all placeholder:text-gray-300"
                    onKeyDown={(e) => e.key === 'Enter' && handleOpenItemSubmit()}
                  />
                </div>
              </div>

              <button 
                onClick={handleOpenItemSubmit}
                className={`w-full py-5 rounded-2xl font-black text-white text-lg shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                  openItemModal.type === 'DRINK' ? 'bg-gray-900 hover:bg-black' : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                ADD TO BILL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrderTypeTab: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-1 rounded-xl text-xs font-black transition-all ${active ? 'bg-white text-[#F57C00] shadow-md border-b-2 border-[#F57C00]' : 'text-gray-500 hover:text-gray-700'}`}>{icon} {label}</button>
);

const PaymentTab: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-2xl border-2 transition-all ${active ? 'border-[#F57C00] bg-orange-50 text-[#F57C00] shadow-sm' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>{icon}<span className="text-[10px] font-black uppercase tracking-widest">{label}</span></button>
);

export default BillingScreen;
