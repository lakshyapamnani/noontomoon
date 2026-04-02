
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
  Addon,
  Floor
} from './types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_MENU_ITEMS, 
  TAX_RATE as INITIAL_TAX_RATE 
} from './constants';
import BillingScreen from './components/BillingScreen';
import Dashboard from './components/Dashboard';
import OrdersList from './components/OrdersList';
import Reports from './components/Reports';
import MenuManagement from './components/MenuManagement';
import TablesGrid from './components/TablesGrid';

// Firebase imports
import { db, auth } from './firebase';
import { ref, onValue, set, push, update } from 'firebase/database';
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
  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('drona_tables');
    return saved ? JSON.parse(saved) : [];
  });
  const [floors, setFloors] = useState<Floor[]>(() => {
    const saved = localStorage.getItem('drona_floors');
    return saved ? JSON.parse(saved) : [];
  });
  const [addons, setAddons] = useState<Addon[]>(() => {
    const saved = localStorage.getItem('drona_addons');
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
    return saved ? parseFloat(saved) : 0;
  });
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo>(() => {
    const saved = localStorage.getItem('drona_restaurant_info');
    return saved ? JSON.parse(saved) : {
      name: 'DRONA POS CAFE',
      phone: '+91 9876543210',
      address: '123 Main Street, Food Park, City'
    };
  });

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
      localStorage.removeItem('drona_addons');
      localStorage.removeItem('drona_table_carts');
      localStorage.removeItem('drona_tax_rate');
      localStorage.removeItem('drona_restaurant_info');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Helper to get user-scoped Firebase path
  const userPath = (path: string) => `users/${user?.uid}/${path}`;

  const markOnboardingDone = async () => {
    if (!user) return;
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
    if (!user) return;
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
              name: user.displayName || 'DRONA POS CAFE', 
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
  }, [user]);

  // Firebase Real-time Listeners
  useEffect(() => {
    if (!user) {
      setIsDataLoaded(false);
      return;
    }

    // Categories Sync
    const categoriesRef = ref(db, userPath('categories'));
    const unsubscribeCats = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const catArray = Object.values(data) as Category[];
        setCategories(catArray);
        localStorage.setItem('drona_categories', JSON.stringify(catArray));
      } else {
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
      }
    });

    // Tables Sync
    const tablesRef = ref(db, userPath('tables'));
    const unsubscribeTables = onValue(tablesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tableArray = Object.values(data) as Table[];
        setTables(tableArray);
        localStorage.setItem('drona_tables', JSON.stringify(tableArray));
      } else {
        setTables([]);
        localStorage.setItem('drona_tables', JSON.stringify([]));
      }
    });

    // Addons Sync
    const addonsRef = ref(db, userPath('addons'));
    const unsubscribeAddons = onValue(addonsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const addonArray = Object.values(data) as Addon[];
        setAddons(addonArray);
        localStorage.setItem('drona_addons', JSON.stringify(addonArray));
      } else {
        setAddons([]);
        localStorage.setItem('drona_addons', JSON.stringify([]));
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
        setFloors([]);
        localStorage.setItem('drona_floors', JSON.stringify([]));
      }
    });

    // Table Carts Sync (for pending orders on tables)
    const tableCartsRef = ref(db, userPath('table_carts'));
    const unsubscribeTableCarts = onValue(tableCartsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTableCarts(data);
        localStorage.setItem('drona_table_carts', JSON.stringify(data));
      } else {
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
      unsubscribeAddons();
      unsubscribeFloors();
      unsubscribeTableCarts();
    };
  }, [user]);

  // Action Handlers - Firebase is the single source of truth for orders
  const handleCreateOrder = async (order: Order) => {
    console.log("Creating order:", order);
    
    // Clean the order object - remove undefined values (Firebase doesn't accept undefined)
    const cleanOrder = JSON.parse(JSON.stringify(order));
    
    try {
      // Save directly to Firebase - the onValue listener will update local state
      await set(ref(db, userPath(`orders/${order.id}`)), cleanOrder);
      console.log("Order saved to Firebase successfully:", order.id);
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

    const updatedTables = [...tables, newTable];
    setTables(updatedTables);
    localStorage.setItem('drona_tables', JSON.stringify(updatedTables));

    try {
      await set(ref(db, userPath(`tables/${newId}`)), JSON.parse(JSON.stringify(newTable)));
    } catch (error) {
      console.error("Firebase Sync Error (Add Table):", error);
    }
  };

  const handleUpdateTable = async (updated: Table) => {
    const updatedTables = tables.map(t => (t.id === updated.id ? updated : t));
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
      // Also delete addons linked to this category
      const addonsToDelete = addons.filter(a => a.categoryId === id);
      for (const addon of addonsToDelete) {
        await set(ref(db, userPath(`addons/${addon.id}`)), null);
      }
    } catch (error) {
      console.error("Firebase Sync Error (Delete Category):", error);
    }
  };

  // Addon Handlers
  const handleAddAddon = async (addon: Addon) => {
    try {
      await set(ref(db, userPath(`addons/${addon.id}`)), addon);
    } catch (error) {
      console.error("Firebase Sync Error (Add Addon):", error);
    }
  };

  const handleUpdateAddon = async (addon: Addon) => {
    try {
      await set(ref(db, userPath(`addons/${addon.id}`)), addon);
    } catch (error) {
      console.error("Firebase Sync Error (Update Addon):", error);
    }
  };

  const handleDeleteAddon = async (id: string) => {
    try {
      await set(ref(db, userPath(`addons/${id}`)), null);
    } catch (error) {
      console.error("Firebase Sync Error (Delete Addon):", error);
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

  const handleUpdateTableCarts = async (newTableCarts: Record<string, { items: any[]; customerName: string }>) => {
    setTableCarts(newTableCarts);
    localStorage.setItem('drona_table_carts', JSON.stringify(newTableCarts));
    try {
      await set(ref(db, userPath('table_carts')), newTableCarts);
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
            addons={addons}
            onCreateOrder={handleCreateOrder}
            onUpdateTableStatus={handleUpdateTableStatus}
            onUpdateTableCarts={handleUpdateTableCarts}
            variant="desktop"
            selectedTableId={selectedTableId}
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
            addons={addons}
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
            onAddAddon={handleAddAddon}
            onUpdateAddon={handleUpdateAddon}
            onDeleteAddon={handleDeleteAddon}
            onResetMenuDatabase={handleResetMenuDatabase}
          />
        );
      default:
        return <BillingScreen categories={categories} menuItems={menuItems} taxRate={taxRate} drinkTaxRate={drinkTaxRate} restaurantInfo={restaurantInfo} tables={tables} floors={floors} tableCarts={tableCarts} addons={addons} onCreateOrder={handleCreateOrder} onUpdateTableStatus={handleUpdateTableStatus} onUpdateTableCarts={handleUpdateTableCarts} />;
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

    switch (mobileTab) {
      case 'billing':
        return (
          <BillingScreen 
            categories={categories} 
            menuItems={menuItems} 
            taxRate={taxRate} drinkTaxRate={drinkTaxRate}
            restaurantInfo={restaurantInfo}
            tables={tables}
            floors={floors}
            tableCarts={tableCarts}
            addons={addons}
            onCreateOrder={handleCreateOrder}
            onUpdateTableStatus={handleUpdateTableStatus}
            onUpdateTableCarts={handleUpdateTableCarts}
            variant="mobile"
          />
        );
      case 'analytics':
        return <Dashboard orders={orders} />;
      case 'orders':
        return (
          <OrdersList
            title="Live Orders"
            orders={orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED')}
            onUpdateStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            restaurantInfo={restaurantInfo}
            taxRate={taxRate} drinkTaxRate={drinkTaxRate}
            categories={categories}
          />
        );
      case 'bills':
        return (
          <OrdersList
            title="All Bills"
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            restaurantInfo={restaurantInfo}
            taxRate={taxRate} drinkTaxRate={drinkTaxRate}
            categories={categories}
          />
        );
      case 'reports':
        return <Reports orders={orders} />;
      case 'tablesConfig':
        return (
          <MenuManagement
            categories={categories}
            menuItems={menuItems}
            taxRate={taxRate} drinkTaxRate={drinkTaxRate}
            restaurantInfo={restaurantInfo}
            tables={tables}
            floors={floors}
            addons={addons}
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
            onAddAddon={handleAddAddon}
            onUpdateAddon={handleUpdateAddon}
            onDeleteAddon={handleDeleteAddon}
            onResetMenuDatabase={handleResetMenuDatabase}
            initialTab="TABLES"
          />
        );
      default:
        return <Dashboard orders={orders} />;
    }
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
      <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
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
        <main className="flex-1 overflow-hidden">
          {renderMobileScreen()}
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-white border-t shadow-lg shrink-0 safe-area-bottom">
          <div className="flex justify-start items-center gap-3 h-16 overflow-x-auto px-3">
            <MobileNavItem
              icon={<LayoutGrid size={22} />}
              label="Tables"
              active={mobileTab === 'billing'}
              onClick={() => setMobileTab('billing')}
            />
            <MobileNavItem
              icon={<ClipboardList size={22} />}
              label="Table Config"
              active={mobileTab === 'tablesConfig'}
              onClick={() => setMobileTab('tablesConfig')}
            />
            <MobileNavItem
              icon={<TrendingUp size={22} />}
              label="Analytics"
              active={mobileTab === 'analytics'}
              onClick={() => setMobileTab('analytics')}
            />
            <MobileNavItem
              icon={<Clock size={22} />}
              label="Orders"
              active={mobileTab === 'orders'}
              onClick={() => setMobileTab('orders')}
              badge={orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length}
            />
            <MobileNavItem
              icon={<Receipt size={22} />}
              label="Bills"
              active={mobileTab === 'bills'}
              onClick={() => setMobileTab('bills')}
            />
            <MobileNavItem
              icon={<PieChart size={22} />}
              label="Reports"
              active={mobileTab === 'reports'}
              onClick={() => setMobileTab('reports')}
            />
          </div>
        </nav>
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
               <span className="text-[#F57C00] font-bold text-lg">DRONA</span>
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
