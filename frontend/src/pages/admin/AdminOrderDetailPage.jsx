import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronLeft, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  Box, 
  Calendar, 
  Truck, 
  CheckCircle, 
  AlertCircle,
  Download,
  Printer
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StatusBadge } from './AdminOrderListPage';
import { formatPrice } from '../../utils/format';

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`/api/admin/orders/${id}/`);
      setOrder(response.data);
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await axios.patch(`/api/admin/orders/${id}/`, { status: newStatus });
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]">Loading order details...</div>;
  if (!order) return <div className="p-20 text-center">Order not found.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-500 hover:text-blue-600 transition-all hover:shadow-md"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <Calendar size={14} />
              Placed on {new Date(order.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-all shadow-sm">
             <Printer size={20} />
           </button>
           <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-all shadow-sm">
             <Download size={20} />
           </button>
           <select 
             value={order.status}
             onChange={(e) => updateStatus(e.target.value)}
             disabled={updating}
             className="bg-blue-600 text-white px-4 py-2.5 rounded-xl border-none font-semibold focus:ring-2 focus:ring-blue-500/20 text-sm appearance-none cursor-pointer"
           >
             <option value="pending">Mark as Pending</option>
             <option value="confirmed">Mark as Confirmed</option>
             <option value="shipped">Mark as Shipped</option>
             <option value="delivered">Mark as Delivered</option>
             <option value="cancelled">Mark as Cancelled</option>
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Box size={20} className="text-blue-500" />
                Order Items
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items?.map((item) => (
                <div key={item.id} className="p-6 flex items-center gap-6 hover:bg-gray-50/50 transition-colors">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0">
                    {item.product_image && <img src={item.product_image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-grow min-w-0">
                    <Link to={`/products/${item.product_slug}`} className="font-bold text-gray-900 hover:text-blue-600 transition-colors block truncate">
                      {item.product_name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-1">Price: {formatPrice(item.unit_price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatPrice(item.subtotal)}</p>
                    <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 bg-gray-50/50 border-t border-gray-50 space-y-3">
               <div className="flex justify-between text-sm text-gray-500">
                 <span>Subtotal</span>
                 <span className="font-semibold text-gray-900">{formatPrice(order.total_amount)}</span>
               </div>
               <div className="flex justify-between text-sm text-gray-500">
                 <span>Shipping</span>
                 <span className="font-semibold text-gray-900">{formatPrice(0)}</span>
               </div>
               <div className="flex justify-between border-t border-gray-200 pt-4 mt-4">
                 <span className="text-lg font-bold text-gray-900">Total</span>
                 <span className="text-2xl font-bold text-blue-600 font-mono">{formatPrice(order.total_amount)}</span>
               </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-gray-50 pb-4">
              <Truck size={20} className="text-blue-500" />
              Order Timeline
            </h3>
            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
               <div className="relative pl-10">
                 <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-white border-2 border-green-500 rounded-full flex items-center justify-center z-10">
                   <div className="w-2 h-2 bg-green-500 rounded-full" />
                 </div>
                 <p className="font-bold text-sm text-gray-900">Order Placed</p>
                 <p className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleString()}</p>
                 <p className="bg-green-50 text-green-700 p-2.5 rounded-lg text-xs mt-3 border border-green-100">Successfully received the order.</p>
               </div>
               {/* Simplified timeline */}
               <div className="relative pl-10">
                 <div className={`absolute left-0 top-1 w-[24px] h-[24px] bg-white border-2 ${order.status !== 'pending' ? 'border-green-500' : 'border-gray-200'} rounded-full flex items-center justify-center z-10`}>
                   <div className={`w-2 h-2 ${order.status !== 'pending' ? 'bg-green-500' : 'bg-gray-200'} rounded-full`} />
                 </div>
                 <p className={`font-bold text-sm ${order.status !== 'pending' ? 'text-gray-900' : 'text-gray-400'}`}>Payment Confirmed</p>
                 <p className="text-xs text-gray-400 mt-1">Automatic verification complete.</p>
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6 text-sm">
            <h3 className="text-lg font-bold border-b border-gray-50 pb-4">Customer Details</h3>
            <div className="flex items-center gap-4 group cursor-pointer">
               <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">
                 {order.user_name?.[0] || 'C'}
               </div>
               <div>
                 <p className="font-bold text-gray-900">{order.user_name}</p>
                 <Link to={`/admin/users/${order.user}`} className="text-xs text-blue-600 hover:underline">View Profile</Link>
               </div>
            </div>
            <div className="space-y-4 pt-6 mt-6 border-t border-gray-50">
               <div className="flex items-start gap-4">
                 <Mail size={18} className="text-gray-400 mt-0.5" />
                 <div>
                   <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Email Address</p>
                   <p className="font-medium text-gray-900">{order.user_email}</p>
                 </div>
               </div>
               <div className="flex items-start gap-4">
                 <Phone size={18} className="text-gray-400 mt-0.5" />
                 <div>
                   <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Phone Number</p>
                   <p className="font-medium text-gray-900">+1 (555) 000-1122</p>
                 </div>
               </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6 text-sm">
            <h3 className="text-lg font-bold border-b border-gray-50 pb-4">Shipping Destination</h3>
            <div className="flex items-start gap-4">
               <MapPin size={22} className="text-blue-500 mt-1 flex-shrink-0" />
               <div className="space-y-1">
                 <p className="font-bold text-gray-900 text-base">{order.shipping_address?.full_name}</p>
                 <p className="text-gray-600 leading-relaxed">
                   {order.shipping_address?.address_line1}<br />
                   {order.shipping_address?.address_line2 && <>{order.shipping_address?.address_line2}<br /></>}
                   {order.shipping_address?.city}, {order.shipping_address?.state}<br />
                   {order.shipping_address?.pincode}, {order.shipping_address?.country}
                 </p>
               </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6 text-sm">
            <h3 className="text-lg font-bold border-b border-gray-50 pb-4">Payment & Invoicing</h3>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <CreditCard size={20} className="text-gray-400" />
                   <p className="font-bold uppercase tracking-wide">Razorpay ID</p>
                 </div>
                 <CheckCircle size={18} className="text-emerald-500" />
               </div>
               <p className="text-xs text-blue-600 font-mono mt-3 select-all bg-white p-2 rounded border border-gray-100 truncate shadow-sm">
                 pay_9x21JzL292K0
               </p>
            </div>
            <div className="flex items-center justify-between px-2">
               <p className="text-gray-400 font-medium">Payment Status</p>
               <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase text-xs">
                 {order.payment_status}
               </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
