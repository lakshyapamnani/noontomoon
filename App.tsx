
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Menu as MenuIcon, 
  Bell, 
  Printer, 
  FileText,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Layers,
  Cloud,
  CloudOff,
  Home,
  ClipboardList,
  PieChart,
  LayoutGrid,
  TrendingUp
} from 'lucide-react';
import { 
  MenuItem, 
  Category, 
  Order, 
  OrderStatus, 
  RestaurantInfo,
  Table,
  Floor,
  PrinterSettings
} from './types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_MENU_ITEMS, 
  TAX_RATE as INITIAL_TAX_RATE,
  DRINK_TAX_RATE as INITIAL_DRINK_TAX_RATE,
  INITIAL_RESTAURANT_INFO
} from './constants';
import BillingScreen from './components/BillingScreen';
import Dashboard from './components/Dashboard';
import OrdersList from './components/OrdersList';
import Reports from './components/Reports';
import MenuManagement from './components/MenuManagement';
import TablesGrid from './components/TablesGrid';
import { printEscPos, buildRunningBillLines } from './components/printer';

// Firebase imports
import { db, auth } from './firebase';
import { ref, onValue, set, push, update, get } from 'firebase/database';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

type ActiveScreen = 
  | 'TABLES'
  | 'BILLING' 
  | 'DASHBOARD' 
  | 'LIVE_ORDERS' 
  | 'COMPLETED_ORDERS' 
  | 'CANCELLED_ORDERS' 
  | 'REPORTS' 
  | 'MENU_CONFIG'
  | 'ALL_ORDERS';

