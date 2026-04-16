import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { TrendingUp, ShoppingBag, DollarSign, Clock, Users } from 'lucide-react';
import { Order, PaymentMode } from '../types';
import { COLORS, INITIAL_CATEGORIES } from '../constants';

interface DashboardProps {
  orders: Order[];
  onResetCounter?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ orders, onResetCounter }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const isOrderToday = (o: Order) => {
      const d = o.date;
      if (!d) return false;
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d === todayKey;
      const parsed = new Date(d);
      if (isNaN(parsed.getTime())) return false;
      const orderKey = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
      return orderKey === todayKey;
    };
    const todayOrders = orders.filter(o => isOrderToday(o) && o.status !== 'CANCELLED');
    const totalSales = todayOrders.reduce((acc, o) => acc + o.total, 0);
    const pendingOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
    const avgOrderValue = todayOrders.length > 0 ? totalSales / todayOrders.length : 0;

    // Hourly Sales Calculation from real orders
    const hourMap: Record<string, number> = {};
    // Initialize hours
    ['09 AM', '10 AM', '11 AM', '12 PM', '01 PM', '02 PM', '03 PM', '04 PM', '05 PM', '06 PM', '07 PM', '08 PM', '09 PM', '10 PM'].forEach(h => hourMap[h] = 0);
    
    todayOrders.forEach(order => {
      // Assuming time format "HH:MM AM/PM"
      const hourPart = order.time.split(':')[0];
      const ampmPart = order.time.split(' ')[1];
      const hourStr = `${hourPart.padStart(2, '0')} ${ampmPart}`;
      if (hourMap[hourStr] !== undefined) {
        hourMap[hourStr] += order.total;
      }
    });

    const hourlySalesData = Object.entries(hourMap).map(([hour, sales]) => ({ hour, sales }));

    // Category Distribution Calculation
    const categoryCounts: Record<string, number> = {};
    orders.filter(o => o.status !== 'CANCELLED').forEach(order => {
      order.items.forEach(item => {
        const category = INITIAL_CATEGORIES.find(c => c.id === item.categoryId)?.name || 'Other';
        categoryCounts[category] = (categoryCounts[category] || 0) + (item.price * item.quantity);
      });
    });

    const categoryDistribution = Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categories

    // Payment Mode Distribution
    const paymentCounts: Record<string, number> = { 'CASH': 0, 'CARD': 0, 'UPI': 0, 'DUE': 0, 'PART': 0 };
    orders.filter(o => o.status !== 'CANCELLED').forEach(order => {
      paymentCounts[order.paymentMode] = (paymentCounts[order.paymentMode] || 0) + 1;
    });

    const totalValidOrders = orders.filter(o => o.status !== 'CANCELLED').length;
    const paymentDistribution = Object.entries(paymentCounts).map(([name, count]) => ({
      name,
      value: totalValidOrders > 0 ? Math.round((count / totalValidOrders) * 100) : 0
    }));

    return {
      todaySales: totalSales,
      totalOrdersToday: todayOrders.length,
      avgOrderValue,
      pendingOrders,
      hourlySalesData,
      categoryDistribution,
      paymentDistribution
    };
  }, [orders]);

  const PIE_COLORS = [COLORS.primary, '#262626', '#4b5563', '#9ca3af', '#d1d5db'];

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-gray-50 p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-xs md:text-sm text-gray-500">Real-time performance metrics</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {onResetCounter && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to start a new day? This will reset the invoice number to 1.")) {
                  onResetCounter();
                }
              }}
              className="bg-orange-50 text-[#F57C00] px-4 py-2 rounded-xl border border-orange-100 shadow-sm text-xs font-black transition-all hover:bg-[#F57C00] hover:text-white flex items-center gap-2"
            >
              <TrendingUp size={14} />
              START NEW DAY
            </button>
          )}
          <div className="bg-white px-3 py-1.5 rounded-xl shadow-sm border text-xs font-bold text-gray-600 flex items-center gap-2">
            <Clock size={14} className="text-[#F57C00]" />
            Last Sync: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard 
          label="Today's Sales" 
          value={`₹${stats.todaySales.toLocaleString()}`} 
          icon={<DollarSign size={24} className="text-orange-600" />} 
          color="bg-orange-100" 
          trend="Live data"
        />
        <StatCard 
          label="Orders Today" 
          value={stats.totalOrdersToday.toString()} 
          icon={<ShoppingBag size={24} className="text-blue-600" />} 
          color="bg-blue-100" 
        />
        <StatCard 
          label="Avg. Order Value" 
          value={`₹${stats.avgOrderValue.toFixed(0)}`} 
          icon={<TrendingUp size={24} className="text-green-600" />} 
          color="bg-green-100" 
        />
        <StatCard 
          label="Active Orders" 
          value={stats.pendingOrders.toString()} 
          icon={<Users size={24} className="text-purple-600" />} 
          color="bg-purple-100" 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h3 className="text-sm md:text-lg font-bold text-gray-800">Hourly Sales (Today)</h3>
            <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Revenue (₹)</span>
          </div>
          <div className="h-[200px] md:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.hourlySalesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="hour" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 8, fontWeight: 600}} 
                  interval={1}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 8, fontWeight: 600}}
                  tickFormatter={(val) => `₹${val}`}
                  width={40}
                />
                <Tooltip 
                  cursor={{fill: '#fff7ed'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px'}} 
                />
                <Bar dataKey="sales" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border">
          <h3 className="text-lg font-bold text-gray-800 mb-8">Sales by Category</h3>
          <div className="h-[320px] flex flex-col items-center justify-center">
            {stats.categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryDistribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {stats.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{fontSize: '11px', fontWeight: 'bold', paddingTop: '20px'}} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-300 flex flex-col items-center gap-2">
                <ShoppingBag size={48} strokeWidth={1} />
                <p className="text-sm font-bold">No sales data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border">
           <h3 className="text-lg font-bold text-gray-800 mb-6">Payment Mode Usage</h3>
           <div className="space-y-6">
              {stats.paymentDistribution.map((p, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-gray-700">{p.name}</span>
                    <span className="font-black text-[#F57C00]">{p.value}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-[#F57C00] h-full rounded-full transition-all duration-1000" 
                      style={{width: `${p.value}%`}}
                    ></div>
                  </div>
                </div>
              ))}
           </div>
        </div>
        
        <div className="bg-white p-8 rounded-3xl shadow-sm border">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Completed Orders</h3>
          <div className="space-y-4">
             {orders.filter(o => o.status === 'COMPLETED').slice(0, 4).map((order, i) => (
               <div key={order.id} className="flex items-center justify-between p-3 border-b last:border-none hover:bg-gray-50 rounded-xl transition-colors">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-orange-50 text-[#F57C00] rounded-full flex items-center justify-center font-black text-xs">
                     {order.billNo.slice(-2)}
                   </div>
                   <div>
                     <p className="font-bold text-gray-800 text-sm">{order.billNo}</p>
                     <p className="text-[10px] text-gray-400 font-bold uppercase">{order.paymentMode} • {order.items.length} Items</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="font-black text-gray-900 text-sm">₹{order.total.toFixed(0)}</p>
                   <p className="text-[10px] text-gray-400 font-medium">{order.time}</p>
                 </div>
               </div>
             ))}
             {orders.filter(o => o.status === 'COMPLETED').length === 0 && (
               <div className="text-center py-8 text-gray-400 text-sm font-bold">No completed orders yet</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; color: string; trend?: string }> = ({ label, value, icon, color, trend }) => (
  <div className="bg-white p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border-2 border-transparent hover:border-orange-100 hover:shadow-xl transition-all group">
    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-5">
      <div className={`p-2 md:p-4 rounded-xl md:rounded-2xl ${color} transition-transform group-hover:scale-110 self-start`}>
        {React.cloneElement(icon as React.ReactElement, { size: 20, className: (icon as React.ReactElement).props.className })}
      </div>
      <div>
        <p className="text-[10px] md:text-xs text-gray-400 font-black uppercase tracking-widest mb-0.5 md:mb-1">{label}</p>
        <h2 className="text-lg md:text-2xl font-black text-gray-800 tracking-tight">{value}</h2>
        {trend && <p className="text-[10px] text-green-600 mt-0.5 md:mt-1 font-black uppercase tracking-tighter">{trend}</p>}
      </div>
    </div>
  </div>
);

export default Dashboard;