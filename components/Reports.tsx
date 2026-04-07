
import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Filter, 
  FileSpreadsheet, 
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  CreditCard,
  Banknote,
  Smartphone,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  X
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Order } from '../types';

interface ReportsProps {
  orders: Order[];
}

const Reports: React.FC<ReportsProps> = ({ orders }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMode, setPaymentMode] = useState('All');
  const [orderType, setOrderType] = useState('All');
  const [orderStatus, setOrderStatus] = useState('All');

  // Ensure orders is always an array
  const safeOrders = orders || [];

  // Filtered orders based on all filters
  const filteredOrders = useMemo(() => {
    return safeOrders.filter(order => {
      // Date filter
      if (startDate && new Date(order.date) < new Date(startDate)) return false;
      if (endDate && new Date(order.date) > new Date(endDate)) return false;
      
      // Payment mode filter
      if (paymentMode !== 'All' && order.paymentMode !== paymentMode.toUpperCase()) return false;
      
      // Order type filter
      if (orderType !== 'All' && order.orderType !== orderType) return false;
      
      // Status filter
      if (orderStatus !== 'All' && order.status !== orderStatus) return false;
      
      return true;
    });
  }, [safeOrders, startDate, endDate, paymentMode, orderType, orderStatus]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalTax = filteredOrders.reduce((sum, order) => sum + order.tax, 0);
    const totalSubtotal = filteredOrders.reduce((sum, order) => sum + order.subtotal, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Payment mode breakdown
    const cashOrders = filteredOrders.filter(o => o.paymentMode === 'CASH');
    const cardOrders = filteredOrders.filter(o => o.paymentMode === 'CARD');
    const upiOrders = filteredOrders.filter(o => o.paymentMode === 'UPI');
    
    const cashRevenue = cashOrders.reduce((sum, o) => sum + o.total, 0);
    const cardRevenue = cardOrders.reduce((sum, o) => sum + o.total, 0);
    const upiRevenue = upiOrders.reduce((sum, o) => sum + o.total, 0);
    
    // Order type breakdown
    const dineInOrders = filteredOrders.filter(o => o.orderType === 'DINE_IN');
    const deliveryOrders = filteredOrders.filter(o => o.orderType === 'DELIVERY');
    const pickupOrders = filteredOrders.filter(o => o.orderType === 'PICK_UP');
    
    // Status breakdown
    const completedOrders = filteredOrders.filter(o => o.status === 'COMPLETED');
    const cancelledOrders = filteredOrders.filter(o => o.status === 'CANCELLED');
    const pendingOrders = filteredOrders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
    
    // Top selling items
    const itemSales: { [key: string]: { quantity: number; revenue: number; name: string } } = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!itemSales[item.id]) {
          itemSales[item.id] = { quantity: 0, revenue: 0, name: item.name };
        }
        itemSales[item.id].quantity += item.quantity;
        itemSales[item.id].revenue += item.price * item.quantity;
      });
    });
    
    const topItems = Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    // Daily sales (for chart)
    const dailySales: { [key: string]: number } = {};
    filteredOrders.forEach(order => {
      if (!dailySales[order.date]) {
        dailySales[order.date] = 0;
      }
      dailySales[order.date] += order.total;
    });
    
    const dailyData = Object.entries(dailySales)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return {
      totalRevenue,
      totalTax,
      totalSubtotal,
      totalOrders,
      avgOrderValue,
      cashOrders: cashOrders.length,
      cardOrders: cardOrders.length,
      upiOrders: upiOrders.length,
      cashRevenue,
      cardRevenue,
      upiRevenue,
      dineInOrders: dineInOrders.length,
      deliveryOrders: deliveryOrders.length,
      pickupOrders: pickupOrders.length,
      completedOrders: completedOrders.length,
      cancelledOrders: cancelledOrders.length,
      pendingOrders: pendingOrders.length,
      topItems,
      dailyData
    };
  }, [filteredOrders]);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setPaymentMode('All');
    setOrderType('All');
    setOrderStatus('All');
  };

  const exportToExcel = () => {
    if (filteredOrders.length === 0) {
      alert("No data available for export.");
      return;
    }

    const headers = [
      "Bill No", "Date", "Time", "Customer", "Items", "Subtotal", "Tax", "Total", "Payment Mode", "Order Type", "Status"
    ];

    const rows = filteredOrders.map(order => [
      order.billNo,
      order.date,
      order.time,
      order.customerName || 'N/A',
      order.items.map(i => `${i.name} (x${i.quantity})`).join('; '),
      order.subtotal.toFixed(2),
      order.tax.toFixed(2),
      order.total.toFixed(2),
      order.paymentMode,
      order.orderType,
      order.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `NOON_TO_MOON_POS_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (filteredOrders.length === 0) {
      alert("No data available for print.");
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      return;
    }

    const html = `
      <html>
        <head>
          <title>NOON TO MOON POS - Sales Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #F57C00; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { color: #F57C00; margin: 0; font-size: 28px; }
            .meta { font-size: 14px; color: #666; margin-top: 5px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
            .summary-card { padding: 20px; border: 1px solid #eee; border-radius: 10px; text-align: center; }
            .summary-label { font-size: 12px; color: #666; text-transform: uppercase; font-weight: bold; }
            .summary-value { font-size: 24px; color: #F57C00; font-weight: bold; margin-top: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
            th { background-color: #fafafa; font-weight: bold; text-transform: uppercase; color: #555; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>NOON TO MOON POS - Sales Report</h1>
            <div class="meta">Generated on: ${new Date().toLocaleString()}</div>
            ${startDate || endDate ? `<div class="meta">Period: ${startDate || 'Start'} to ${endDate || 'End'}</div>` : ''}
          </div>
          
          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-label">Total Orders</div>
              <div class="summary-value">${analytics.totalOrders}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Total Sale</div>
              <div class="summary-value">₹${analytics.totalSubtotal.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Total Revenue</div>
              <div class="summary-value">₹${analytics.totalRevenue.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Total Tax</div>
              <div class="summary-value">₹${analytics.totalTax.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Avg Order Value</div>
              <div class="summary-value">₹${analytics.avgOrderValue.toFixed(2)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Bill No</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders.map(o => `
                <tr>
                  <td>${o.billNo}</td>
                  <td>${o.date} ${o.time}</td>
                  <td>${o.customerName || '-'}</td>
                  <td>${o.items.length} items</td>
                  <td>${o.paymentMode}</td>
                  <td>₹${o.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
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
        document.body.removeChild(iframe);
        window.removeEventListener('message', handleMessage);
      }
    };
    window.addEventListener('message', handleMessage);
    setTimeout(() => { if (document.body.contains(iframe)) document.body.removeChild(iframe); }, 5000);
  };

  // Chart colors
  const COLORS = ['#F57C00', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Payment mode chart data
  const paymentData = [
    { name: 'Cash', value: analytics.cashRevenue, orders: analytics.cashOrders },
    { name: 'Card', value: analytics.cardRevenue, orders: analytics.cardOrders },
    { name: 'UPI', value: analytics.upiRevenue, orders: analytics.upiOrders }
  ].filter(item => item.value > 0);

  // Order type chart data
  const orderTypeData = [
    { name: 'Dine In', value: analytics.dineInOrders },
    { name: 'Delivery', value: analytics.deliveryOrders },
    { name: 'Pick Up', value: analytics.pickupOrders }
  ].filter(item => item.value > 0);

  return (
    <div className="h-full bg-gray-50 overflow-y-auto custom-scrollbar">
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Reports & Analytics</h1>
            <p className="text-xs md:text-sm text-gray-600 font-medium mt-0.5">Insights and performance metrics</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={exportToExcel}
              disabled={filteredOrders.length === 0}
              className="flex-1 md:flex-none flex items-center justify-center gap-1 md:gap-2 bg-green-600 text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-black hover:bg-green-700 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet size={16} /> <span className="hidden sm:inline">Export</span> CSV
            </button>
            <button 
              onClick={exportToPDF}
              disabled={filteredOrders.length === 0}
              className="flex-1 md:flex-none flex items-center justify-center gap-1 md:gap-2 bg-[#F57C00] text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-black hover:bg-orange-600 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText size={16} /> <span className="hidden sm:inline">Print</span> PDF
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Filter size={18} className="text-[#F57C00]" />
            <h2 className="text-sm md:text-lg font-black text-gray-900">Filters</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4">
            <div className="space-y-1">
              <label className="text-[10px] md:text-xs font-black text-gray-700 uppercase tracking-wider">Start Date</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2 md:px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs md:text-sm text-gray-900 font-semibold focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] md:text-xs font-black text-gray-700 uppercase tracking-wider">End Date</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2 md:px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs md:text-sm text-gray-900 font-semibold focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] md:text-xs font-black text-gray-700 uppercase tracking-wider">Payment Mode</label>
              <select 
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-2 md:px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs md:text-sm text-gray-900 font-semibold focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
              >
                <option>All</option>
                <option>CASH</option>
                <option>CARD</option>
                <option>UPI</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider">Order Type</label>
              <select 
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 font-semibold focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
              >
                <option>All</option>
                <option>DINE_IN</option>
                <option>DELIVERY</option>
                <option>PICK_UP</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider">Status</label>
              <select 
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 font-semibold focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
              >
                <option>All</option>
                <option>COMPLETED</option>
                <option>CANCELLED</option>
                <option>PLACED</option>
                <option>PREPARING</option>
              </select>
            </div>
            <div className="flex items-end col-span-2 md:col-span-1">
              <button 
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white py-2 rounded-lg font-black hover:bg-gray-700 transition-all active:scale-95 text-xs md:text-sm"
              >
                <X size={14} /> Clear
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <StatCard 
            icon={<DollarSign size={20} />}
            label="Total Sale"
            value={`₹${analytics.totalSubtotal.toFixed(0)}`}
            subValue={`Before tax`}
            color="green"
          />
          <StatCard 
            icon={<DollarSign size={20} />}
            label="Total Revenue"
            value={`₹${analytics.totalRevenue.toFixed(0)}`}
            subValue={`${analytics.totalOrders} orders`}
            color="orange"
          />
          <StatCard 
            icon={<ShoppingCart size={20} />}
            label="Avg Order Value"
            value={`₹${analytics.avgOrderValue.toFixed(0)}`}
            subValue={`Per order`}
            color="blue"
          />
          <StatCard 
            icon={<CheckCircle size={20} />}
            label="Completed"
            value={analytics.completedOrders.toString()}
            subValue={`${((analytics.completedOrders / analytics.totalOrders) * 100 || 0).toFixed(0)}% rate`}
            color="green"
          />
          <StatCard 
            icon={<Package size={20} />}
            label="Tax Collected"
            value={`₹${analytics.totalTax.toFixed(0)}`}
            subValue={`GST`}
            color="purple"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Daily Sales Chart */}
          {analytics.dailyData && analytics.dailyData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h3 className="text-sm md:text-lg font-black text-gray-900 mb-3 md:mb-4">Daily Sales Trend</h3>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} width={35} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="total" stroke="#F57C00" strokeWidth={2} dot={{ fill: '#F57C00', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Payment Mode Distribution */}
          {paymentData && paymentData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h3 className="text-sm md:text-lg font-black text-gray-900 mb-3 md:mb-4">Payment Mode Revenue</h3>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Order Type Distribution */}
          {orderTypeData && orderTypeData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-black text-gray-900 mb-4">Order Type Distribution</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top Selling Items */}
          {analytics.topItems && analytics.topItems.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-black text-gray-900 mb-4">Top Selling Items</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {analytics.topItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#F57C00] text-white font-black text-sm">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500 font-semibold">{item.quantity} units sold</p>
                      </div>
                    </div>
                    <p className="font-black text-[#F57C00]">₹{item.revenue.toFixed(0)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Payment & Order Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">Payment Breakdown</h3>
            <div className="space-y-3">
              <PaymentBreakdownItem 
                icon={<Banknote size={20} className="text-green-600" />}
                label="Cash Payments"
                orders={analytics.cashOrders}
                revenue={analytics.cashRevenue}
              />
              <PaymentBreakdownItem 
                icon={<CreditCard size={20} className="text-blue-600" />}
                label="Card Payments"
                orders={analytics.cardOrders}
                revenue={analytics.cardRevenue}
              />
              <PaymentBreakdownItem 
                icon={<Smartphone size={20} className="text-purple-600" />}
                label="UPI Payments"
                orders={analytics.upiOrders}
                revenue={analytics.upiRevenue}
              />
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">Order Status</h3>
            <div className="space-y-3">
              <StatusBreakdownItem 
                icon={<CheckCircle size={20} className="text-green-600" />}
                label="Completed"
                count={analytics.completedOrders}
                total={analytics.totalOrders}
              />
              <StatusBreakdownItem 
                icon={<XCircle size={20} className="text-red-600" />}
                label="Cancelled"
                count={analytics.cancelledOrders}
                total={analytics.totalOrders}
              />
              <StatusBreakdownItem 
                icon={<Clock size={20} className="text-orange-600" />}
                label="Pending/Processing"
                count={analytics.pendingOrders}
                total={analytics.totalOrders}
              />
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-black text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">Try adjusting your filters or date range to see reports.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subValue: string; 
  color: 'orange' | 'blue' | 'green' | 'purple';
}> = ({ icon, label, value, subValue, color }) => {
  const colorClasses = {
    orange: 'bg-orange-50 text-[#F57C00]',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 md:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2 md:mb-3">
        <div className={`p-2 md:p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-[10px] md:text-sm font-bold text-gray-600 uppercase tracking-wider mb-0.5 md:mb-1">{label}</p>
      <p className="text-lg md:text-2xl font-black text-gray-900 mb-0.5 md:mb-1">{value}</p>
      <p className="text-[10px] md:text-xs text-gray-500 font-semibold">{subValue}</p>
    </div>
  );
};

// Payment Breakdown Item
const PaymentBreakdownItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  orders: number; 
  revenue: number;
}> = ({ icon, label, orders, revenue }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="font-bold text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-500 font-semibold">{orders} transactions</p>
      </div>
    </div>
    <p className="font-black text-gray-900 text-lg">₹{revenue.toFixed(2)}</p>
  </div>
);

// Status Breakdown Item
const StatusBreakdownItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  count: number; 
  total: number;
}> = ({ icon, label, count, total }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <p className="font-bold text-gray-900 text-sm">{label}</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm font-bold text-gray-500">{percentage.toFixed(1)}%</p>
          <p className="font-black text-gray-900">{count}</p>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#F57C00] to-orange-600 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Reports;
