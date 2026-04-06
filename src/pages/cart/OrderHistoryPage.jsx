import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage, FiCalendar, FiDollarSign, FiChevronRight, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format';

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axiosInstance.get('orders/orders/');
                setOrders(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'paid': return 'bg-green-100 text-green-700 border-green-200';
            case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'delivered': return 'bg-primary-100 text-primary-700 border-primary-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div></div>;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl font-black text-gray-900 mb-10 flex items-center gap-4">
                Order History
                <span className="text-sm font-bold bg-primary-100 text-primary-700 px-3 py-1 rounded-full uppercase">{orders.length} Total</span>
            </h1>

            {orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                    <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-500 mb-8">Once you place an order, it will appear here.</p>
                    <Link to="/" className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg">Start Shopping</Link>
                </div>
            ) : (
                <div className="space-y-6">
                    <AnimatePresence>
                        {orders.map((order) => (
                            <motion.div 
                                key={order.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
                            >
                                <div className="p-8">
                                    <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-primary-50 transition-colors">
                                                <FiPackage className="text-2xl text-gray-400 group-hover:text-primary-600 transition-colors" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900">Order #ORD-{String(order.id).padStart(6, '0')}</h3>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest"><FiCalendar className="mr-1" /> {new Date(order.created_at).toLocaleDateString()}</span>
                                                    <span className={`text-[10px] uppercase tracking-tighter font-black px-2.5 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>{order.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                                            <p className="text-2xl font-black text-gray-900">{formatPrice(order.total_amount)}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><FiClock /> Items Summary</h4>
                                            <div className="space-y-3">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="text-gray-600 font-medium">{item.quantity} x {item.product_name}</span>
                                                        <span className="text-gray-900 font-bold">{formatPrice(item.total_price)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">Shipping To</h4>
                                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                <p className="text-sm font-bold text-gray-900">{order.shipping_address_details?.full_name}</p>
                                                <p className="text-xs text-gray-500 mt-1">{order.shipping_address_details?.address_line_1}, {order.shipping_address_details?.city}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;
