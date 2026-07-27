
import React, { useMemo, useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  Eye, 
  Printer, 
  PackageCheck, 
  FileText, 
  CheckCircle2, 
  User, 
  CalendarDays, 
  History,
  Search,
  Filter,
  X,
  MapPin,
  Calendar,
  Phone,
  CreditCard,
  Banknote,
  Smartphone,
  Trash2,
  Download,
  Users,
  ArrowLeft,
  Wallet
} from 'lucide-react';
import { Order, OrderStatus, RestaurantInfo, CartItem, Category, PaymentMode } from '../types';
import { isOrderInCurrentBusinessDay } from '../utils/businessDay';
import { calculateOrderTax } from '../utils/tax';

const formatItemDisplay = (it: CartItem) => {
  return `${it.name} x ${it.quantity}`;
};

interface OrdersListProps {
  title: string;
  orders: Order[];
  lastNewDayAt?: string | null;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onDeleteOrder: (id: string) => void;
  restaurantInfo: RestaurantInfo;
  taxRate: number;
  drinkTaxRate?: number;
  categories?: Category[];
}

const OrdersList: React.FC<OrdersListProps> = ({ title, orders, lastNewDayAt = null, onUpdateStatus, onDeleteOrder, restaurantInfo, taxRate, drinkTaxRate = 0, categories = [] }) => {
  const isAllBillsView = title === "All Bills" || title === "Completed Orders" || title === "Cancelled Orders";
  const [activeTab, setActiveTab] = useState<'TODAY' | 'ALL'>('TODAY');
  const [kotCategoryId, setKotCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentMode | 'ALL'>('ALL');
  const [monthFilter, setMonthFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCsvMenu, setShowCsvMenu] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Ensure orders is always an array
  const safeOrders = orders || [];
  
  // Today's orders = current business session (since last Start New Day), not midnight
  const { todayOrders, allOrders } = useMemo(() => {
    return {
      todayOrders: safeOrders.filter(o => isOrderInCurrentBusinessDay(o, lastNewDayAt)),
      allOrders: safeOrders
    };
  }, [safeOrders, lastNewDayAt]);

  // Derive available months from orders for the month dropdown
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    safeOrders.forEach(o => {
      if (o.date && /^\d{4}-\d{2}/.test(o.date)) {
        monthSet.add(o.date.substring(0, 7)); // 'YYYY-MM'
      }
    });
    return Array.from(monthSet).sort().reverse();
  }, [safeOrders]);

  const displayedOrders = useMemo(() => {
    let list = isAllBillsView 
      ? (activeTab === 'TODAY' ? todayOrders : allOrders) 
      : safeOrders;

    // Month filter - only if dates are not specified
    if (monthFilter !== 'ALL' && !startDate && !endDate) {
      list = list.filter(o => o.date && o.date.startsWith(monthFilter));
    }

    // Custom Date Range filter
    if (startDate) {
      list = list.filter(o => o.date && o.date >= startDate);
    }
    if (endDate) {
      list = list.filter(o => o.date && o.date <= endDate);
    }
      
    const paymentFiltered = paymentFilter !== 'ALL'
      ? list.filter(o => o.paymentMode === paymentFilter)
      : list;
    
    if (!searchQuery.trim()) return paymentFiltered;
    
    return paymentFiltered.filter(o => 
      o.billNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [isAllBillsView, activeTab, todayOrders, allOrders, safeOrders, searchQuery, paymentFilter, monthFilter, startDate, endDate]);

  // Calculate total sale for displayed orders
  const totalSale = useMemo(() => {
    return displayedOrders.reduce((sum, order) => sum + (order.subtotal || 0), 0);
  }, [displayedOrders]);

  const totalRevenue = useMemo(() => {
    return displayedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  }, [displayedOrders]);

  const printReceipt = async (order: Order) => {
    // Compute GST/VAT using unified helper and round them
    const taxInfo = calculateOrderTax(order.items || [], categories, taxRate, drinkTaxRate);
    const gstAmt = Math.round(taxInfo.gst);
    const vatAmt = Math.round(taxInfo.vat);


    const printHtmlContent = (htmlContent: string) => {
      document.getElementById('print-section')?.remove();
      document.getElementById('print-section-style')?.remove();

      const printStyle = document.createElement('style');
      printStyle.id = 'print-section-style';
      printStyle.innerHTML = `
        @media print {
          body > *:not(#print-section) {
            display: none !important;
          }
          #print-section, #print-section * {
            display: block !important;
            visibility: visible !important;
          }
          #print-section style, #print-section script {
            display: none !important;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white !important;
          }
        }
      `;
      document.head.appendChild(printStyle);

      const printSection = document.createElement('div');
      printSection.id = 'print-section';
      printSection.innerHTML = htmlContent;
      document.body.appendChild(printSection);

      setTimeout(() => {
        window.focus();
        window.print();
        
        setTimeout(() => {
          printSection.remove();
          printStyle.remove();
        }, 1000);
      }, 150);
    };

    const html = `
      <div class="print-container">
        <style>
          .print-container {
            font-family: 'Arial Black', Arial, sans-serif; 
            width: 76mm; 
            max-width: 76mm;
            margin: 0 auto; 
            padding: 3mm; 
            font-size: 14px; 
            color: #000; 
            line-height: 1.3;
            font-weight: 950;
            background-color: #fff;
          }
          .print-container .center { text-align: center; }
          .print-container .bold { font-weight: 950; }
          .print-container .line { border-bottom: 2px dashed #000; margin: 8px 0; }
          .print-container .header-name { font-size: 18px; font-weight: 950; margin-bottom: 2px; text-transform: uppercase; }
          .print-container .item-row { display: flex; justify-content: space-between; margin: 4px 0; font-weight: 950; }
          .print-container .item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 5px; font-weight: 950; }
          .print-container .qty { width: 25px; text-align: center; font-weight: 950; }
          .print-container .price { width: 45px; text-align: right; font-weight: 950; }
          .print-container .footer { margin-top: 15px; font-size: 12px; font-weight: 950; }
          .print-container .total-section { font-size: 16px; margin-top: 5px; font-weight: 950; }
        </style>
        <div class="center header-name">${restaurantInfo.name}</div>
        <div class="center">${restaurantInfo.address}</div>
        <div class="center">Tel: ${restaurantInfo.phone}</div>
        <div class="line"></div>
        <div class="center bold">DUPLICATE BILL</div>
        <div class="line"></div>
        <div>Bill: ${order.billNo}</div>
        ${order.tableName ? `<div>Table: ${order.tableName}</div>` : ''}
        ${order.customerName ? `<div>Cust: ${order.customerName}</div>` : ''}
        <div>Date: ${order.date}</div>
        <div>Time: ${order.time}</div>
        <div>Type: ${order.orderType}</div>
        <div class="line"></div>
        <div class="bold item-row">
          <span class="item-name">Item</span>
          <span class="qty">Qty</span>
          <span class="price">Amt</span>
        </div>
        ${order.items.map(it => `
          <div class="item-row">
            <span class="item-name">${it.name}${it.selectedPortion === 'HALF' ? ' (Half)' : it.selectedPortion === 'FULL' ? ' (Full)' : ''}</span>
            <span class="qty">${it.quantity}</span>
            <span class="price">${(it.price * it.quantity).toFixed(0)}</span>
          </div>
        `).join('')}
        <div class="line"></div>
        <div class="item-row"><span>Subtotal:</span><span>₹${order.subtotal.toFixed(0)}</span></div>
        <div class="item-row"><span>GST (${(taxRate * 100).toFixed(0)}%):</span><span>₹${gstAmt.toFixed(0)}</span></div>
        <div class="item-row"><span>VAT (${(drinkTaxRate * 100).toFixed(0)}%):</span><span>₹${vatAmt.toFixed(0)}</span></div>
        <div class="item-row"><span>Tax Total:</span><span>₹${(gstAmt + vatAmt).toFixed(0)}</span></div>
        ${order.discountAmount && order.discountAmount > 0 ? `<div class="item-row"><span>Discount (${order.discountPercent || 0}%):</span><span>-₹${order.discountAmount.toFixed(0)}</span></div>` : ''}
        <div class="item-row bold total-section"><span>TOTAL:</span><span>₹${order.total.toFixed(0)}</span></div>
        <div class="line"></div>
        <div class="center">Paid via ${order.paymentMode}</div>
        <div class="footer center">
          <p>Thank you!</p>
          <p>Visit again.</p>
        </div>
      </div>
    `;

    printHtmlContent(html);
  };

  const exportToPDF = (data: Order[], subTitle: string) => {
    if (!data || data.length === 0) return;
    const printHtmlContent = (htmlContent: string) => {
      document.getElementById('print-section')?.remove();
      document.getElementById('print-section-style')?.remove();

      const printStyle = document.createElement('style');
      printStyle.id = 'print-section-style';
      printStyle.innerHTML = `
        @media print {
          body > *:not(#print-section) {
            display: none !important;
          }
          #print-section, #print-section * {
            display: block !important;
            visibility: visible !important;
          }
          #print-section style, #print-section script {
            display: none !important;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white !important;
          }
        }
      `;
      document.head.appendChild(printStyle);

      const printSection = document.createElement('div');
      printSection.id = 'print-section';
      printSection.innerHTML = htmlContent;
      document.body.appendChild(printSection);

      setTimeout(() => {
        window.focus();
        window.print();
        
        setTimeout(() => {
          printSection.remove();
          printStyle.remove();
        }, 1000);
      }, 150);
    };

    const pdfTotalSale = data.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const pdfTotalRevenue = data.reduce((sum, o) => sum + (o.total || 0), 0);

    const html = `
      <div class="print-container">
        <style>
          .print-container {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            color: #000;
            font-weight: bold;
            background-color: #fff;
          }
          .print-container .header { text-align: center; border-bottom: 2px solid #F57C00; padding-bottom: 20px; margin-bottom: 30px; }
          .print-container h1 { color: #F57C00; margin: 0; font-size: 28px; }
          .print-container .meta { font-size: 14px; color: #000; margin-top: 5px; }
          .print-container .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
          .print-container .summary-card { padding: 20px; border: 1px solid #eee; border-radius: 10px; text-align: center; }
          .print-container .summary-label { font-size: 12px; color: #000; text-transform: uppercase; font-weight: bold; }
          .print-container .summary-value { font-size: 24px; color: #F57C00; font-weight: bold; margin-top: 10px; }
          .print-container table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .print-container th, .print-container td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; color: #000; }
          .print-container th { background-color: #fafafa; font-weight: bold; text-transform: uppercase; color: #000; }
        </style>
        <div class="header">
          <h1>DRONA POS - Sales Report</h1>
          <div class="meta">Generated on: ${new Date().toLocaleString()}</div>
          <div class="meta">Filter: ${subTitle}</div>
        </div>
        
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">Total Orders</div>
            <div class="summary-value">${data.length}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Sale</div>
            <div class="summary-value">₹${pdfTotalSale.toFixed(2)}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Revenue</div>
            <div class="summary-value">₹${pdfTotalRevenue.toFixed(2)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Bill No</th>
              <th>Customer</th>
              <th>Time</th>
              <th>Items</th>
              <th>Type</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(o => `
              <tr>
                <td>${o.billNo}</td>
                <td>${o.customerName || '-'}</td>
                <td>${o.time}</td>
                <td>${(o.items || []).map(i => formatItemDisplay(i)).join(', ')}</td>
                <td>${o.orderType}</td>
                <td>₹${(o.total || 0).toFixed(2)}</td>
                <td>${o.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    printHtmlContent(html);
  };

  const exportKOTSummary = (data: Order[], subTitle: string, categoryFilter: 'all' | string) => {
    if (!data || data.length === 0) return;
    const printHtmlContent = (htmlContent: string) => {
      document.getElementById('print-section')?.remove();
      document.getElementById('print-section-style')?.remove();

      const printStyle = document.createElement('style');
      printStyle.id = 'print-section-style';
      printStyle.innerHTML = `
        @media print {
          body > *:not(#print-section) {
            display: none !important;
          }
          #print-section, #print-section * {
            display: block !important;
            visibility: visible !important;
          }
          #print-section style, #print-section script {
            display: none !important;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white !important;
          }
        }
      `;
      document.head.appendChild(printStyle);

      const printSection = document.createElement('div');
      printSection.id = 'print-section';
      printSection.innerHTML = htmlContent;
      document.body.appendChild(printSection);

      setTimeout(() => {
        window.focus();
        window.print();
        
        setTimeout(() => {
          printSection.remove();
          printStyle.remove();
        }, 1000);
      }, 150);
    };

    const categoryMap: Record<string, { name: string; items: Record<string, { name: string; qty: number; total: number }> }> = {};

    const categoryNameById: Record<string, string> = {};
    categories.forEach(cat => {
      categoryNameById[cat.id] = cat.name;
    });

    data.forEach(order => {
      (order.items || []).forEach(it => {
        const catId = it.categoryId || 'uncategorized';
        if (categoryFilter !== 'all' && catId !== categoryFilter) return;

        const catName = categoryNameById[catId] || (catId === 'uncategorized' ? 'Other' : 'Other');
        if (!categoryMap[catId]) {
          categoryMap[catId] = { name: catName, items: {} };
        }
        
        // Include ml details and portion labels in the aggregated KOT summary display name and key
        const portionLabel = it.selectedPortion === 'HALF' ? 'H' : it.selectedPortion === 'FULL' ? 'F' : '';
        const details = [it.selectedMl, portionLabel].filter(Boolean).join(' | ');
        const itemKey = `${it.name}_${details}`;
        const itemDisplayName = `${it.name}${details ? ` (${details})` : ''}`;

        if (!categoryMap[catId].items[itemKey]) {
          categoryMap[catId].items[itemKey] = { name: itemDisplayName, qty: 0, total: 0 };
        }
        categoryMap[catId].items[itemKey].qty += it.quantity;
        categoryMap[catId].items[itemKey].total += it.price * it.quantity;
      });
    });

    const filterLabel = categoryFilter === 'all' ? 'All Categories' : (categoryNameById[categoryFilter] || 'Selected Category');

    // Create sorted list of categories to print
    const orderedSections: { id: string; data: typeof categoryMap[string] }[] = [];
    if (categoryFilter === 'all') {
      const sortedCatIds = Object.keys(categoryMap).sort((a, b) => categoryMap[a].name.localeCompare(categoryMap[b].name));
      sortedCatIds.forEach(id => {
        orderedSections.push({ id, data: categoryMap[id] });
      });
    } else if (categoryMap[categoryFilter]) {
      orderedSections.push({ id: categoryFilter, data: categoryMap[categoryFilter] });
    }

    const sectionHtml = orderedSections
      .map(({ data: cat }) => {
        const rows = Object.values(cat.items).sort((a, b) => a.name.localeCompare(b.name));
        if (!rows.length) return '';
        const catTotal = rows.reduce((sum, r) => sum + r.total, 0);
        return `
          <div class="cat-title center">${cat.name.toUpperCase()}</div>
          <div class="line"></div>
          <div class="row bold">
            <span class="name">ITEM</span>
            <span class="qty">QTY</span>
            <span class="amt">AMT</span>
          </div>
          ${rows
            .map(
              r => `
          <div class="row">
            <span class="name">${r.name}</span>
            <span class="qty">${r.qty}</span>
            <span class="amt">${r.total.toFixed(0)}</span>
          </div>`
            )
            .join('')}
          <div class="line"></div>
          <div class="row bold">
            <span class="name">CAT TTL</span>
            <span class="qty"></span>
            <span class="amt">₹${catTotal.toFixed(0)}</span>
          </div>
        `;
      })
      .join('');

    // Compute grand total across all categories (items only)
    const grandTotal = orderedSections.reduce((sum, { data: cat }) => {
      return sum + Object.values(cat.items).reduce((s, r) => s + r.total, 0);
    }, 0);

    // Compute taxes and collected totals across selected orders (using rounded values)
    let totalGst = 0;
    let totalVat = 0;
    let totalDiscounts = 0;
    let totalCollected = 0;
    data.forEach(order => {
      const orderTaxInfo = calculateOrderTax(order.items || [], categories, taxRate, drinkTaxRate);
      totalGst += Math.round(orderTaxInfo.gst);
      totalVat += Math.round(orderTaxInfo.vat);
      totalDiscounts += Math.round(order.discountAmount || 0);
      totalCollected += Math.round(order.total || 0); // total already includes tax and discounts
    });

    const html = `
      <div class="print-container">
        <style>
          .print-container {
            font-family: Arial, sans-serif;
            width: 76mm;
            max-width: 76mm;
            margin: 0 auto;
            padding: 3mm;
            font-size: 11px;
            color: #000;
            line-height: 1.3;
            font-weight: bold;
            background-color: #fff;
          }
          .print-container .center { text-align: center; }
          .print-container .bold { font-weight: bold; }
          .print-container .line { border-bottom: 2px dashed #000; margin: 6px 0; }
          .print-container .header-name { font-size: 11px; font-weight: bold; margin-bottom: 2px; text-transform: uppercase; }
          .print-container .sub { font-size: 9px; }
          .print-container .cat-title { font-size: 10px; font-weight: bold; margin-top: 6px; }
          .print-container .row { display: flex; justify-content: space-between; gap: 4px; margin: 2px 0; align-items: baseline; }
          .print-container .name { flex: 1; min-width: 0; word-break: break-word; }
          .print-container .qty { width: 22px; text-align: right; font-weight: bold; flex-shrink: 0; }
          .print-container .amt { width: 36px; text-align: right; flex-shrink: 0; }
          .print-container .grand-total { font-size: 12px; font-weight: bold; margin-top: 4px; }
        </style>
        <div class="center header-name">${restaurantInfo.name}</div>
        <div class="center sub">${restaurantInfo.address}</div>
        <div class="line"></div>
        <div class="center bold">KOT SUMMARY</div>
        <div class="center sub">${subTitle} · ${filterLabel}</div>
        <div class="center sub">${new Date().toLocaleString()}</div>
        <div class="line"></div>
        ${sectionHtml || '<div class="center sub">No items</div>'}
        <div class="line"></div>
        <div class="row grand-total">
          <span class="name">GRAND TOTAL (Items)</span>
          <span class="qty"></span>
          <span class="amt">₹${grandTotal.toFixed(0)}</span>
        </div>
        <div class="row">
          <span class="name">GST Total</span>
          <span class="qty"></span>
          <span class="amt">₹${totalGst.toFixed(0)}</span>
        </div>
        <div class="row">
          <span class="name">VAT Total</span>
          <span class="qty"></span>
          <span class="amt">₹${totalVat.toFixed(0)}</span>
        </div>
        <div class="row">
          <span class="name">Tax Total</span>
          <span class="qty"></span>
          <span class="amt">₹${(totalGst + totalVat).toFixed(0)}</span>
        </div>
        ${totalDiscounts > 0 ? `<div class="row"><span class="name">Discounts</span><span class="qty"></span><span class="amt">-₹${totalDiscounts.toFixed(0)}</span></div>` : ''}
        <div class="row grand-total">
          <span class="name">TOTAL COLLECTED</span>
          <span class="qty"></span>
          <span class="amt">₹${totalCollected.toFixed(0)}</span>
        </div>
        <div class="line"></div>
        <div class="center sub" style="margin-top:6px;">End of summary</div>
      </div>
    `;

    printHtmlContent(html);
  };

  const renderTable = (data: Order[], emptyMessage: string = "No orders found.") => (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Details</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Items</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-20 text-center text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <PackageCheck size={48} className="opacity-20" />
                  <p className="font-bold text-lg">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map(order => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      {order.status === 'COMPLETED' && <CheckCircle2 size={16} className="text-green-500" />}
                      <span className="font-bold text-gray-800">{order.billNo}</span>
                    </div>
                    {order.customerName && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 font-black uppercase mt-0.5">
                        <User size={10} /> {order.customerName}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-gray-800 text-sm font-bold">{order.date}</span>
                    <span className="text-gray-500 text-xs font-semibold">{order.time}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-0.5">
                    {order.items.slice(0, 2).map((it, idx) => (
                      <span key={idx} className="text-xs text-gray-600 font-medium">{formatItemDisplay(it)}</span>
                    ))}
                    {order.items.length > 2 && <span className="text-[10px] text-gray-400 font-bold">+{order.items.length - 2} more...</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex flex-col gap-1">
                     <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border w-fit ${
                       order.orderType === 'DINE_IN' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                       order.orderType === 'DELIVERY' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                       'bg-gray-50 text-gray-700 border-gray-200'
                     }`}>
                       {order.orderType.replace('_', ' ')}
                     </span>
                     {order.orderType === 'DINE_IN' && order.tableName && (
                       <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border w-fit bg-purple-50 text-purple-700 border-purple-200">
                         {order.tableName}
                       </span>
                     )}
                   </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border w-fit flex items-center gap-1 ${
                    order.paymentMode === 'CASH' ? 'bg-green-50 text-green-700 border-green-200' :
                    order.paymentMode === 'CARD' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                    order.paymentMode === 'UPI' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    order.paymentMode === 'DUE' ? 'bg-red-50 text-red-700 border-red-200' :
                    order.paymentMode === 'OTHER' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>
                    {order.paymentMode === 'CASH' && <Banknote size={10} />}
                    {order.paymentMode === 'CARD' && <CreditCard size={10} />}
                    {order.paymentMode === 'UPI' && <Smartphone size={10} />}
                    {order.paymentMode === 'OTHER' && <Wallet size={10} />}
                    {order.paymentMode}
                  </span>
                </td>
                <td className="px-6 py-4 font-black text-gray-900">₹{(order.total || 0).toFixed(0)}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-center">
                    <ActionButton 
                      icon={<Eye size={16} />} 
                      color="text-gray-400 hover:text-blue-500" 
                      tooltip="View Details" 
                      onClick={() => setSelectedOrder(order)}
                    />
                    <ActionButton 
                      icon={<Printer size={16} />} 
                      color="text-gray-400 hover:text-[#F57C00]" 
                      tooltip="Re-print Bill" 
                      onClick={() => printReceipt(order)}
                    />
                    
                    {(order.status === 'PLACED' || order.status === 'READY' || order.status === 'PREPARING') && (
                      <ActionButton 
                        icon={<PackageCheck size={16} />} 
                        color="text-gray-400 hover:text-green-500" 
                        tooltip="Mark as Completed"
                        onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
                      />
                    )}
                    {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                      <ActionButton 
                        icon={<XCircle size={16} />} 
                        color="text-gray-400 hover:text-black" 
                        tooltip="Cancel Order"
                        onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                      />
                    )}
                    <ActionButton 
                      icon={<Trash2 size={16} />} 
                      color="text-red-500 hover:bg-red-50 border-red-100" 
                      tooltip="Delete Order" 
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete order ${order.billNo}?`)) {
                          onDeleteOrder(order.id);
                        }
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* Dynamic Header */}
      <div className="p-4 md:p-6 pb-2 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">{title}</h1>
          <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5 md:mt-1">
            {isAllBillsView ? 'Transaction History' : 'Status-specific records'}
          </p>
        </div>
        <div className="flex gap-2 md:gap-3 items-center">
           {/* Total Sale Summary */}
           <div className="hidden md:flex items-center gap-4 bg-white border rounded-xl px-4 py-2">
             <div className="text-center">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Sale</p>
               <p className="text-sm font-black text-green-600">₹{totalSale.toFixed(0)}</p>
             </div>
             <div className="w-px h-8 bg-gray-200" />
             <div className="text-center">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
               <p className="text-sm font-black text-[#F57C00]">₹{totalRevenue.toFixed(0)}</p>
             </div>
           </div>
           <div className="relative flex-1 md:flex-none">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#F57C00] outline-none w-full md:w-48 md:focus:w-64 transition-all"
             />
           </div>
           <div className="flex items-center gap-1.5 bg-white border rounded-xl px-2">
              <span className="text-[9px] font-black text-gray-400 uppercase ml-1">From</span>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none py-2 text-xs font-bold text-gray-800 focus:ring-0 outline-none w-28 cursor-pointer"
              />
           </div>
           <div className="flex items-center gap-1.5 bg-white border rounded-xl px-2">
              <span className="text-[9px] font-black text-gray-400 uppercase ml-1">To</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none py-2 text-xs font-bold text-gray-800 focus:ring-0 outline-none w-28 cursor-pointer"
              />
           </div>
            <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as PaymentMode | 'ALL')}
                className="bg-white border rounded-xl px-3 py-2 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-[#F57C00] outline-none transition-all cursor-pointer"
              >
                <option value="ALL">All Payments</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="UPI">UPI</option>
                <option value="DUE">Due</option>
                <option value="OTHER">Others</option>
              </select>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="bg-white border rounded-xl px-3 py-2 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-[#F57C00] outline-none transition-all cursor-pointer"
              >
                <option value="ALL">All Months</option>
                {availableMonths.map(m => {
                  const [y, mo] = m.split('-');
                  const label = new Date(Number(y), Number(mo) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
                  return <option key={m} value={m}>{label}</option>;
                })}
              </select>
           <button 
            onClick={() => exportToPDF(displayedOrders, isAllBillsView ? (activeTab === 'TODAY' ? "Today" : "History") : title)}
            className="bg-[#F57C00] text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-black hover:bg-orange-600 transition-all flex items-center gap-1 md:gap-2 shadow-lg shadow-orange-100 active:scale-95 shrink-0"
           >
            <FileText size={16} /> <span className="hidden sm:inline">PDF</span>
           </button>
           <div className="relative">
             <button 
              onClick={() => setShowCsvMenu(!showCsvMenu)}
              className="bg-green-600 text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-black hover:bg-green-700 transition-all flex items-center gap-1 md:gap-2 shadow-lg shadow-green-100 active:scale-95 shrink-0"
             >
              <Download size={16} /> <span className="hidden sm:inline">CSV</span>
             </button>
             {showCsvMenu && (
               <>
                 <div className="fixed inset-0 z-40" onClick={() => setShowCsvMenu(false)} />
                 <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-2 w-56 max-h-72 overflow-y-auto">
                   <div className="px-3 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Export CSV by Period</div>
                   {[{ value: 'ALL', label: 'All Orders' }, { value: 'TODAY', label: "Today's Orders" }, ...availableMonths.map(m => {
                     const [y, mo] = m.split('-');
                     return { value: m, label: new Date(Number(y), Number(mo) - 1).toLocaleString('default', { month: 'long', year: 'numeric' }) };
                   })].map(opt => (
                     <button
                       key={opt.value}
                       className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center gap-2"
                       onClick={() => {
                         setShowCsvMenu(false);
                         // Filter orders based on selection
                         let exportOrders: Order[] = [];
                         if (opt.value === 'ALL') {
                           exportOrders = safeOrders;
                         } else if (opt.value === 'TODAY') {
                           exportOrders = todayOrders;
                         } else {
                           exportOrders = safeOrders.filter(o => o.date && o.date.startsWith(opt.value));
                         }
                         if (exportOrders.length === 0) { alert('No orders for this period.'); return; }
                         const headers = ['Bill No','Customer','Date','Time','Items','Order Type','Payment Mode','Subtotal','GST','VAT','Tax Total','Total'];
                         const escCSV = (v: string) => `"${String(v || '').replace(/"/g, '""')}"`;
                         const rows = exportOrders.map(o => {
                           const taxInfo = calculateOrderTax(o.items || [], categories, taxRate, drinkTaxRate);
                           const gst = Math.round(taxInfo.gst);
                           const vat = Math.round(taxInfo.vat);
                           return [
                            escCSV(o.billNo),
                            escCSV(o.customerName || 'Guest'),
                            escCSV(o.date),
                            escCSV(o.time),
                            escCSV((o.items || []).map(i => `${i.name} x${i.quantity}`).join('; ')),
                            escCSV(o.orderType.replace('_', ' ')),
                            escCSV(o.paymentMode),
                            (o.subtotal || 0).toFixed(0),
                            gst.toFixed(0),
                            vat.toFixed(0),
                            (o.tax || 0).toFixed(0),
                            (o.total || 0).toFixed(0),
                           ].join(',');
                         });
                         const csv = [headers.join(','), ...rows].join('\n');
                         const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                         const url = URL.createObjectURL(blob);
                         const a = document.createElement('a');
                         a.href = url;
                         a.download = `bills_${opt.value.toLowerCase()}.csv`;
                         a.click();
                         URL.revokeObjectURL(url);
                       }}
                     >
                       <Download size={14} className="text-green-500" />
                       {opt.label}
                     </button>
                   ))}
                 </div>
               </>
             )}
           </div>
        </div>
      </div>

      {/* Mobile Total Sale Summary */}
      <div className="md:hidden px-4 pb-2">
        <div className="flex items-center justify-center gap-4 bg-white border rounded-xl px-4 py-2">
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Sale</p>
            <p className="text-sm font-black text-green-600">₹{totalSale.toFixed(0)}</p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Revenue</p>
            <p className="text-sm font-black text-[#F57C00]">₹{totalRevenue.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Tabs for All Bills */}
      {isAllBillsView && (
        <div className="px-6 flex border-b bg-gray-50/50">
          <TabButton 
            active={activeTab === 'TODAY'} 
            onClick={() => setActiveTab('TODAY')} 
            label="Today's Orders" 
            count={todayOrders.length}
            icon={<CalendarDays size={16} />}
          />
          <TabButton 
            active={activeTab === 'ALL'} 
            onClick={() => setActiveTab('ALL')} 
            label="All Orders" 
            count={allOrders.length}
            icon={<History size={16} />}
          />
        </div>
      )}

      {isAllBillsView && (
        <div className="px-4 md:px-6 py-2 border-b bg-white flex flex-wrap items-center gap-2 shadow-sm">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider shrink-0">KOT (2&quot;)</span>
          <select
            value={kotCategoryId}
            onChange={(e) => setKotCategoryId(e.target.value)}
            className="flex-1 min-w-[160px] md:min-w-[200px] max-w-md border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 bg-gray-50 focus:ring-2 focus:ring-[#F57C00] outline-none"
            aria-label="KOT category"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              let label = activeTab === 'TODAY' ? 'Today' : 'History';
              if (startDate || endDate) {
                label = `${startDate || 'Start'} to ${endDate || 'End'}`;
              } else if (monthFilter !== 'ALL') {
                label = monthFilter;
              }
              exportKOTSummary(
                displayedOrders,
                label,
                kotCategoryId as 'all' | string
              );
            }}
            disabled={displayedOrders.length === 0}
            className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-black transition-all flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Printer size={16} />
            Print KOT
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pt-3 md:pt-4">
        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {displayedOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm border">
              <PackageCheck size={48} className="mx-auto mb-3 opacity-20" />
              <p className="font-bold">{searchQuery ? "No bills match your search." : "No orders found."}</p>
            </div>
          ) : (
            displayedOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {order.status === 'COMPLETED' && <CheckCircle2 size={14} className="text-green-500" />}
                      <span className="font-bold text-gray-800">{order.billNo}</span>
                    </div>
                    {order.customerName && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium mt-0.5">
                        <User size={10} /> {order.customerName}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#F57C00] text-lg">₹{(order.total || 0).toFixed(0)}</span>
                    <p className="text-[10px] text-gray-400">{order.date}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                    order.orderType === 'DINE_IN' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                    order.orderType === 'DELIVERY' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                    'bg-purple-50 text-purple-600 border-purple-200'
                  }`}>{order.orderType.replace('_', ' ')}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                    order.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border-green-200' :
                    order.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border-red-200' :
                    'bg-yellow-50 text-yellow-600 border-yellow-200'
                  }`}>{order.status}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border flex items-center gap-1 ${
                    order.paymentMode === 'CASH' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                    order.paymentMode === 'CARD' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                    'bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}>
                    {order.paymentMode === 'CASH' ? <Banknote size={10} /> : 
                     order.paymentMode === 'CARD' ? <CreditCard size={10} /> : 
                     <Smartphone size={10} />}
                    {order.paymentMode}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  {order.items.slice(0, 2).map((it, idx) => (
                    <span key={idx}>{formatItemDisplay(it)}{idx < Math.min(1, order.items.length - 1) ? ', ' : ''}</span>
                  ))}
                  {order.items.length > 2 && <span className="text-gray-400"> +{order.items.length - 2} more</span>}
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <Eye size={14} /> View
                  </button>
                  <button 
                    onClick={() => printReceipt(order)}
                    className="flex-1 py-2 bg-[#F57C00] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <Printer size={14} /> Print
                  </button>
                  {(order.status === 'PLACED' || order.status === 'READY' || order.status === 'PREPARING') && (
                    <button 
                      onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
                      className="py-2 px-3 bg-green-500 text-white rounded-xl text-xs font-bold"
                    >
                      <CheckCircle size={14} />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete order ${order.billNo}?`)) {
                        onDeleteOrder(order.id);
                      }
                    }}
                    className="py-2 px-3 bg-red-50 text-red-500 border border-red-100 rounded-xl text-xs font-bold transition-colors hover:bg-red-100 shrink-0"
                    title="Delete Order"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          {renderTable(displayedOrders, searchQuery ? "No bills match your search." : (activeTab === 'TODAY' ? "No orders placed today." : "No orders found in history."))}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-gray-100 flex flex-col max-h-[90vh]">
            <div className="bg-gray-50 p-6 border-b-2 border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-gray-900">{selectedOrder.billNo}</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{selectedOrder.date} • {selectedOrder.time}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-900 hover:text-[#F57C00] transition-colors bg-white p-2 rounded-full shadow-sm"><X size={24} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <User size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Customer</span>
                  </div>
                  <p className="font-bold text-gray-800">{selectedOrder.customerName || "Walk-in Customer"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <MapPin size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Type</span>
                  </div>
                  <p className="font-bold text-gray-800">{selectedOrder.orderType.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-3 border border-gray-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${item.selectedVegChoice === 'SEAFOOD' ? 'bg-blue-500' : (item.isVeg || item.selectedVegChoice === 'VEG') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{item.name}{item.selectedPortion ? ` (${item.selectedPortion === 'HALF' ? 'Half' : 'Full'})` : ''}</p>
                          <p className="text-[10px] text-gray-400 font-bold">₹{item.price} x {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-black text-gray-900">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-900 text-white p-6 rounded-3xl space-y-3">
                <div className="flex justify-between text-xs text-gray-400 font-bold uppercase">
                  <span>Subtotal</span>
                  <span>₹{(selectedOrder.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 font-bold uppercase">
                  <span>Tax ({((taxRate || 0) * 100).toFixed(0)}%)</span>
                  <span>₹{(selectedOrder.tax || 0).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-800 pt-3 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-black text-[#F57C00] uppercase tracking-widest">Total Amount</span>
                    <h3 className="text-2xl font-black">₹{(selectedOrder.total || 0).toFixed(0)}</h3>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end text-xs font-black uppercase tracking-widest mb-1">
                      {selectedOrder.paymentMode === 'CASH' && <Banknote size={14} />}
                      {selectedOrder.paymentMode === 'CARD' && <CreditCard size={14} />}
                      {selectedOrder.paymentMode === 'UPI' && <Smartphone size={14} />}
                      {selectedOrder.paymentMode === 'OTHER' && <Wallet size={14} />}
                      {selectedOrder.paymentMode}
                    </div>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex gap-3">
              <button 
                onClick={() => printReceipt(selectedOrder)}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-900 py-4 rounded-2xl font-black hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Printer size={20} /> Re-print Receipt
              </button>
              {selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED' && (
                <button 
                  onClick={() => {
                    onUpdateStatus(selectedOrder.id, 'COMPLETED');
                    setSelectedOrder(null);
                  }}
                  className="flex-1 bg-[#F57C00] text-white py-4 rounded-2xl font-black hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-100"
                >
                  <PackageCheck size={20} /> Complete Order
                </button>
              )}
              <button 
                onClick={() => {
                  if (confirm(`Are you sure you want to delete order ${selectedOrder.billNo}?`)) {
                    onDeleteOrder(selectedOrder.id);
                    setSelectedOrder(null);
                  }
                }}
                className="flex-shrink-0 bg-red-50 text-red-500 py-4 px-4 rounded-2xl font-black hover:bg-red-100 transition-all flex items-center justify-center gap-2 shadow-sm border border-red-100"
                title="Delete Order"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; count: number; icon: React.ReactNode }> = ({ active, onClick, label, count, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-4 relative ${
      active ? 'border-[#F57C00] text-[#F57C00] bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
    }`}
  >
    {icon}
    {label}
    <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-orange-100 text-[#F57C00]' : 'bg-gray-100 text-gray-500'}`}>
      {count}
    </span>
  </button>
);

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const styles = {
    PLACED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    PREPARING: 'bg-blue-100 text-blue-700 border-blue-200',
    READY: 'bg-green-100 text-green-700 border-green-200',
    COMPLETED: 'bg-green-100 text-green-700 border-green-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider border uppercase ${styles[status]}`}>
      {status}
    </span>
  );
};

const ActionButton: React.FC<{ icon: React.ReactNode; color: string; tooltip: string; onClick?: () => void }> = ({ icon, color, tooltip, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-2 rounded-xl border border-gray-100 transition-all ${color} hover:shadow-md hover:bg-white active:scale-90`}
    title={tooltip}
  >
    {icon}
  </button>
);

export default OrdersList;
