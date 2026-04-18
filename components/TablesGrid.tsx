import React, { useMemo } from 'react';
import { Printer, ShoppingCart } from 'lucide-react';
import { Table, CartItem, Floor } from '../types';

export type TableCart = Record<string, { items: CartItem[]; customerName: string }>;

interface TablesGridProps {
  tables: Table[];
  floors?: Floor[];
  tableCarts: TableCart;
  selectedTableId?: string | null;
  onSelectTable: (tableId: string) => void;
  onPrintTable?: (tableId: string) => void;
  onCheckoutTable?: (tableId: string) => void;
}

const TablesGrid: React.FC<TablesGridProps> = ({
  tables,
  floors = [],
  tableCarts,
  selectedTableId,
  onSelectTable,
  onPrintTable,
  onCheckoutTable,
}) => {
  const tableStats = useMemo(() => {
    const stats: Record<string, { itemCount: number; total: number }> = {};
    for (const t of tables) {
      const items = tableCarts?.[t.id]?.items || [];
      const itemCount = items.reduce((sum, it) => sum + (it.quantity || 0), 0);
      const total = items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0);
      stats[t.id] = { itemCount, total };
    }
    return stats;
  }, [tables, tableCarts]);

  const floorSections = useMemo(() => {
    if (!floors.length) {
      return [{ floorId: '', label: '', tables }];
    }
    const sortedFloors = [...floors].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name)
    );
    const byId = new Map<string, Table[]>();
    for (const f of sortedFloors) byId.set(f.id, []);
    const unassigned: Table[] = [];
    for (const t of tables) {
      if (t.floorId && byId.has(t.floorId)) byId.get(t.floorId)!.push(t);
      else unassigned.push(t);
    }
    const sections: { floorId: string; label: string; tables: Table[] }[] = [];
    for (const f of sortedFloors) {
      const ts = byId.get(f.id) || [];
      if (ts.length) sections.push({ floorId: f.id, label: f.name, tables: ts });
    }
    if (unassigned.length) {
      sections.push({ floorId: '__none__', label: 'Other / No floor', tables: unassigned });
    }
    return sections;
  }, [tables, floors]);

  const renderCard = (table: Table) => {
    const { itemCount, total } = tableStats[table.id] || { itemCount: 0, total: 0 };
    const isOccupied = table.status === 'OCCUPIED' || itemCount > 0;
    const isSelected = selectedTableId === table.id;
    const seats = table.capacity ?? 2;
    const seatsLabel = seats === 1 ? '1 seat' : `${seats} seats`;

    return (
      <button
        type="button"
        onClick={() => onSelectTable(table.id)}
        className={[
          'relative text-left p-5 rounded-2xl border-2 transition-all',
          'shadow-sm hover:shadow-md',
          isSelected
            ? 'border-[#F57C00] bg-orange-50'
            : isOccupied
              ? 'border-orange-200 bg-orange-50/60'
              : 'border-gray-200 bg-white',
        ].join(' ')}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg md:text-xl font-black text-gray-900">{table.name}</div>
            <div className={isOccupied ? 'text-[#F57C00]' : 'text-gray-600'}>
              <span className="text-xs font-black">{seatsLabel}</span>
            </div>
          </div>
          {isOccupied && (
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F57C00]" />
              {itemCount > 0 && (
                <span className="text-[10px] font-black text-[#F57C00] bg-white/80 border border-orange-200 px-2 py-0.5 rounded-full">
                  {itemCount}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bill Amount & Print Icon */}
        {isOccupied && total > 0 && (
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-orange-200/60">
            <span className="text-sm font-black text-[#F57C00]">₹{total.toFixed(0)}</span>
            <div className="flex items-center gap-1.5">
              {onCheckoutTable && (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCheckoutTable(table.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      onCheckoutTable(table.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-[#262626] border border-gray-700 text-white hover:bg-black transition-all shadow-sm cursor-pointer"
                  title="Checkout"
                >
                  <ShoppingCart size={14} />
                </div>
              )}
              {onPrintTable && (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrintTable(table.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      onPrintTable(table.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-white border border-orange-200 text-[#F57C00] hover:bg-orange-100 transition-all shadow-sm cursor-pointer"
                  title="Print Bill"
                >
                  <Printer size={14} />
                </div>
              )}
            </div>
          </div>
        )}
      </button>
    );
  };

  return (
    <div data-mobile-scroll="tables-grid" className="p-4 md:p-6 overflow-y-auto h-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {floorSections.map((section, sectionIdx) => (
          <React.Fragment key={section.floorId || `section-${sectionIdx}`}>
            {floors.length > 0 && section.label && (
              <React.Fragment key={`header-${sectionIdx}`}>
                {sectionIdx > 0 && (
                  <div
                    className="col-span-full my-2 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"
                    aria-hidden
                  />
                )}
                <div className="col-span-full pt-1 pb-0">
                  <div className="text-[11px] font-black uppercase tracking-widest text-gray-500 px-0.5">
                    {section.label}
                  </div>
                </div>
              </React.Fragment>
            )}
            {section.tables.map((table) => (
              <React.Fragment key={table.id}>
                {renderCard(table)}
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}

        {tables.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="text-sm font-black">No tables configured</div>
            <div className="text-xs font-bold mt-1">Add tables from Configuration</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TablesGrid;
