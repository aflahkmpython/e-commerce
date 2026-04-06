import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  Eye, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  MoreHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format';

const StatusBadge = ({ status }) => {
  const configs = {
    pending: { color: 'yellow', icon: Clock },
    confirmed: { color: 'blue', icon: CheckCircle },
    shipped: { color: 'purple', icon: Truck },
    delivered: { color: 'green', icon: CheckCircle },
    cancelled: { color: 'red', icon: XCircle },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-${config.color}-100 text-${config.color}-700 border border-${config.color}-200`}>
      <Icon size={14} />
      {status}
    </span>
  );
};

const AdminOrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/admin/orders/');
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) || 
      order.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm">Manage and track all customer orders from one place.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            <Download size={18} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID, email..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="flex bg-gray-50 p-1 rounded-xl w-full md:w-auto overflow-x-auto whitespace-nowrap">
                {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => (
                  <button 
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                      statusFilter === status 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {status}
                  </button>
                ))}
             </div>
             <button className="p-2 bg-gray-50 text-gray-400 hover:text-blue-600 rounded-xl transition-all flex-shrink-0">
               <Calendar size={20} />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Order Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-20 text-center text-gray-400">Fetching orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-20 text-center text-gray-400">No matching orders found.</td></tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-6 py-4">
                    <Link to={`/admin/orders/${order.id}`} className="font-bold text-blue-600 hover:underline">
                      #{order.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col min-w-[200px]">
                      <span className="font-bold text-gray-900">{order.user_name}</span>
                      <span className="text-xs text-gray-400">{order.user_email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-gray-900">{formatPrice(order.total_amount)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                      order.payment_status === 'unpaid' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        to={`/admin/orders/${order.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Eye size={18} />
                      </Link>
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-50 bg-gray-50/20 flex items-center justify-between text-xs text-gray-400 font-medium">
          <p>Showing {filteredOrders.length} orders</p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg bg-white disabled:opacity-50">Previous</button>
            <button className="px-3 py-1.5 border border-gray-100 rounded-lg bg-white">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderListPage;
export { StatusBadge };
