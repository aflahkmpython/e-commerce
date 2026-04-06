import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../features/orders/orderSlice';
import { motion } from 'framer-motion';
import { FiPackage, FiCalendar, FiClock, FiChevronRight, FiCreditCard } from 'react-icons/fi';
import { format } from 'date-fns';
import { formatPrice } from '../../utils/format';

const OrderHistoryPage = () => {
    const dispatch = useDispatch();
    const { orders, loading, error } = useSelector((state) => state.orders);
    const { isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchOrders());
        }
    }, [dispatch, isAuthenticated]);

    if (loading && orders.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <FiPackage className="text-6xl text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
                <p className="text-gray-500 mb-6 text-center">When you buy something, it will appear here!</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-black text-gray-900 mb-10 italic uppercase">Your Orders</h1>
            
            <div className="space-y-6">
                {orders.map((order) => (
                    <motion.div 
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className="p-6 sm:p-8">
                            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-900 text-white p-3 rounded-2xl shadow-lg">
                                        <FiPackage className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                                        <h3 className="text-lg font-black text-gray-900">#ORD-{order.id}</h3>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-6">
                                    <div className="flex items-center gap-2">
                                        <FiCalendar className="text-gray-400" />
                                        <span className="text-sm font-bold text-gray-600">{format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FiCreditCard className="text-gray-400" />
                                        <span className="text-sm font-black text-gray-900">{formatPrice(order.total_amount)}</span>
                                    </div>
                                    <div className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                                        order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {order.status}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 py-3 border-t border-gray-50 group">
                                        <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                            {item.product?.images?.[0]?.image ? (
                                                <img src={item.product.images[0].image} className="w-full h-full object-contain" alt={item.product.name} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <FiPackage />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 truncate">{item.product?.name || 'Product'}</h4>
                                            <p className="text-xs text-gray-400">{item.quantity} x {formatPrice(item.unit_price)}</p>
                                        </div>
                                        <FiChevronRight className="text-gray-300 group-hover:text-primary-500 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default OrderHistoryPage;
