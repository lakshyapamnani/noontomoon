import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Save, X, Utensils, Tag, Store, Percent, LayoutGrid, RefreshCw, Database, Package } from 'lucide-react';
import { MenuItem, Category, RestaurantInfo, Table, VegType, Addon, Floor } from '../types';

interface MenuManagementProps {
  categories: Category[];
  menuItems: MenuItem[];
  taxRate: number;
  drinkTaxRate: number;
  restaurantInfo: RestaurantInfo;
  tables: Table[];
  floors: Floor[];
  addons: Addon[];
  setTaxRate: (rate: number) => void;
  setDrinkTaxRate: (rate: number) => void;
  setRestaurantInfo: (info: RestaurantInfo) => void;
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
  onAddCategory: (name: string, type?: 'FOOD' | 'DRINK') => void;
  onUpdateCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  onAddTable: (name: string, floorId?: string) => void;
  onUpdateTable: (table: Table) => void;
  onDeleteTable: (id: string) => void;
  onAddFloor: (name: string) => void;
  onDeleteFloor: (id: string) => void;
  onAddAddon: (addon: Addon) => void;
  onUpdateAddon: (addon: Addon) => void;
  onDeleteAddon: (id: string) => void;
  onResetMenuDatabase?: () => void;
}

const MenuManagement: React.FC<MenuManagementProps> = ({ 
  categories, 
  menuItems, 
  taxRate,
  drinkTaxRate,
  restaurantInfo,
  tables,
  floors,
  addons,
  setTaxRate,
  setDrinkTaxRate,
  setRestaurantInfo,
  onAddMenuItem, 
  onUpdateMenuItem, 
  onDeleteMenuItem,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddTable,
  onUpdateTable,
  onDeleteTable,
  onAddFloor,
  onDeleteFloor,
  onAddAddon,
  onUpdateAddon,
  onDeleteAddon,
  onResetMenuDatabase
}) => {
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'CATEGORIES' | 'ADDONS' | 'DRINKS' | 'TABLES' | 'TAXES' | 'RESTAURANT' | 'DATABASE'>('ITEMS');
  const [searchTerm, setSearchTerm] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [newTableFloorId, setNewTableFloorId] = useState('');
  const [newFloorName, setNewFloorName] = useState('');
  
  const [isDrinkItemModalOpen, setIsDrinkItemModalOpen] = useState(false);
  const [isDrinkCatModalOpen, setIsDrinkCatModalOpen] = useState(false);
  const [editingDrinkItem, setEditingDrinkItem] = useState<MenuItem | null>(null);
  const [editingDrinkCat, setEditingDrinkCat] = useState<Category | null>(null);
  const drinkCategories = categories.filter(c => c.type === 'DRINK');
  const drinkItems = menuItems.filter(i => drinkCategories.some(c => c.id === i.categoryId));
  
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);

  // Addon form state
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');
  const [newAddonCategoryId, setNewAddonCategoryId] = useState('');

  // Item form state
  const [itemVegType, setItemVegType] = useState<VegType>('VEG');
  const [itemCategoryId, setItemCategoryId] = useState('');

  const [localRestaurantInfo, setLocalRestaurantInfo] = useState<RestaurantInfo>(restaurantInfo);

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenItemModal = (item?: MenuItem) => {
    if (!item && categories.length === 0) {
      alert('Please add at least one category first. Menu items need a category to appear on the billing screen.');
      return;
    }
    setEditingItem(item || null);
    setItemVegType(item?.vegType || 'VEG');
    // Set the category - use item's category if editing, otherwise use first category (required for billing screen)
    const defaultCatId = categories.length > 0 ? categories[0].id : '';
    setItemCategoryId(item?.categoryId || defaultCatId);
    setIsItemModalOpen(true);
  };

  // Sync category selection when categories load (e.g. from Firebase) while add-item modal is open
  useEffect(() => {
    if (isItemModalOpen && !editingItem && categories.length > 0 && !itemCategoryId) {
      setItemCategoryId(categories[0].id);
    }
  }, [isItemModalOpen, editingItem, categories, itemCategoryId]);

  const handleOpenCatModal = (cat?: Category) => {
    setEditingCat(cat || null);
    setIsCatModalOpen(true);
  };

  const handleOpenAddonModal = (addon?: Addon) => {
    if (addon) {
      setEditingAddon(addon);
      setNewAddonName(addon.name);
      setNewAddonPrice(addon.price.toString());
      setNewAddonCategoryId(addon.categoryId);
    } else {
      setEditingAddon(null);
      setNewAddonName('');
      setNewAddonPrice('');
      setNewAddonCategoryId(categories.length > 0 ? categories[0].id : '');
    }
    setIsAddonModalOpen(true);
  };

  const handleSaveAddon = () => {
    if (!newAddonName.trim() || !newAddonPrice || !newAddonCategoryId) {
      alert('Please fill all fields');
      return;
    }
    
    const addonData: Addon = {
      id: editingAddon?.id || `addon_${Date.now()}`,
      name: newAddonName.trim(),
      price: parseFloat(newAddonPrice),
      categoryId: newAddonCategoryId
    };

    if (editingAddon) {
      onUpdateAddon(addonData);
    } else {
      onAddAddon(addonData);
    }

    setIsAddonModalOpen(false);
    setEditingAddon(null);
    setNewAddonName('');
    setNewAddonPrice('');
    setNewAddonCategoryId('');
  };

  const handleSaveRestaurantProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setRestaurantInfo(localRestaurantInfo);
    alert('Restaurant profile updated successfully!');
  };

  return (
    <div className="h-full bg-gray-50 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Configuration</h1>
          <p className="text-sm text-gray-800 font-bold">Manage your menu, categories, and business rules</p>
        </div>
        {(activeTab === 'ITEMS' || activeTab === 'CATEGORIES' || activeTab === 'ADDONS') && (
          <button 
            onClick={() => {
              if (activeTab === 'ITEMS') handleOpenItemModal();
              else if (activeTab === 'CATEGORIES') handleOpenCatModal();
              else if (activeTab === 'ADDONS') handleOpenAddonModal();
            }}
            className="flex items-center gap-2 bg-[#F57C00] text-white px-6 py-2.5 rounded-xl font-black hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
          >
            <Plus size={20} /> Add New {activeTab === 'ITEMS' ? 'Item' : activeTab === 'CATEGORIES' ? 'Category' : 'Addon'}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border flex-1 flex flex-col overflow-hidden">
        <div className="flex border-b overflow-x-auto custom-scrollbar bg-gray-50/50">
          <TabItem label="Menu Items" active={activeTab === 'ITEMS'} onClick={() => setActiveTab('ITEMS')} icon={<Utensils size={18} />} />
          <TabItem label="Categories" active={activeTab === 'CATEGORIES'} onClick={() => setActiveTab('CATEGORIES')} icon={<Tag size={18} />} />
          <TabItem label="Drinks" active={activeTab === 'DRINKS'} onClick={() => setActiveTab('DRINKS')} icon={<Utensils size={18} />} />
          <TabItem label="Addons" active={activeTab === 'ADDONS'} onClick={() => setActiveTab('ADDONS')} icon={<Package size={18} />} />
          <TabItem label="Tables" active={activeTab === 'TABLES'} onClick={() => setActiveTab('TABLES')} icon={<LayoutGrid size={18} />} />
          <TabItem label="Taxes & Charges" active={activeTab === 'TAXES'} onClick={() => setActiveTab('TAXES')} icon={<Percent size={18} />} />
          <TabItem label="Restaurant Profile" active={activeTab === 'RESTAURANT'} onClick={() => setActiveTab('RESTAURANT')} icon={<Store size={18} />} />
          <TabItem label="Database" active={activeTab === 'DATABASE'} onClick={() => setActiveTab('DATABASE')} icon={<Database size={18} />} />
        </div>

        <div className="p-6 flex-1 flex flex-col overflow-hidden">
          {activeTab === 'ITEMS' && (
            <>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900" size={20} />
                <input 
                  type="text" 
                  placeholder="Search items by name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border-2 border-gray-300 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-900 font-black focus:ring-2 focus:ring-[#F57C00] outline-none shadow-sm placeholder:text-gray-400"
                />
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map(item => (
                    <div key={item.id} className="p-4 border-2 border-gray-200 bg-white rounded-xl hover:border-[#F57C00] group transition-all shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {item.vegType === 'BOTH' ? (
                            <span className="w-3 h-3 rounded-full" style={{background: 'linear-gradient(90deg, #22c55e 50%, #ef4444 50%)'}}></span>
                          ) : (
                            <span className={`w-3 h-3 rounded-full ${item.vegType === 'VEG' || item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          )}
                          <h4 className="font-black text-gray-900">{item.name}</h4>
                        </div>
                        {item.vegType === 'BOTH' ? (
                          <div className="text-right">
                            <span className="text-green-600 font-black text-xs">V: ₹{item.vegPrice}</span>
                            <span className="text-gray-400 mx-1">|</span>
                            <span className="text-red-600 font-black text-xs">NV: ₹{item.nonVegPrice}</span>
                          </div>
                        ) : (
                          <span className="text-orange-600 font-black">₹{item.price}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-800 mb-4 uppercase tracking-tighter font-black">
                        Category: {categories.find(c => c.id === item.categoryId)?.name || 'Unknown'}
                      </p>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenItemModal(item)}
                          className="flex-1 bg-gray-100 text-gray-900 py-2 rounded-lg text-xs font-black hover:bg-gray-200 transition-colors flex items-center justify-center gap-1 border-2 border-gray-300"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button 
                          onClick={() => onDeleteMenuItem(item.id)}
                          className="flex-1 bg-black text-white py-2 rounded-lg text-xs font-black hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'CATEGORIES' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="p-6 border-2 border-gray-200 bg-white rounded-2xl flex items-center justify-between hover:bg-orange-50/30 hover:border-[#F57C00] transition-colors group shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-black text-gray-900">{cat.name}</span>
                      <span className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">{cat.type === 'DRINK' ? 'Drink' : 'Food'}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleOpenCatModal(cat)} className="p-2 text-gray-900 hover:text-[#F57C00]"><Edit2 size={16} /></button>
                      <button onClick={() => onDeleteCategory(cat.id)} className="p-2 text-gray-900 hover:text-black"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'DRINKS' && (
            <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar flex-1 pb-20 pr-1">
              <div className="flex gap-4 mb-4">
                <button onClick={() => { setEditingDrinkItem(null); setItemCategoryId(drinkCategories.length > 0 ? drinkCategories[0].id : ''); setIsDrinkItemModalOpen(true); }} className="bg-[#F57C00] text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95"><Plus size={20} /> Add Drink Item</button>
                <button onClick={() => { setEditingDrinkCat(null); setIsDrinkCatModalOpen(true); }} className="bg-white text-[#F57C00] border-2 border-[#F57C00] px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-orange-50 transition-all shadow-sm active:scale-95"><Plus size={20} /> Add Drink Category</button>
              </div>
              
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-4 border-b-2 pb-2">Drink Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {drinkCategories.map(cat => (
                    <div key={cat.id} className="p-4 border-2 border-gray-200 bg-white rounded-xl flex justify-between items-center group hover:border-[#F57C00] transition-colors shadow-sm">
                      <span className="font-black text-gray-900">{cat.name}</span>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingDrinkCat(cat); setIsDrinkCatModalOpen(true); }} className="p-2 text-gray-900 hover:text-[#F57C00]"><Edit2 size={16} /></button>
                        <button onClick={() => onDeleteCategory(cat.id)} className="p-2 text-gray-900 hover:text-black"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-gray-900 mt-6 mb-4 border-b-2 pb-2">Drink Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {drinkItems.map(item => (
                    <div key={item.id} className="p-4 border-2 border-gray-200 bg-white rounded-xl group hover:border-[#F57C00] transition-colors shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-gray-900">{item.name}</h4>
                          {item.quantityStr && <span className="text-xs text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded-sm mt-1 inline-block">{item.quantityStr}</span>}
                          <span className="text-xs text-gray-400 block mt-1">{categories.find(c => c.id === item.categoryId)?.name}</span>
                        </div>
                        <span className="font-black text-[#F57C00]">₹{item.price}</span>
                      </div>
                      <div className="flex justify-end gap-1 mt-4">
                        <button onClick={() => { setEditingDrinkItem(item); setItemCategoryId(item.categoryId); setIsDrinkItemModalOpen(true); }} className="p-2 bg-gray-50 text-gray-900 rounded-xl hover:bg-gray-200"><Edit2 size={16} /></button>
                        <button onClick={() => onDeleteMenuItem(item.id)} className="p-2 bg-gray-50 text-gray-900 rounded-xl hover:bg-gray-200"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ADDONS' && (
            <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-1">
              {/* Group addons by category */}
              {categories.map(cat => {
                const categoryAddons = addons.filter(a => a.categoryId === cat.id);
                if (categoryAddons.length === 0) return null;
                
                return (
                  <div key={cat.id} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                      <h3 className="font-black text-gray-900">{cat.name}</h3>
                      <p className="text-xs text-gray-500 font-bold">{categoryAddons.length} addon(s)</p>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categoryAddons.map(addon => (
                          <div key={addon.id} className="p-4 border-2 border-gray-200 bg-gray-50 rounded-xl flex items-center justify-between hover:border-[#F57C00] group transition-all">
                            <div>
                              <span className="font-black text-gray-900">{addon.name}</span>
                              <span className="ml-3 text-orange-600 font-black">₹{addon.price}</span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleOpenAddonModal(addon)} className="p-2 text-gray-900 hover:text-[#F57C00]"><Edit2 size={14} /></button>
                              <button onClick={() => onDeleteAddon(addon.id)} className="p-2 text-gray-900 hover:text-red-500"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Show categories with no addons */}
              {addons.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-black">No addons configured yet</p>
                  <p className="text-sm">Click "Add New Addon" to create category-specific addons</p>
                </div>
              )}

              {/* Quick info about addons */}
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800 font-bold">
                  <strong>💡 Tip:</strong> Addons are category-specific extras that customers can add to their order. 
                  When selecting an item from a category with addons, customers will see these addon options along with veg/non-veg choice.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'TABLES' && (
            <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-1">
              <div className="max-w-xl p-6 border-2 border-gray-200 rounded-2xl bg-white shadow-sm">
                <h3 className="text-lg font-black text-gray-900 mb-4">Manage Floors</h3>
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={newFloorName}
                    onChange={(e) => setNewFloorName(e.target.value)}
                    placeholder="Enter floor name (e.g., Ground Floor)"
                    className="flex-1 p-3 rounded-xl border-2 border-gray-300 text-gray-900 font-black focus:ring-2 focus:ring-[#F57C00] outline-none placeholder:text-gray-400"
                  />
                  <button
                    onClick={() => {
                      if (!newFloorName.trim()) return;
                      onAddFloor(newFloorName.trim());
                      setNewFloorName('');
                    }}
                    disabled={!newFloorName.trim()}
                    className="px-5 py-3 bg-[#F57C00] text-white rounded-xl font-black hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus size={20} /> Add Floor
                  </button>
                </div>

                {floors.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {floors
                      .slice()
                      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name))
                      .map((floor) => (
                        <div key={floor.id} className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-50 px-3 py-1.5">
                          <span className="text-xs font-black text-gray-700 uppercase tracking-wide">{floor.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete floor \"${floor.name}\"? Tables on this floor will move to no floor.`)) {
                                onDeleteFloor(floor.id);
                              }
                            }}
                            className="text-gray-500 hover:text-red-600"
                            title="Delete floor"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 font-bold">No floors yet. Add one to organize tables by floor.</p>
                )}
              </div>

              {/* Add New Table */}
              <div className="max-w-xl p-6 border-2 border-gray-200 rounded-2xl bg-white shadow-sm">
                <h3 className="text-lg font-black text-gray-900 mb-4">Add New Table</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input 
                      type="text"
                      value={newTableName}
                      onChange={(e) => setNewTableName(e.target.value)}
                      placeholder="Enter table name (e.g., T-7)"
                      className="flex-1 p-3 rounded-xl border-2 border-gray-300 text-gray-900 font-black focus:ring-2 focus:ring-[#F57C00] outline-none placeholder:text-gray-400"
                    />
                    <button 
                      onClick={() => {
                        if (newTableName.trim()) {
                          onAddTable(newTableName.trim(), newTableFloorId || undefined);
                          setNewTableName('');
                        }
                      }}
                      disabled={!newTableName.trim()}
                      className="px-6 py-3 bg-[#F57C00] text-white rounded-xl font-black hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Plus size={20} /> Add Table
                    </button>
                  </div>

                  <select
                    value={newTableFloorId}
                    onChange={(e) => setNewTableFloorId(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-gray-300 text-gray-900 font-black focus:ring-2 focus:ring-[#F57C00] outline-none bg-white"
                  >
                    <option value="">No Floor</option>
                    {floors
                      .slice()
                      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name))
                      .map((floor) => (
                        <option key={floor.id} value={floor.id}>{floor.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Existing Tables */}
              <div>
                <h3 className="text-lg font-black text-gray-900 mb-4">Existing Tables ({tables.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {tables.map(table => (
                    <div 
                      key={table.id} 
                      className={`p-5 border-2 rounded-2xl text-center relative group transition-all ${
                        table.status === 'AVAILABLE' 
                          ? 'border-green-300 bg-green-50' 
                          : table.status === 'OCCUPIED'
                          ? 'border-orange-300 bg-orange-50'
                          : 'border-blue-300 bg-blue-50'
                      }`}
                    >
                      <div className="text-2xl font-black text-gray-900 mb-1">{table.name}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                        {floors.find(f => f.id === table.floorId)?.name || 'No floor'}
                      </div>
                      <div className={`text-xs font-black uppercase ${
                        table.status === 'AVAILABLE' 
                          ? 'text-green-600' 
                          : table.status === 'OCCUPIED'
                          ? 'text-orange-600'
                          : 'text-blue-600'
                      }`}>
                        {table.status}
                      </div>
                      <select
                        value={table.floorId || ''}
                        onChange={(e) => onUpdateTable({ ...table, floorId: e.target.value || undefined })}
                        className="mt-3 w-full p-2 rounded-lg border border-gray-300 text-[11px] font-black text-gray-700 bg-white"
                      >
                        <option value="">No Floor</option>
                        {floors
                          .slice()
                          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name))
                          .map((floor) => (
                            <option key={floor.id} value={floor.id}>{floor.name}</option>
                          ))}
                      </select>
                      {table.status === 'AVAILABLE' && (
                        <button 
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${table.name}?`)) {
                              onDeleteTable(table.id);
                            }
                          }}
                          className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      {table.status === 'OCCUPIED' && (
                        <div className="mt-2 text-xs text-gray-600 font-bold">
                          (Has active order)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {tables.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <LayoutGrid size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-black">No tables configured yet</p>
                    <p className="text-sm">Add tables above to get started with dine-in orders</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'TAXES' && (
            <div className="max-w-xl mx-auto w-full p-8 border-2 border-gray-200 rounded-3xl bg-white shadow-lg">
               <h3 className="text-xl font-black text-gray-900 mb-6">Global Tax Settings</h3>
               <div className="space-y-6">
                 <div>
                   <label className="block text-sm font-black text-gray-900 mb-2 uppercase">GST (Integrated)</label>
                   <div className="flex gap-4">
                     <input 
                      type="number" 
                      value={taxRate * 100} 
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) / 100)}
                      className="flex-1 p-4 rounded-xl border-2 border-gray-300 text-gray-900 font-black text-lg focus:ring-2 focus:ring-[#F57C00] outline-none shadow-inner" 
                     />
                     <span className="p-4 font-black text-gray-900 bg-gray-50 rounded-xl border-2 border-gray-300">%</span>
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-black text-gray-900 mb-2 uppercase">Drinks VAT (Integrated)</label>
                   <div className="flex gap-4">
                     <input 
                      type="number" 
                      value={drinkTaxRate * 100} 
                      onChange={(e) => setDrinkTaxRate(parseFloat(e.target.value) / 100)}
                      className="flex-1 p-4 rounded-xl border-2 border-gray-300 text-gray-900 font-black text-lg focus:ring-2 focus:ring-[#F57C00] outline-none shadow-inner" 
                     />
                     <span className="p-4 font-black text-gray-900 bg-gray-50 rounded-xl border-2 border-gray-300">%</span>
                   </div>
                 </div>
                 <button 
                   type="button"
                   onClick={() => {
                     setTaxRate(taxRate);
                     setDrinkTaxRate(drinkTaxRate);
                   }}
                   className="w-full bg-[#F57C00] text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:bg-orange-600 shadow-xl shadow-orange-100 transition-all active:scale-95"
                 >
                   <Save size={20} /> Save Settings
                 </button>
                 <p className="text-xs text-gray-800 text-center font-black uppercase">These settings apply to all bills globally.</p>
               </div>
            </div>
          )}

          {activeTab === 'RESTAURANT' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <div className="max-w-xl mx-auto w-full p-8 border-2 border-gray-200 rounded-3xl bg-white shadow-lg">
                 <h3 className="text-xl font-black text-gray-900 mb-6">Restaurant Profile</h3>
                 <form onSubmit={handleSaveRestaurantProfile} className="space-y-6">
                   <div>
                     <label className="block text-sm font-black text-gray-900 mb-2 uppercase">Restaurant Name</label>
                     <input 
                      type="text" 
                      value={localRestaurantInfo.name} 
                      onChange={(e) => setLocalRestaurantInfo({...localRestaurantInfo, name: e.target.value})}
                      placeholder="Enter restaurant name"
                      className="w-full p-4 rounded-xl border-2 border-gray-300 text-gray-900 font-black focus:ring-2 focus:ring-[#F57C00] outline-none shadow-inner placeholder:text-gray-400" 
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-black text-gray-900 mb-2 uppercase">Phone Number</label>
                     <input 
                      type="text" 
                      value={localRestaurantInfo.phone} 
                      onChange={(e) => setLocalRestaurantInfo({...localRestaurantInfo, phone: e.target.value})}
                      placeholder="e.g., +91 9876543210"
                      className="w-full p-4 rounded-xl border-2 border-gray-300 text-gray-900 font-black focus:ring-2 focus:ring-[#F57C00] outline-none shadow-inner placeholder:text-gray-400" 
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-black text-gray-900 mb-2 uppercase">Address</label>
                     <textarea 
                      rows={3}
                      value={localRestaurantInfo.address} 
                      onChange={(e) => setLocalRestaurantInfo({...localRestaurantInfo, address: e.target.value})}
                      placeholder="Enter complete address for the bill"
                      className="w-full p-4 rounded-xl border-2 border-gray-300 text-gray-900 font-black focus:ring-2 focus:ring-[#F57C00] outline-none resize-none shadow-inner placeholder:text-gray-400" 
                     />
                   </div>
                   <button type="submit" className="w-full bg-[#F57C00] text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:bg-orange-600 shadow-xl shadow-orange-100 transition-all active:scale-95">
                     <Save size={20} /> Save Business Profile
                   </button>
                   <p className="text-xs text-gray-800 text-center font-black uppercase">These details appear on your printed receipts.</p>
                 </form>
              </div>
            </div>
          )}

          {activeTab === 'DATABASE' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Reset Menu Database Section */}
              <div className="p-8 border-2 border-orange-200 rounded-2xl bg-orange-50/50 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <RefreshCw size={28} className="text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-gray-900 mb-2">Reset Menu Database</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      This will clear all existing menu items and categories from Firebase database and replace them with the new menu defined in the app. Use this to sync the latest menu with all connected devices.
                    </p>
                    <div className="bg-white p-4 rounded-xl border mb-4">
                      <h4 className="font-bold text-gray-900 mb-2">New Menu Summary:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• <strong>12 Categories:</strong> Power Up W Greens, Eggilicious, Humming Hummus, Pasta, Sandwiches, Smokin Grill, House of Keema, Wraps Rolls & Quesadilla, Meals & More, Beverages, Smoothies & Bowls, Dessert</li>
                        <li>• <strong>93 Menu Items</strong> with veg/non-veg dual pricing support</li>
                      </ul>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to reset the menu database? This will replace all existing menu items and categories.')) {
                          onResetMenuDatabase?.();
                        }
                      }}
                      className="px-6 py-3 bg-orange-500 text-white rounded-xl font-black hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg"
                    >
                      <Database size={20} />
                      Reset & Sync New Menu
                    </button>
                  </div>
                </div>
              </div>

              {/* Current Stats */}
              <div className="p-6 border-2 border-gray-200 rounded-2xl bg-white shadow-sm">
                <h3 className="text-lg font-black text-gray-900 mb-4">Current Database Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="text-3xl font-black text-blue-600">{categories.length}</div>
                    <div className="text-sm text-gray-600 font-bold">Categories</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl">
                    <div className="text-3xl font-black text-green-600">{menuItems.length}</div>
                    <div className="text-sm text-gray-600 font-bold">Menu Items</div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-6 border-2 border-blue-200 rounded-2xl bg-blue-50/50">
                <h3 className="text-lg font-black text-gray-900 mb-2">📱 Mobile View Access</h3>
                <p className="text-sm text-gray-600 mb-3">
                  To access the mobile view on your phone, use this URL:
                </p>
                <div className="bg-white p-3 rounded-lg border text-center">
                  <code className="text-sm font-mono text-blue-600 font-bold">
                    {window.location.origin}/mobile
                  </code>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Open this URL on your phone to see Analytics, Orders, Bills, and Reports in a mobile-optimized view.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Addon Modal */}
      {isAddonModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-gray-100">
            <div className="bg-gray-50 p-6 border-b-2 border-gray-200 flex justify-between items-center">
              <h3 className="text-2xl font-black text-gray-900">{editingAddon ? 'Edit' : 'Add'} Addon</h3>
              <button onClick={() => setIsAddonModalOpen(false)} className="text-gray-900 hover:text-[#F57C00] transition-colors"><X size={28} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase">Addon Name *</label>
                <input 
                  type="text"
                  value={newAddonName}
                  onChange={(e) => setNewAddonName(e.target.value)}
                  placeholder="e.g., Extra Cheese"
                  className="w-full p-4 rounded-xl border-2 border-gray-300 text-gray-900 font-black focus:ring-2 focus:ring-[#F57C00] outline-none shadow-inner placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase">Price (₹) *</label>
                <input 
                  type="number"
                  value={newAddonPrice}
                  onChange={(e) => setNewAddonPrice(e.target.value)}
                  placeholder="e.g., 30"
                  min="0"
                  step="1"
                  className="w-full p-4 rounded-xl border-2 border-gray-300 text-gray-900 font-black focus:ring-2 focus:ring-[#F57C00] outline-none shadow-inner placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase">Apply to Category *</label>
                <select
                  value={newAddonCategoryId}
                  onChange={(e) => setNewAddonCategoryId(e.target.value)}
                  className="w-full p-4 rounded-xl border-2 border-gray-300 text-gray-900 font-black focus:ring-2 focus:ring-[#F57C00] outline-none shadow-inner bg-white"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">This addon will appear only for items in the selected category</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddonModalOpen(false)}
                  className="flex-1 py-4 rounded-xl border-2 border-gray-300 text-gray-900 font-black hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleSaveAddon}
                  disabled={!newAddonName.trim() || !newAddonPrice || !newAddonCategoryId}
                  className="flex-1 py-4 bg-[#F57C00] text-white rounded-xl font-black hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save size={20} /> {editingAddon ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-gray-100">
            <div className="bg-gray-50 p-6 border-b-2 border-gray-200 flex justify-between items-center">
              <h3 className="text-2xl font-black text-gray-900">{editingItem ? 'Edit' : 'Add'} Menu Item</h3>
              <button onClick={() => setIsItemModalOpen(false)} className="text-gray-900 hover:text-[#F57C00] transition-colors"><X size={28} /></button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const vegPrice = itemVegType === 'BOTH' ? parseFloat(formData.get('vegPrice') as string) : undefined;
                const nonVegPrice = itemVegType === 'BOTH' ? parseFloat(formData.get('nonVegPrice') as string) : undefined;
                const basePrice = itemVegType === 'BOTH' 
                  ? (vegPrice || 0) // Default to veg price
                  : parseFloat(formData.get('price') as string);
                
                // Use the controlled state value for categoryId
                const categoryId = itemCategoryId;
                console.log('MenuManagement - Saving item with categoryId:', categoryId);
                console.log('MenuManagement - itemCategoryId state:', itemCategoryId);
                console.log('MenuManagement - Available categories:', categories.map(c => ({ id: c.id, name: c.name })));
                
                if (!categoryId) {
                  alert('Please select a category');
                  return;
                }
                
                const itemData = {
                  name: formData.get('name') as string,
                  price: basePrice,
                  categoryId: categoryId,
                  isVeg: itemVegType === 'VEG',
                  vegType: itemVegType,
                  vegPrice: vegPrice,
                  nonVegPrice: nonVegPrice
                };
                console.log('MenuManagement - Item data being saved:', itemData);
                if (editingItem) {
                  onUpdateMenuItem({ ...editingItem, ...itemData });
                } else {
                  onAddMenuItem(itemData);
                }
                setIsItemModalOpen(false);
                setItemVegType('VEG');
              }}
              className="p-6 space-y-5"
            >
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wider">Item Name</label>
                <input 
                  name="name" 
                  defaultValue={editingItem?.name} 
                  required 
                  className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-black text-lg focus:ring-2 focus:ring-[#F57C00] outline-none shadow-inner" 
                />
              </div>
              
              {/* Veg Type Toggle */}
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wider">Food Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setItemVegType('VEG')}
                    className={`flex-1 py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                      itemVegType === 'VEG' 
                        ? 'bg-green-500 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border-2 border-current p-[2px]">
                      <div className="w-full h-full rounded-full bg-current"></div>
                    </span>
                    Veg Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemVegType('NON_VEG')}
                    className={`flex-1 py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                      itemVegType === 'NON_VEG' 
                        ? 'bg-red-500 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border-2 border-current p-[2px]">
                      <div className="w-full h-full rounded-full bg-current"></div>
                    </span>
                    Non-Veg Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemVegType('BOTH')}
                    className={`flex-1 py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                      itemVegType === 'BOTH' 
                        ? 'bg-purple-500 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border-2 border-current p-[2px] flex items-center justify-center">
                      <div className="w-full h-full rounded-full" style={{background: 'linear-gradient(90deg, #22c55e 50%, #ef4444 50%)'}}></div>
                    </span>
                    Both
                  </button>
                </div>
              </div>

              {/* Price Fields - Conditional based on vegType */}
              {itemVegType === 'BOTH' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black text-green-600 mb-2 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full border-2 border-green-600 p-[2px]">
                        <div className="w-full h-full rounded-full bg-green-600"></div>
                      </span>
                      Veg Price (₹)
                    </label>
                    <input 
                      name="vegPrice" 
                      type="number" 
                      defaultValue={editingItem?.vegPrice} 
                      required 
                      className="w-full p-4 bg-white border-2 border-green-300 rounded-xl text-gray-900 font-black text-lg focus:ring-2 focus:ring-green-500 outline-none shadow-inner" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-red-600 mb-2 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full border-2 border-red-600 p-[2px]">
                        <div className="w-full h-full rounded-full bg-red-600"></div>
                      </span>
                      Non-Veg Price (₹)
                    </label>
                    <input 
                      name="nonVegPrice" 
                      type="number" 
                      defaultValue={editingItem?.nonVegPrice} 
                      required 
                      className="w-full p-4 bg-white border-2 border-red-300 rounded-xl text-gray-900 font-black text-lg focus:ring-2 focus:ring-red-500 outline-none shadow-inner" 
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wider">Price (₹)</label>
                  <input 
                    name="price" 
                    type="number" 
                    defaultValue={editingItem?.price} 
                    required 
                    className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-black text-lg focus:ring-2 focus:ring-[#F57C00] outline-none shadow-inner" 
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wider">Category</label>
                <select 
                  name="categoryId" 
                  value={itemCategoryId}
                  onChange={(e) => setItemCategoryId(e.target.value)}
                  required
                  className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-black focus:ring-2 focus:ring-[#F57C00] outline-none shadow-inner appearance-none cursor-pointer"
                >
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <button type="submit" className="w-full bg-[#F57C00] text-white py-4 rounded-2xl font-black text-xl shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95">
                {editingItem ? 'Update Menu Item' : 'Create Menu Item'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-gray-100">
            <div className="bg-gray-50 p-6 border-b-2 border-gray-200 flex justify-between items-center">
              <h3 className="text-2xl font-black text-gray-900">{editingCat ? 'Edit' : 'Add'} Category</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="text-gray-900 hover:text-[#F57C00] transition-colors"><X size={28} /></button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('catName') as string;
                const type = formData.get('catType') as 'FOOD' | 'DRINK';
                if (editingCat) {
                  onUpdateCategory({ ...editingCat, name, type });
                } else {
                  onAddCategory(name, type);
                }
                setIsCatModalOpen(false);
              }}
              className="p-6 space-y-5"
            >
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wider">Category Name</label>
                <input 
                  name="catName" 
                  defaultValue={editingCat?.name} 
                  required 
                  className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-black text-lg focus:ring-2 focus:ring-[#F57C00] outline-none shadow-inner" 
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wider">Category Type</label>
                <select 
                  name="catType"
                  defaultValue={editingCat?.type || 'FOOD'}
                  className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-black focus:ring-2 focus:ring-[#F57C00] outline-none shadow-inner appearance-none cursor-pointer"
                >
                  <option value="FOOD">Food</option>
                  <option value="DRINK">Drink</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-[#F57C00] text-white py-4 rounded-2xl font-black text-xl shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95">
                {editingCat ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DRINK CATEGORY MODAL */}
      {isDrinkCatModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-gray-100">
            <div className="bg-gray-50 p-6 border-b-2 border-gray-200 flex justify-between items-center">
              <h3 className="text-2xl font-black text-gray-900">{editingDrinkCat ? 'Edit' : 'Add'} Drink Category</h3>
              <button onClick={() => setIsDrinkCatModalOpen(false)} className="text-gray-900 hover:text-[#F57C00] transition-colors"><X size={28} /></button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('catName') as string;
                if (editingDrinkCat) {
                  onUpdateCategory({ ...editingDrinkCat, name, type: 'DRINK' });
                } else {
                  onAddCategory(name, 'DRINK');
                }
                setIsDrinkCatModalOpen(false);
              }}
              className="p-6 space-y-5"
            >
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wider">Category Name</label>
                <input name="catName" defaultValue={editingDrinkCat?.name} required className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-black text-lg focus:ring-2 focus:ring-[#F57C00] outline-none shadow-inner" />
              </div>
              <button type="submit" className="w-full bg-[#F57C00] text-white py-4 rounded-2xl font-black text-xl shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95">
                {editingDrinkCat ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DRINK ITEM MODAL */}
      {isDrinkItemModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-gray-100">
            <div className="bg-gray-50 p-6 border-b-2 border-gray-200 flex justify-between items-center">
              <h3 className="text-2xl font-black text-gray-900">{editingDrinkItem ? 'Edit' : 'Add'} Drink</h3>
              <button onClick={() => setIsDrinkItemModalOpen(false)} className="text-gray-900 hover:text-[#F57C00] transition-colors"><X size={28} /></button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const price = parseFloat(formData.get('price') as string);
                const quantityStr = formData.get('quantityStr') as string;
                const categoryId = itemCategoryId;
                
                if (!categoryId) { alert('Please select or create a drink category first.'); return; }
                
                const drinkData = { 
                  name, price, quantityStr, categoryId, isVeg: true, vegType: 'VEG' as const
                };

                if (editingDrinkItem) onUpdateMenuItem({ ...editingDrinkItem, ...drinkData });
                else onAddMenuItem(drinkData);
                
                setIsDrinkItemModalOpen(false);
              }}
              className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar"
            >
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wider">Drink Name</label>
                <input name="name" defaultValue={editingDrinkItem?.name} required className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-black text-lg focus:ring-2 focus:ring-[#F57C00] outline-none shadow-inner" />
              </div>
              
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wider">Quantity (e.g. 300ml, 1 Pint)</label>
                <input name="quantityStr" defaultValue={editingDrinkItem?.quantityStr} className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-black text-lg focus:ring-2 focus:ring-[#F57C00] outline-none shadow-inner" />
              </div>

              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wider">Price (₹)</label>
                <input name="price" type="number" defaultValue={editingDrinkItem?.price} required className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-black text-lg focus:ring-2 focus:ring-[#F57C00] outline-none shadow-inner" />
              </div>

              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wider">Category</label>
                <select value={itemCategoryId} onChange={(e) => setItemCategoryId(e.target.value)} required className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-black focus:ring-2 focus:ring-[#F57C00] outline-none shadow-inner appearance-none cursor-pointer">
                  <option value="" disabled>Select Drink Category</option>
                  {drinkCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <button type="submit" className="w-full bg-[#F57C00] text-white py-4 rounded-2xl font-black text-xl shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95">
                {editingDrinkItem ? 'Update Drink' : 'Save Drink'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TabItem: React.FC<{ label: string; active: boolean; onClick: () => void; icon: React.ReactNode }> = ({ label, active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 font-black text-sm transition-all border-b-4 shrink-0 ${
      active ? 'border-[#F57C00] text-[#F57C00] bg-white' : 'border-transparent text-gray-800 hover:text-gray-900 hover:bg-gray-100'
    }`}
  >
    {icon} {label}
  </button>
);

export default MenuManagement;