const ONBOARDING_STEPS = [
  {
    title: 'Open Navigation',
    message: 'Click the top-left menu icon (three lines) to open navigation.',
    indicator: 'Top-left corner',
  },
  {
    title: 'Go To Configuration',
    message: 'From the sidebar, open Configuration to set up your restaurant data.',
    indicator: 'Sidebar -> Configuration',
  },
  {
    title: 'Add Categories First',
    message: 'Inside Configuration, create categories first (for example: Starters, Main Course, Drinks).',
    indicator: 'Configuration -> Categories tab',
  },
  {
    title: 'Add Menu Items',
    message: 'Now add items and assign each item to a category so they appear in billing.',
    indicator: 'Configuration -> Menu Items tab',
  },
  {
    title: 'Start Billing',
    message: 'After setup, go back to Billing and start creating orders.',
    indicator: 'Billing screen',
  },
] as const;

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('TABLES');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  // Check if URL path is /mobile for dedicated mobile view
  const [isMobileRoute, setIsMobileRoute] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    return path === '/mobile' || path === '/mobile/' || path.startsWith('/mobile');
  });
  const [mobileTab, setMobileTab] = useState<'analytics' | 'orders' | 'bills' | 'reports' | 'billing' | 'tablesConfig'>('billing');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  
  // States with Local Storage fallback
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('drona_categories');
    return saved ? JSON.parse(saved) : [];
  });
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('drona_menu_items');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState<Order[]>([]);  // Orders are stored in Firebase only
  const [billCounter, setBillCounter] = useState<number>(0);  // Sequential bill counter synced from Firebase
  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('drona_tables');
    return saved ? JSON.parse(saved) : [];
  });
  const [floors, setFloors] = useState<Floor[]>(() => {
    const saved = localStorage.getItem('drona_floors');
    return saved ? JSON.parse(saved) : [];
  });

  const [tableCarts, setTableCarts] = useState<Record<string, { items: any[]; customerName: string }>>(() => {
    const saved = localStorage.getItem('drona_table_carts');
    return saved ? JSON.parse(saved) : {};
  });
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [taxRate, setTaxRate] = useState(() => {
    const saved = localStorage.getItem('drona_tax_rate');
    return saved ? parseFloat(saved) : INITIAL_TAX_RATE;
  });
  const [drinkTaxRate, setDrinkTaxRate] = useState(() => {
    const saved = localStorage.getItem('drona_drink_tax_rate');
    return saved ? parseFloat(saved) : INITIAL_DRINK_TAX_RATE;
  });
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo>(() => {
    const saved = localStorage.getItem('drona_restaurant_info');
    return saved ? JSON.parse(saved) : INITIAL_RESTAURANT_INFO;
  });
  const [printerSettings, setPrinterSettings] = useState<PrinterSettings>(() => {
    const saved = localStorage.getItem('drona_printer_settings');
    return saved ? JSON.parse(saved) : { printerWidth: 80, useSamePrinter: false };
  });

  const buildRecordById = (items: Array<{ id: string }>) => {
    return items.reduce<Record<string, unknown>>((acc, item) => {
      if (item && item.id) {
        acc[item.id] = item;
      }
      return acc;
    }, {});
  };

  const sortTables = (tableArray: Table[]) => {
    return [...tableArray].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
  };

  const normalizeTableCarts = (value: unknown): Record<string, { items: any[]; customerName: string }> => {
    if (!value || typeof value !== 'object') return {};
    const raw = value as Record<string, any>;
    const normalized: Record<string, { items: any[]; customerName: string }> = {};

    Object.entries(raw).forEach(([tableId, cart]) => {
      const itemsRaw = cart?.items;
      const items = Array.isArray(itemsRaw)
        ? itemsRaw
        : itemsRaw && typeof itemsRaw === 'object'
          ? Object.values(itemsRaw)
          : [];
      const customerName = typeof cart?.customerName === 'string' ? cart.customerName : '';
      normalized[tableId] = { items, customerName };
    });

    return normalized;
  };

  const sanitizeForFirebase = <T,>(value: T): T => {
    return JSON.parse(JSON.stringify(value));
  };

  // Connectivity and Route Listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      setIsMobileRoute(path === '/mobile' || path === '/mobile/' || path.startsWith('/mobile'));
    };
    
    // Check on mount as well
    const path = window.location.pathname.toLowerCase();
    if (path === '/mobile' || path === '/mobile/' || path.startsWith('/mobile')) {
      setIsMobileRoute(true);
    }
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!isMobileRoute) return;

    const prevBodyOverscroll = document.body.style.overscrollBehaviorY;
    const prevHtmlOverscroll = document.documentElement.style.overscrollBehaviorY;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    let touchStartY = 0;

    const getScrollableAncestor = (element: Element | null): HTMLElement | null => {
      let current = element;
      while (current && current !== document.body) {
        if (current instanceof HTMLElement) {
          const style = window.getComputedStyle(current);
          const canScrollY =
            (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
            current.scrollHeight > current.clientHeight;
          if (canScrollY) {
            return current;
          }
        }
        current = current.parentElement;
      }
      return null;
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        touchStartY = event.touches[0].clientY;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;

      const currentY = event.touches[0].clientY;
      const pullingDown = currentY > touchStartY;
      const pushingUp = currentY < touchStartY;
      const target = event.target as Element | null;
      const scroller = getScrollableAncestor(target);

      if (!scroller) {
        // No scroll container under finger, block viewport pull-to-refresh.
        if (pullingDown) {
          event.preventDefault();
        }
        return;
      }

      const atTop = scroller.scrollTop <= 0;
      const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;

      // Stop scroll chaining to viewport edges that triggers browser refresh/bounce.
      if ((pullingDown && atTop) || (pushingUp && atBottom)) {
        event.preventDefault();
      }
    };

    // Prevent browser pull-to-refresh from hijacking in-app vertical scroll.
    document.body.style.overscrollBehaviorY = 'none';
    document.documentElement.style.overscrollBehaviorY = 'none';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.body.style.overscrollBehaviorY = prevBodyOverscroll;
      document.documentElement.style.overscrollBehaviorY = prevHtmlOverscroll;
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMobileRoute]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear local storage on logout
      localStorage.removeItem('drona_categories');
      localStorage.removeItem('drona_menu_items');
      localStorage.removeItem('drona_tables');
      localStorage.removeItem('drona_floors');

      localStorage.removeItem('drona_table_carts');
      localStorage.removeItem('drona_tax_rate');
      localStorage.removeItem('drona_restaurant_info');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Helper to get shared Firebase path (auth removed)
  const userPath = (path: string) => `users/public/${path}`;

  const markOnboardingDone = async () => {
    try {
      await set(ref(db, userPath('meta/onboardingCompleted')), true);
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  };

  const handleOnboardingNext = async () => {
    const currentStep = onboardingStep;
    if (currentStep === 0) {
      setIsSidebarOpen(true);
    }
    if (currentStep === 1) {
      setActiveScreen('MENU_CONFIG');
      setIsSidebarOpen(false);
    }
    if (currentStep === ONBOARDING_STEPS.length - 1) {
      setShowOnboarding(false);
      await markOnboardingDone();
      return;
    }
    setOnboardingStep((prev) => prev + 1);
  };

  const handleOnboardingSkip = async () => {
    setShowOnboarding(false);
    await markOnboardingDone();
  };

  // Initialize user settings if empty (do not auto-seed menu/category sample data)
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const settingsRef = ref(db, userPath('settings'));
        onValue(settingsRef, async (snapshot) => {
          if (!snapshot.exists()) {
            const savedTax = localStorage.getItem('drona_tax_rate');
            const taxRateVal = savedTax ? parseFloat(savedTax) : INITIAL_TAX_RATE;
            const savedDrinkTax = localStorage.getItem('drona_drink_tax_rate');
            const drinkTaxRateVal = savedDrinkTax ? parseFloat(savedDrinkTax) : 0;
            const restaurantVal = { 
              name: user?.displayName || 'NOON TO MOON CAFE', 
              phone: '+91 9876543210', 
              address: '123 Main Street, Food Park, City' 
            };
            await set(settingsRef, { taxRate: taxRateVal, drinkTaxRate: drinkTaxRateVal, restaurantInfo: restaurantVal });
            console.log('Settings (taxes, restaurant) synced to Firebase');
          }
        }, { onlyOnce: true });

        const onboardingRef = ref(db, userPath('meta/onboardingCompleted'));
        onValue(onboardingRef, (snapshot) => {
          if (!snapshot.exists() || !snapshot.val()) {
            setShowOnboarding(true);
            setOnboardingStep(0);
          }
        }, { onlyOnce: true });
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initializeDatabase();
  }, []);

  // Firebase Real-time Listeners
  useEffect(() => {

    // Categories Sync
    const categoriesRef = ref(db, userPath('categories'));
    const unsubscribeCats = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const catArray = Object.values(data) as Category[];
        setCategories(catArray);
        localStorage.setItem('drona_categories', JSON.stringify(catArray));
      } else {
        const saved = localStorage.getItem('drona_categories');
        if (saved) {
          const catArray = JSON.parse(saved) as Category[];
          if (catArray.length > 0) {
            set(ref(db, userPath('categories')), buildRecordById(catArray));
            setCategories(catArray);
            return;
          }
        }
        setCategories([]);
        localStorage.setItem('drona_categories', JSON.stringify([]));
      }
    });

    // Menu Items Sync
    const menuRef = ref(db, userPath('menu_items'));
    const unsubscribeMenu = onValue(menuRef, (snapshot) => {
      const data = snapshot.val();
      console.log("App.tsx - Firebase menu_items listener triggered, data:", data);
      if (data) {
        const itemArray = Object.values(data) as MenuItem[];
        console.log("App.tsx - Setting menuItems state with", itemArray.length, "items");
        setMenuItems(itemArray);
        localStorage.setItem('drona_menu_items', JSON.stringify(itemArray));
      } else {
        const saved = localStorage.getItem('drona_menu_items');
        if (saved) {
          const itemArray = JSON.parse(saved) as MenuItem[];
          if (itemArray.length > 0) {
            set(ref(db, userPath('menu_items')), buildRecordById(itemArray));
            setMenuItems(itemArray);
            return;
          }
        }
        setMenuItems([]);
        localStorage.setItem('drona_menu_items', JSON.stringify([]));
      }
    });

    // Orders Sync - Firebase is the single source of truth
    const ordersRef = ref(db, userPath('orders'));
    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const orderArray = Object.values(data) as Order[];
        const sortedOrders = orderArray.sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
        setOrders(sortedOrders);
      } else {
        // No orders in Firebase
        setOrders([]);
      }
      setIsDataLoaded(true);
    });

    // Bill Counter Sync
    const billCounterRef = ref(db, userPath('bill_counter'));
    const unsubscribeBillCounter = onValue(billCounterRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null && data !== undefined) {
        setBillCounter(Number(data));
      } else {
        setBillCounter(0);
      }
    });

    // Settings Sync
    const settingsRef = ref(db, userPath('settings'));
    const unsubscribeSettings = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.restaurantInfo) {
          setRestaurantInfo(data.restaurantInfo);
          localStorage.setItem('drona_restaurant_info', JSON.stringify(data.restaurantInfo));
        }
        if (data.taxRate !== undefined) {
          setTaxRate(data.taxRate);
          localStorage.setItem('drona_tax_rate', data.taxRate.toString());
        }
        if (data.drinkTaxRate !== undefined) {
          setDrinkTaxRate(data.drinkTaxRate);
          localStorage.setItem('drona_drink_tax_rate', data.drinkTaxRate.toString());
        }
        if (data.printerSettings !== undefined) {
          setPrinterSettings(data.printerSettings);
          localStorage.setItem('drona_printer_settings', JSON.stringify(data.printerSettings));
        }
      }
    });

    // Tables Sync
    const tablesRef = ref(db, userPath('tables'));
    const unsubscribeTables = onValue(tablesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tableArray = Object.values(data) as Table[];
        const sortedTables = sortTables(tableArray);
        setTables(sortedTables);
        localStorage.setItem('drona_tables', JSON.stringify(sortedTables));
      } else {
        const saved = localStorage.getItem('drona_tables');
        if (saved) {
          const tableArray = JSON.parse(saved) as Table[];
          if (tableArray.length > 0) {
            set(ref(db, userPath('tables')), buildRecordById(tableArray));
            setTables(tableArray);
            return;
          }
        }
        setTables([]);
        localStorage.setItem('drona_tables', JSON.stringify([]));
      }
    });



    const floorsRef = ref(db, userPath('floors'));
    const unsubscribeFloors = onValue(floorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const floorArray = Object.values(data) as Floor[];
        setFloors(floorArray);
        localStorage.setItem('drona_floors', JSON.stringify(floorArray));
      } else {
        const saved = localStorage.getItem('drona_floors');
        if (saved) {
          const floorArray = JSON.parse(saved) as Floor[];
          if (floorArray.length > 0) {
            set(ref(db, userPath('floors')), buildRecordById(floorArray));
            setFloors(floorArray);
            return;
          }
        }
        setFloors([]);
        localStorage.setItem('drona_floors', JSON.stringify([]));
      }
    });

    // Table Carts Sync (for pending orders on tables)
    const tableCartsRef = ref(db, userPath('table_carts'));
    const unsubscribeTableCarts = onValue(tableCartsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const normalized = normalizeTableCarts(data);
        setTableCarts(normalized);
        localStorage.setItem('drona_table_carts', JSON.stringify(normalized));

        // Auto-repair malformed cart shapes in RTDB to keep all clients in sync.
        if (JSON.stringify(data) !== JSON.stringify(normalized)) {
          set(ref(db, userPath('table_carts')), sanitizeForFirebase(normalized)).catch((error) => {
            console.error('Firebase Sync Error (Repair Table Carts):', error);
          });
        }
      } else {
        const saved = localStorage.getItem('drona_table_carts');
        if (saved) {
          const carts = normalizeTableCarts(JSON.parse(saved));
          if (Object.keys(carts).length > 0) {
            set(ref(db, userPath('table_carts')), carts);
            setTableCarts(carts);
            return;
          }
        }
        setTableCarts({});
        localStorage.setItem('drona_table_carts', JSON.stringify({}));
      }
    });

    return () => {
      unsubscribeCats();
      unsubscribeMenu();
      unsubscribeOrders();
      unsubscribeSettings();
      unsubscribeTables();

      unsubscribeFloors();
      unsubscribeTableCarts();
      unsubscribeBillCounter();
    };
  }, []);

  // Action Handlers - Firebase is the single source of truth for orders
  const handleCreateOrder = async (order: Order) => {
    console.log("Creating order:", order);
    
    // Get current counter from Firebase to ensure consistency
    let currentCounter = billCounter;
    try {
      const counterSnap = await get(ref(db, userPath('bill_counter')));
      if (counterSnap.exists()) {
        currentCounter = Number(counterSnap.val());
      }
    } catch {
      // Fallback to local state
    }
    
    const newCounter = currentCounter + 1;
    order.billNo = `INV-${newCounter}`;
    
    // Clean the order object - remove undefined values (Firebase doesn't accept undefined)
    const cleanOrder = JSON.parse(JSON.stringify(order));
    
    try {
      // Save order and update counter atomically
      await set(ref(db, userPath(`orders/${order.id}`)), cleanOrder);
      await set(ref(db, userPath('bill_counter')), newCounter);
      setBillCounter(newCounter);
      console.log("Order saved to Firebase successfully:", order.id, "Bill:", order.billNo);
    } catch (error) {
      console.error("Firebase Error (Create Order):", error);
      alert("Failed to save order. Please check your internet connection.");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      // Update Firebase directly - the onValue listener will update local state
      await update(ref(db, userPath(`orders/${orderId}`)), { status });
    } catch (error) {
      console.error("Firebase Error (Update Status):", error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      // Delete from Firebase directly - the onValue listener will update local state
      await set(ref(db, userPath(`orders/${orderId}`)), null);
    } catch (error) {
      console.error("Firebase Error (Delete Order):", error);
    }
  };

  // Table Handlers
  const handleAddTable = async (tableName: string, floorId?: string) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newTable: Table = {
      id: newId,
      name: tableName,
      status: 'AVAILABLE',
      ...(floorId ? { floorId } : {}),
    };

    const updatedTables = sortTables([...tables, newTable]);
    setTables(updatedTables);
    localStorage.setItem('drona_tables', JSON.stringify(updatedTables));

    try {
      await set(ref(db, userPath(`tables/${newId}`)), JSON.parse(JSON.stringify(newTable)));
    } catch (error) {
      console.error("Firebase Sync Error (Add Table):", error);
    }
  };

  const handleUpdateTable = async (updated: Table) => {
    const updatedTables = sortTables(tables.map(t => (t.id === updated.id ? updated : t)));
    setTables(updatedTables);
    localStorage.setItem('drona_tables', JSON.stringify(updatedTables));
    const clean: Record<string, unknown> = {
      id: updated.id,
      name: updated.name,
      status: updated.status,
    };
    if (updated.capacity !== undefined) clean.capacity = updated.capacity;
    if (updated.currentOrderId !== undefined) clean.currentOrderId = updated.currentOrderId;
    if (updated.floorId) clean.floorId = updated.floorId;
    else clean.floorId = null;
    try {
      await update(ref(db, userPath(`tables/${updated.id}`)), clean);
    } catch (error) {
      console.error("Firebase Sync Error (Update Table):", error);
    }
  };

  const handleAddFloor = async (name: string) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const floor: Floor = { id: newId, name: name.trim(), sortOrder: floors.length };
    const next = [...floors, floor];
    setFloors(next);
    localStorage.setItem('drona_floors', JSON.stringify(next));
    try {
      await set(ref(db, userPath(`floors/${newId}`)), floor);
    } catch (error) {
      console.error("Firebase Sync Error (Add Floor):", error);
    }
  };

  const handleDeleteFloor = async (floorId: string) => {
    const next = floors.filter(f => f.id !== floorId);
    setFloors(next);
    localStorage.setItem('drona_floors', JSON.stringify(next));
    const clearedTables = tables.map(t =>
      t.floorId === floorId ? { ...t, floorId: undefined } : t
    );
    setTables(clearedTables);
    localStorage.setItem('drona_tables', JSON.stringify(clearedTables));
    try {
      await set(ref(db, userPath(`floors/${floorId}`)), null);
      for (const t of tables) {
        if (t.floorId === floorId) {
          await update(ref(db, userPath(`tables/${t.id}`)), { floorId: null });
        }
      }
    } catch (error) {
      console.error("Firebase Sync Error (Delete Floor):", error);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    const updatedTables = tables.filter(t => t.id !== tableId);
    setTables(updatedTables);
    localStorage.setItem('drona_tables', JSON.stringify(updatedTables));

    try {
      await set(ref(db, userPath(`tables/${tableId}`)), null);
    } catch (error) {
      console.error("Firebase Sync Error (Delete Table):", error);
    }
  };

  const handleUpdateTableStatus = async (tableId: string, status: Table['status'], currentOrderId?: string) => {
    const updatedTables = tables.map(t => 
      t.id === tableId ? { ...t, status, currentOrderId } : t
    );
    setTables(updatedTables);
    localStorage.setItem('drona_tables', JSON.stringify(updatedTables));

    try {
      await update(ref(db, userPath(`tables/${tableId}`)), { status, currentOrderId: currentOrderId || null });
    } catch (error) {
      console.error("Firebase Sync Error (Update Table):", error);
    }
  };

  const handleAddMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    // Validate required fields - categoryId is essential for items to show on billing screen
    if (!item.categoryId || typeof item.categoryId !== 'string') {
      console.error("App.tsx - Invalid menu item: missing or invalid categoryId", item);
      alert("Please select a category for the menu item. Items without a category won't appear on the billing screen.");
      return;
    }
    
    const newId = Math.random().toString(36).substr(2, 9);
    
    // Build clean item - Firebase doesn't accept undefined; ensure categoryId is always included
    const cleanItem: Record<string, unknown> = {
      id: newId,
      name: item.name ?? '',
      price: Number(item.price) || 0,
      categoryId: item.categoryId,
      isVeg: Boolean(item.isVeg),
      vegType: item.vegType ?? 'VEG',
    };
    if (item.vegPrice !== undefined && item.vegPrice !== null) cleanItem.vegPrice = item.vegPrice;
    if (item.nonVegPrice !== undefined && item.nonVegPrice !== null) cleanItem.nonVegPrice = item.nonVegPrice;
    if (item.image) cleanItem.image = item.image;
    if (item.mlPrices && Object.keys(item.mlPrices).length > 0) cleanItem.mlPrices = item.mlPrices;
    
    console.log("App.tsx - Adding menu item:", cleanItem);
    try {
      await set(ref(db, userPath(`menu_items/${newId}`)), cleanItem);
      console.log("App.tsx - Menu item saved successfully to Firebase");
    } catch (error) {
      console.error("Firebase Sync Error (Add Item):", error);
      alert("Failed to save menu item: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleUpdateMenuItem = async (updatedItem: MenuItem) => {
    // Clean the item - remove undefined values (Firebase doesn't accept undefined)
    const cleanItem: Record<string, any> = {};
    Object.entries(updatedItem).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanItem[key] = value;
      }
    });
    
    console.log("App.tsx - Updating menu item:", cleanItem);
    try {
      await set(ref(db, userPath(`menu_items/${updatedItem.id}`)), cleanItem);
      console.log("App.tsx - Menu item updated successfully");
    } catch (error) {
      console.error("Firebase Sync Error (Update Item):", error);
      alert("Failed to update menu item: " + error);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      await set(ref(db, userPath(`menu_items/${id}`)), null);
    } catch (error) {
      console.error("Firebase Sync Error (Delete Item):", error);
    }
  };

  const handleAddCategory = async (name: string, type?: 'FOOD' | 'DRINK') => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newCat = { id: newId, name, type: type || 'FOOD' };
    try {
      await set(ref(db, userPath(`categories/${newId}`)), newCat);
    } catch (error) {
      console.error("Firebase Sync Error (Add Category):", error);
    }
  };

  const handleUpdateCategory = async (updatedCat: Category) => {
    try {
      await set(ref(db, userPath(`categories/${updatedCat.id}`)), updatedCat);
    } catch (error) {
      console.error("Firebase Sync Error (Update Category):", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await set(ref(db, userPath(`categories/${id}`)), null);
      // Also delete items in this category
      const itemsToDelete = menuItems.filter(i => i.categoryId === id);
      for (const item of itemsToDelete) {
        await set(ref(db, userPath(`menu_items/${item.id}`)), null);
      }

    } catch (error) {
      console.error("Firebase Sync Error (Delete Category):", error);
    }
  };



  const handleSaveTaxRate = async (newRate: number) => {
    setTaxRate(newRate);
    localStorage.setItem('drona_tax_rate', newRate.toString());
    try {
      await update(ref(db, userPath('settings')), { taxRate: newRate });
    } catch (error) {
      console.error("Firebase Sync Error (Tax):", error);
    }
  };

  const handleSaveDrinkTaxRate = async (newRate: number) => {
    setDrinkTaxRate(newRate);
    localStorage.setItem('drona_drink_tax_rate', newRate.toString());
    try {
      await update(ref(db, userPath('settings')), { drinkTaxRate: newRate });
    } catch (error) {
      console.error("Firebase Sync Error (Drink Tax):", error);
    }
  };

  const handleSaveRestaurantInfo = async (info: RestaurantInfo) => {
    setRestaurantInfo(info);
    try {
      await update(ref(db, userPath('settings')), { restaurantInfo: info });
    } catch (error) {
      console.error("Firebase Sync Error (Profile):", error);
    }
  };

  const handleSavePrinterSettings = async (settings: PrinterSettings) => {
    setPrinterSettings(settings);
    localStorage.setItem('drona_printer_settings', JSON.stringify(settings));
    try {
      await update(ref(db, userPath('settings')), { printerSettings: settings });
    } catch (error) {
      console.error("Firebase Sync Error (Printer Settings):", error);
    }
  };

  const handleUpdateTableCarts = async (newTableCarts: Record<string, { items: any[]; customerName: string }>) => {
    const normalized = normalizeTableCarts(newTableCarts);
    const cleanTableCarts = sanitizeForFirebase(normalized);

    setTableCarts(cleanTableCarts);
    localStorage.setItem('drona_table_carts', JSON.stringify(cleanTableCarts));
    try {
      await set(ref(db, userPath('table_carts')), cleanTableCarts);
    } catch (error) {
      console.error("Firebase Sync Error (Table Carts):", error);
    }
  };

  // Reset menu database with new menu from constants
  const handleResetMenuDatabase = async () => {
    try {
      // Clear old categories and menu items from Firebase
      await set(ref(db, userPath('categories')), null);
      await set(ref(db, userPath('menu_items')), null);
      
      // Sync all new categories to Firebase
      for (const cat of INITIAL_CATEGORIES) {
        await set(ref(db, userPath(`categories/${cat.id}`)), cat);
      }
      
      // Sync all new menu items to Firebase
      for (const item of INITIAL_MENU_ITEMS) {
        await set(ref(db, userPath(`menu_items/${item.id}`)), item);
      }
      
      // Update local state
      setCategories(INITIAL_CATEGORIES);
      setMenuItems(INITIAL_MENU_ITEMS);
      localStorage.setItem('drona_categories', JSON.stringify(INITIAL_CATEGORIES));
      localStorage.setItem('drona_menu_items', JSON.stringify(INITIAL_MENU_ITEMS));
      
      alert('Menu database reset successfully with new menu!');
    } catch (error) {
      console.error('Error resetting menu database:', error);
      alert('Failed to reset menu database. Check console for details.');
    }
  };

  // Factory Reset: Wipes menu items, orders, table carts, and resets bill counter
  const handleFactoryReset = async () => {
    try {
      // Clear menu items and categories
      await set(ref(db, userPath('menu_items')), null);
      await set(ref(db, userPath('categories')), null);
      
      // Clear orders
      await set(ref(db, userPath('orders')), null);
      
      // Clear table carts (pending orders on tables)
      await set(ref(db, userPath('table_carts')), null);
      
      // Clear bill counter so next bill is INV-1
      await set(ref(db, userPath('bill_counter')), 0);
      setBillCounter(0);

      // Update local state
      setMenuItems([]);
      setCategories([]);

      setOrders([]);
      setTableCarts({});
      localStorage.setItem('drona_menu_items', JSON.stringify([]));
      localStorage.setItem('drona_categories', JSON.stringify([]));

      localStorage.setItem('drona_table_carts', JSON.stringify({}));
      
      // Reset tables currentOrderId and status if they are occupied
      const resetTables = tables.map(t => ({ ...t, status: 'AVAILABLE' as const, currentOrderId: undefined }));
      setTables(resetTables);
      localStorage.setItem('drona_tables', JSON.stringify(resetTables));
      for (const t of resetTables) {
        await update(ref(db, userPath(`tables/${t.id}`)), { status: 'AVAILABLE', currentOrderId: null });
      }

      alert('Database wiped successfully! Menu items, orders, and table carts have been cleared. Order IDs will now start from INV-1.');
    } catch (error) {
      console.error('Error wiping database:', error);
      alert('Failed to wipe database. Check console for details.');
    }
  };

  // Print bill for a table from the tables screen (running bill)
  const handlePrintTableBill = async (tableId: string) => {
    const cart = tableCarts[tableId];
    if (!cart || !cart.items || cart.items.length === 0) {
      alert('No items on this table to print.');
      return;
    }
    const items = cart.items;
    const subtotal = items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0);
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    const tableName = tables.find(t => t.id === tableId)?.name || 'Table';
    const customerName = cart.customerName || 'Guest';


    // Try ESC/POS first
    const widthMm = (printerSettings.printerWidth ?? 80) as 80 | 58;
    const runningLines = buildRunningBillLines({
      restaurantName: restaurantInfo.name,
      address: restaurantInfo.address,
      phone: restaurantInfo.phone,
      gstNo: restaurantInfo.gstNo,
      tableName,
      customerName,
      items: items.map(it => ({
        name: it.name,
        quantity: it.quantity,
        price: it.price || 0,
        selectedPortion: it.selectedPortion,
      })),
      subtotal,
      taxRate,
      taxAmount,
      total,
    });

    const printed = await printEscPos('bill', runningLines, widthMm);
    if (printed) return;

    // Fallback: iframe print
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
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
          <title>Running Bill - ${tableName}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 76mm; 
              max-width: 76mm;
              margin: 0 auto; 
              padding: 3mm; 
              font-size: 11px; 
              color: #000; 
              font-weight: 900;
              line-height: 1.3;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .center { text-align: center; }
            .bold { font-weight: 900; }
            .line { border-bottom: 1px dashed #000; margin: 6px 0; border-width: 2px; }
            .header-name { font-size: 14px; font-weight: bold; margin-bottom: 2px; text-transform: uppercase; }
            .row { display: flex; justify-content: space-between; margin: 3px 0; gap: 4px; }
            .item-name { flex: 1; min-width: 0; word-break: break-word; }
            .qty { width: 24px; text-align: center; font-weight: bold; flex-shrink: 0; }
            .amt { width: 40px; text-align: right; flex-shrink: 0; }
            .total-section { font-size: 13px; font-weight: bold; margin-top: 4px; }
            .footer { font-size: 10px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="center header-name">${restaurantInfo.name}</div>
          <div class="center">${restaurantInfo.address}</div>
          <div class="center">Tel: ${restaurantInfo.phone}</div>
          ${restaurantInfo.gstNo ? `<div class="center" style="font-size:10px;">GSTIN: ${restaurantInfo.gstNo}</div>` : ''}
          <div class="line"></div>
          <div class="center bold">${tableName} - RUNNING BILL</div>
          <div>Cust: ${customerName}</div>
          <div>Date: ${new Date().toLocaleDateString()}</div>
          <div>Time: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div class="line"></div>
          <div class="row bold">
            <span class="item-name">Item</span>
            <span class="qty">Qty</span>
            <span class="amt">Amt</span>
          </div>
          ${items.map(it => `
            <div class="row">
              <span class="item-name">${it.name}${it.selectedPortion === 'HALF' ? ' (Half)' : it.selectedPortion === 'FULL' ? ' (Full)' : ''}</span>
              <span class="qty">${it.quantity}</span>
              <span class="amt">${(it.price * it.quantity).toFixed(0)}</span>
            </div>
          `).join('')}
          <div class="line"></div>
          <div class="row"><span>Subtotal:</span><span>₹${subtotal.toFixed(0)}</span></div>
          <div class="row"><span>Tax (${(taxRate * 100).toFixed(0)}%):</span><span>₹${taxAmount.toFixed(0)}</span></div>
          <div class="row bold total-section"><span>TOTAL:</span><span>₹${total.toFixed(0)}</span></div>
          <div class="line"></div>
          <div class="center footer" style="margin-top:8px;">** Running Bill - Not Final **</div>
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
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        window.removeEventListener('message', handleMessage);
      }
    };
    window.addEventListener('message', handleMessage);
    setTimeout(() => { if (document.body.contains(iframe)) document.body.removeChild(iframe); }, 5000);
  };


  const renderScreen = () => {
    switch (activeScreen) {
      case 'TABLES':
        return (
          <TablesGrid
            tables={tables}
            floors={floors}
            tableCarts={tableCarts}
            selectedTableId={selectedTableId}
            onSelectTable={(tableId) => {
              setSelectedTableId(tableId);
              setActiveScreen('BILLING');
            }}
            onPrintTable={handlePrintTableBill}
            onCheckoutTable={(tableId) => {
              const cart = tableCarts[tableId];
              if (!cart || !cart.items || cart.items.length === 0) {
                alert('No items on this table to checkout.');
                return;
              }
              const items = cart.items;
              const tableName = tables.find(t => t.id === tableId)?.name || 'Table';
              const customerName = cart.customerName || 'Guest';

              // Compute subtotals (food vs drink for GST/VAT split)
              const drinkPat = /drink|beverage|smoothie|juice|shake|coffee|tea|soda|cola|mocktail/i;
              const isDrinkCat = (catId: string) => {
                const cat = categories.find(c => c.id === catId);
                return cat ? (cat.type === 'DRINK' || (!cat.type && drinkPat.test(cat.name || ''))) : false;
              };
              const foodSub = items.reduce((s, i) => s + (!isDrinkCat(i.categoryId) ? i.price * i.quantity : 0), 0);
              const drinkSub = items.reduce((s, i) => s + (isDrinkCat(i.categoryId) ? i.price * i.quantity : 0), 0);
              const subtotal = foodSub + drinkSub;
              const tax = (foodSub * taxRate) + (drinkSub * drinkTaxRate);
              const total = subtotal + tax;

              const d = new Date();
              const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

              const newOrder: Order = {
                id: Math.random().toString(36).substr(2, 9),
                billNo: `INV-${Date.now().toString().substr(-6)}`,
                customerName,
                tableId,
                tableName,
                date: dateStr,
                time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                items: [...items],
                subtotal,
                tax,
                total,
                paymentMode: 'CASH',
                orderType: 'DINE_IN',
                staffName: 'Admin',
                status: 'COMPLETED'
              };

              handleCreateOrder(newOrder);
              // Clear table cart and reset status
              const newCarts = { ...tableCarts };
              newCarts[tableId] = { items: [], customerName: '' };
              handleUpdateTableCarts(newCarts);
              handleUpdateTableStatus(tableId, 'AVAILABLE');
            }}
          />
        );
      case 'BILLING':
        return (
          <BillingScreen 
            categories={categories} 
            menuItems={menuItems} 
            taxRate={taxRate} drinkTaxRate={drinkTaxRate}
            restaurantInfo={restaurantInfo}
            tables={tables}
            floors={floors}
            tableCarts={tableCarts}

            onCreateOrder={handleCreateOrder}
            onUpdateTableStatus={handleUpdateTableStatus}
            onUpdateTableCarts={handleUpdateTableCarts}
            variant="desktop"
            selectedTableId={selectedTableId}
            printerSettings={printerSettings}
            onBackToTables={() => {
              setSelectedTableId(null);
              setActiveScreen('TABLES');
            }}
          />
        );
      case 'DASHBOARD':
        return <Dashboard orders={orders} />;
      case 'LIVE_ORDERS':
        return (
          <OrdersList 
            title="Live Orders" 
            orders={orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED')} 
            onUpdateStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            restaurantInfo={restaurantInfo}
            taxRate={taxRate} drinkTaxRate={drinkTaxRate}
            categories={categories}
            printerSettings={printerSettings}
          />
        );
      case 'ALL_ORDERS':
        return (
          <OrdersList
            title="All Bills"
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            restaurantInfo={restaurantInfo}
            taxRate={taxRate} drinkTaxRate={drinkTaxRate}
            categories={categories}
            printerSettings={printerSettings}
          />
        );
      case 'COMPLETED_ORDERS':
        return (
          <OrdersList 
            title="Completed Orders" 
            orders={orders.filter(o => o.status === 'COMPLETED')} 
            onUpdateStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            restaurantInfo={restaurantInfo}
            taxRate={taxRate} drinkTaxRate={drinkTaxRate}
            categories={categories}
            printerSettings={printerSettings}
          />
        );
      case 'CANCELLED_ORDERS':
        return (
          <OrdersList 
            title="Cancelled Orders" 
            orders={orders.filter(o => o.status === 'CANCELLED')} 
            onUpdateStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            restaurantInfo={restaurantInfo}
            taxRate={taxRate} drinkTaxRate={drinkTaxRate}
            categories={categories}
            printerSettings={printerSettings}
          />
        );
      case 'REPORTS':
        return <Reports orders={orders} />;
      case 'MENU_CONFIG':
        return (
          <MenuManagement 
            categories={categories} 
            menuItems={menuItems}
            taxRate={taxRate} drinkTaxRate={drinkTaxRate}
            restaurantInfo={restaurantInfo}
            tables={tables}
            floors={floors}

            setTaxRate={handleSaveTaxRate} setDrinkTaxRate={handleSaveDrinkTaxRate}
            setRestaurantInfo={handleSaveRestaurantInfo}
            onAddMenuItem={handleAddMenuItem}
            onUpdateMenuItem={handleUpdateMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddTable={handleAddTable}
            onUpdateTable={handleUpdateTable}
            onDeleteTable={handleDeleteTable}
            onAddFloor={handleAddFloor}
            onDeleteFloor={handleDeleteFloor}
            printerSettings={printerSettings}
            onSavePrinterSettings={handleSavePrinterSettings}

            onResetMenuDatabase={handleResetMenuDatabase}
            onFactoryReset={handleFactoryReset}
          />
        );
      default:
        return <BillingScreen categories={categories} menuItems={menuItems} taxRate={taxRate} drinkTaxRate={drinkTaxRate} restaurantInfo={restaurantInfo} tables={tables} floors={floors} tableCarts={tableCarts} onCreateOrder={handleCreateOrder} onUpdateTableStatus={handleUpdateTableStatus} onUpdateTableCarts={handleUpdateTableCarts} />;
    }
  };

  // Mobile view rendering
  const renderMobileScreen = () => {
    // Show loading state while data is being fetched
    if (!isDataLoaded) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
          <div className="w-16 h-16 border-4 border-[#F57C00] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading data from cloud...</p>
          <p className="text-gray-400 text-sm mt-1">Please wait</p>
        </div>
      );
    }

    return (
      <BillingScreen 
        categories={categories} 
        menuItems={menuItems} 
        taxRate={taxRate} drinkTaxRate={drinkTaxRate}
        restaurantInfo={restaurantInfo}
        tables={tables}
        floors={floors}
        tableCarts={tableCarts}

        onCreateOrder={handleCreateOrder}
        onUpdateTableStatus={handleUpdateTableStatus}
        onUpdateTableCarts={handleUpdateTableCarts}
        variant="mobile"
        printerSettings={printerSettings}
      />
    );
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F57C00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Mobile Layout - triggered by /mobile URL path
  if (isMobileRoute) {
    return (
      <div className="flex flex-col bg-gray-100 overflow-hidden min-h-0" style={{ height: '100dvh' }}>
        {/* Mobile Header */}
        <header className="bg-white h-14 border-b flex items-center justify-between px-4 shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#F57C00] rounded-lg flex items-center justify-center font-bold text-white">D</div>
            <span className="text-lg font-bold tracking-tight">DRONA <span className="text-[#F57C00]">POS</span></span>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <Cloud size={12} />
                <span className="text-[10px] font-black">LIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded-full">
                <CloudOff size={12} />
                <span className="text-[10px] font-black">OFFLINE</span>
              </div>
            )}
          </div>
        </header>

        {/* Mobile Content */}
        <main className="flex-1 overflow-hidden min-h-0">
          {renderMobileScreen()}
        </main>

      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden text-sm select-none">
      {showOnboarding && !isMobileRoute && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[60]" />
          <div className="fixed right-4 bottom-4 w-[360px] max-w-[92vw] bg-white rounded-2xl shadow-2xl border-2 border-orange-100 z-[70] p-5">
            <div className="text-[11px] font-black uppercase tracking-wider text-orange-600">
              Setup Guide {onboardingStep + 1}/{ONBOARDING_STEPS.length}
            </div>
            <h3 className="text-lg font-black text-gray-900 mt-1">
              {ONBOARDING_STEPS[onboardingStep].title}
            </h3>
            <p className="text-sm text-gray-700 font-medium mt-2 leading-relaxed">
              {ONBOARDING_STEPS[onboardingStep].message}
            </p>
            <div className="mt-3 text-xs font-black text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              Indication: {ONBOARDING_STEPS[onboardingStep].indicator}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={handleOnboardingSkip}
                className="text-sm font-black text-gray-500 hover:text-gray-700"
              >
                Skip
              </button>
              <button
                onClick={handleOnboardingNext}
                className="bg-[#F57C00] text-white px-4 py-2 rounded-lg font-black text-sm hover:bg-orange-600 transition-colors"
              >
                {onboardingStep === ONBOARDING_STEPS.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </>
      )}

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div 
        className={`fixed inset-y-0 left-0 w-64 bg-[#262626] text-white z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-700 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F57C00] rounded-lg flex items-center justify-center font-bold text-xl">D</div>
          <span className="text-xl font-bold tracking-tight">DRONA <span className="text-[#F57C00]">POS</span></span>
        </div>

        <nav className="mt-4 flex-1 overflow-y-auto custom-scrollbar">
          <SidebarItem 
            icon={<Receipt size={20} />} 
            label="Tables"
            active={activeScreen === 'TABLES'}
            onClick={() => { setActiveScreen('TABLES'); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={<BarChart3 size={20} />} 
            label="Analytics Dashboard" 
            active={activeScreen === 'DASHBOARD'} 
            onClick={() => { setActiveScreen('DASHBOARD'); setIsSidebarOpen(false); }} 
          />
          
          <div className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</div>
          <SidebarItem 
            icon={<Layers size={20} />} 
            label="All Bills" 
            active={activeScreen === 'ALL_ORDERS'} 
            onClick={() => { setActiveScreen('ALL_ORDERS'); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={<Clock size={20} />} 
            label="Live Orders" 
            active={activeScreen === 'LIVE_ORDERS'} 
            onClick={() => { setActiveScreen('LIVE_ORDERS'); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={<CheckCircle2 size={20} />} 
            label="Completed Orders" 
            active={activeScreen === 'COMPLETED_ORDERS'} 
            onClick={() => { setActiveScreen('COMPLETED_ORDERS'); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={<XCircle size={20} />} 
            label="Cancelled Orders" 
            active={activeScreen === 'CANCELLED_ORDERS'} 
            onClick={() => { setActiveScreen('CANCELLED_ORDERS'); setIsSidebarOpen(false); }} 
          />

          <div className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Business</div>
          <SidebarItem 
            icon={<FileSpreadsheet size={20} />} 
            label="Reports" 
            active={activeScreen === 'REPORTS'} 
            onClick={() => { setActiveScreen('REPORTS'); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="Configuration" 
            active={activeScreen === 'MENU_CONFIG'} 
            onClick={() => { setActiveScreen('MENU_CONFIG'); setIsSidebarOpen(false); }} 
          />

          <div className="mt-8 border-t border-gray-700">
            <SidebarItem icon={<LogOut size={20} />} label="Logout" onClick={handleLogout} />
          </div>
        </nav>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white h-14 border-b flex items-center justify-between px-4 shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <MenuIcon size={24} className="text-gray-600" />
            </button>
            <div className="hidden md:flex items-center gap-2">
               <span className="text-[#F57C00] font-bold text-lg">NOON TO MOON</span>
               <div className="h-6 w-px bg-gray-200 mx-2"></div>
               <button
                 onClick={() => setActiveScreen('TABLES')}
                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-sm transition-all ${
                   activeScreen === 'TABLES' 
                     ? 'bg-[#F57C00] text-white shadow-lg shadow-orange-200' 
                     : 'bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-[#F57C00]'
                 }`}
               >
                 <Receipt size={16} />
                 <span>Tables</span>
               </button>
               <div className="h-6 w-px bg-gray-200 mx-1"></div>
               <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border">
                 {isOnline ? (
                   <div className="flex items-center gap-1.5 text-green-600">
                     <Cloud size={14} />
                     <span className="text-[10px] font-black uppercase tracking-tighter">Live Sync</span>
                   </div>
                 ) : (
                   <div className="flex items-center gap-1.5 text-red-500">
                     <CloudOff size={14} />
                     <span className="text-[10px] font-black uppercase tracking-tighter">Offline</span>
                   </div>
                 )}
               </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-4">
            <HeaderAction icon={<Printer size={20} />} tooltip="Printer Settings" />
            <HeaderAction 
              icon={<FileText size={20} />} 
              tooltip="Reports" 
              onClick={() => setActiveScreen('REPORTS')}
            />
            <div className="relative">
              <HeaderAction 
                icon={<Bell size={20} />} 
                tooltip="All Bills" 
                onClick={() => setActiveScreen('ALL_ORDERS')}
              />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </div>
            <div className="flex items-center gap-2 pl-2 border-l ml-2">
              <div className="w-8 h-8 bg-orange-100 text-[#F57C00] rounded-full flex items-center justify-center font-bold">{user?.displayName?.charAt(0)?.toUpperCase() || 'A'}</div>
              <span className="hidden lg:block font-black text-gray-900">{user?.displayName || 'Admin'}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          {renderScreen()}
        </main>
      </div>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-3.5 transition-colors ${
      active ? 'bg-[#F57C00] text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`}
  >
    {icon}
    <span className="flex-1 text-left">{label}</span>
    {active && <ChevronRight size={16} />}
  </button>
);

const HeaderAction: React.FC<{ icon: React.ReactNode; tooltip: string; onClick?: () => void }> = ({ icon, tooltip, onClick }) => (
  <button 
    onClick={onClick}
    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative group" 
    title={tooltip}
  >
    {icon}
  </button>
);

interface MobileNavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all relative ${
      active 
        ? 'text-[#F57C00]' 
        : 'text-gray-400'
    }`}
  >
    <div className={`relative p-2 rounded-xl transition-all ${active ? 'bg-orange-100' : ''}`}>
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </div>
    <span className={`text-[10px] mt-1 font-bold ${active ? 'text-[#F57C00]' : 'text-gray-500'}`}>{label}</span>
  </button>
);

export default App;
