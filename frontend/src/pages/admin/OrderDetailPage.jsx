import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchAdminOrderDetail, 
    updateOrderStatus, 
    optimisticUpdateStatus 
} from '../../features/admin/adminOrdersSlice';
import { 
    FiMail, 
    FiPhone, 
    FiMapPin, 
    FiPackage, 
    FiCreditCard, 
    FiCheckCircle,
    FiClock,
    FiUser,
    FiChevronRight,
    FiArrowLeft
} from 'react-icons/fi';
import { STATUS_COLORS, PAYMENT_COLORS } from './OrderListPage';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const OrderDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentOrder: order, detailLoading: loading, updateLoading } = useSelector(state => state.adminOrders);

    const [newStatus, setNewStatus] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        dispatch(fetchAdminOrderDetail(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (order) setNewStatus('');
    }, [order]);

    if (loading) return <div className="p-20 text-center font-black uppercase italic text-gray-400 animate-pulse">Scanning Order Database...</div>;
    if (!order) return <div className="p-20 text-center font-black uppercase italic text-red-400">Order Not Found</div>;

    const validTransitions = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['shipped', 'cancelled'],
        'shipped': ['delivered', 'cancelled'],
        'delivered': [],
        'cancelled': []
    };

    const nextStatuses = valid_transitions[order.status] || [];

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        if (!newStatus) return;

        // Optimistic Update
        const previousStatus = order.status;
        dispatch(optimisticUpdateStatus({ id: order.id, status: newStatus }));
        
        try {
            await dispatch(updateOrderStatus({ id: order.id, status: newStatus, notes })).unwrap();
            toast.success('Status updated successfully');
            setNotes('');
        } catch (err) {
            toast.error(err.error || 'Failed to update status');
            // Rollback
            dispatch(optimisticUpdateStatus({ id: order.id, status: previousStatus }));
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Breadcrumb & Navigation */}
            <div className="flex items-center justify-between">
                <Link to="/admin/orders" className="flex items-center gap-2 text-gray-400 hover:text-black font-black uppercase italic text-xs transition-colors">
                    <FiArrowLeft /> Back to Orders
                </Link>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest italic">
                    Admin <FiChevronRight /> Orders <FiChevronRight /> <span className="text-gray-900">#ORD-{order.id.toString().padStart(4, '0')}</span>
                </div>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
                {/* Left Panel: Customer & Shipping */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
                                <FiUser className="text-blue-500" /> Customer Profile
                            </p>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-gray-900 italic uppercase leading-tight">{order.user_full_name}</h3>
                                <a href={`mailto:${order.user_email}`} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-2 italic">
                                    <FiMail size={14} /> {order.user_email}
                                </a>
                                {order.user_phone && (
                                    <p className="text-xs font-bold text-gray-500 flex items-center gap-2 italic">
                                        <FiPhone size={14} /> {order.user_phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 pt-8 border-t border-gray-50">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
                                <FiMapPin className="text-red-500" /> Shipping Logic
                            </p>
                            <div className="bg-gray-50 p-6 rounded-2xl space-y-1">
                                <p className="text-xs font-black text-gray-900 uppercase italic opacity-60">Full Address</p>
                                <p className="text-xs font-bold text-gray-700 leading-relaxed uppercase italic">
                                    {order.shipping_address?.address_line1}<br />
                                    {order.shipping_address?.address_line2 && <>{order.shipping_address.address_line2}<br/></>}
                                    {order.shipping_address?.city}, {order.shipping_address?.state}<br />
                                    {order.shipping_address?.pincode}, {order.shipping_address?.country}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Panel: Order Items */}
                <div className="lg:col-span-6 space-y-8">
                    <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="bg-gray-50/50 py-6 px-10 border-b border-gray-100 flex items-center justify-between">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic flex items-center gap-2">
                                <FiPackage className="text-blue-500" /> Itemized Product List
                            </p>
                            <span className="px-3 py-1 bg-white rounded-lg text-[10px] font-black text-gray-600">{order.items?.length} Items</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {order.items?.map((item) => (
                                <div key={item.id} className="p-8 flex items-center gap-6 hover:bg-gray-50/30 transition-all">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                                        {item.product_thumbnail ? (
                                            <img src={item.product_thumbnail} alt={item.product_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-200"><FiPackage size={24} /></div>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-sm font-black text-gray-900 uppercase italic mb-1">{item.product_name}</h4>
                                        <p className="text-[10px] font-black text-gray-400 italic">Qty: {item.quantity} x {Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.unit_price)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-gray-900 italic">
                                            {Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.subtotal)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-900 p-10 text-white space-y-4">
                            <div className="flex justify-between items-center opacity-60">
                                <span className="text-[10px] font-black uppercase tracking-widest italic">Subtotal</span>
                                <span className="font-bold italic">{Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(parseFloat(order.total_amount))}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-white/10 pt-4">
                                <span className="text-xs font-black uppercase tracking-widest italic">Grand Total</span>
                                <span className="text-2xl font-black italic">{Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(parseFloat(order.total_amount))}</span>
                            </div>
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
                            <FiClock className="text-orange-500" /> Operational Timeline
                        </p>
                        <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-50">
                            {order.audit_logs?.map((log, i) => (
                                <div key={log.id} className="relative pl-12">
                                    <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${i === 0 ? 'bg-blue-500 text-white ring-4 ring-blue-50' : 'bg-gray-100 text-gray-400'}`}>
                                        {i === 0 ? <FiCheckCircle size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${STATUS_COLORS[log.status]}`}>
                                                {log.status}
                                            </span>
                                            <span className="text-[10px] font-black text-gray-400 italic">
                                                {format(new Date(log.created_at), 'dd MMM, HH:mm')} by {log.changed_by_name}
                                            </span>
                                        </div>
                                        {log.notes && (
                                            <p className="text-xs font-medium text-gray-600 bg-gray-50 p-3 rounded-xl inline-block mt-2">{log.notes}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {/* Order Placement Node */}
                            <div className="relative pl-12">
                                <div className="absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white bg-gray-50 text-gray-300 flex items-center justify-center">
                                    <FiPackage size={14} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-900 uppercase italic">Order Placed</p>
                                    <p className="text-[10px] font-black text-gray-400 italic">{format(new Date(order.created_at), 'dd MMM, HH:mm')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Payment & Status Update */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
                                <FiCreditCard className="text-purple-500" /> Transaction Detail
                            </p>
                            <div className="p-6 bg-gray-50 rounded-[2rem] space-y-4">
                                <div className={`inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${PAYMENT_COLORS[order.payment_status] || 'bg-gray-100 border-gray-200'}`}>
                                    Payment {order.payment_status}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase italic">Payment Method</p>
                                    <p className="text-sm font-black text-gray-900 italic uppercase">Secure Gateway</p>
                                </div>
                                {order.payment_id && (
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase italic">Transaction ID</p>
                                        <p className="text-[10px] font-mono font-bold text-gray-500 truncate">{order.payment_id}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6 pt-8 border-t border-gray-50">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
                                <FiPackage className="text-orange-500" /> Update Management
                            </p>
                            <form onSubmit={handleStatusUpdate} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">New Lifecycle State</label>
                                    <select 
                                        className="w-full h-12 bg-gray-50 border-none rounded-xl px-6 text-xs font-black uppercase italic text-gray-900 focus:ring-4 focus:ring-blue-100"
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        disabled={nextStatuses.length === 0}
                                    >
                                        <option value="">Select Next Status...</option>
                                        {nextStatuses.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                    {nextStatuses.length === 0 && (
                                        <p className="text-[8px] font-black text-red-400 italic px-4">Order in final state.</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Internal Dispatch Notes</label>
                                    <textarea 
                                        className="w-full h-24 bg-gray-50 border-none rounded-xl p-4 text-xs font-medium text-gray-700 focus:ring-4 focus:ring-blue-100 resize-none"
                                        placeholder="Add notes for the timeline..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    disabled={!newStatus || updateLoading}
                                    className="w-full h-14 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-30 flex items-center justify-center gap-2"
                                >
                                    {updateLoading ? 'Updating...' : <><FiCheckCircle /> Confirm Change</>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
const valid_transitions = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['shipped', 'cancelled'],
    'shipped': ['delivered', 'cancelled'],
    'delivered': [],
    'cancelled': []
};
