import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiBox, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { formatPrice } from '../../utils/format';

const OrderSuccessPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axiosInstance.get(`orders/orders/${orderId}/`);
                setOrder(response.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchOrder();
    }, [orderId]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100"
            >
                <div className="bg-primary-600 p-12 text-center text-white relative">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
                        className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm"
                    >
                        <FiCheckCircle className="text-5xl text-white" />
                    </motion.div>
                    <h1 className="text-4xl font-black mb-2 tracking-tight">Order Confirmed!</h1>
                    <p className="text-primary-100 font-medium">Thank you for your purchase. Your order is being processed.</p>
                    
                    <div className="mt-8 bg-white/10 rounded-2xl p-4 inline-block backdrop-blur-md border border-white/10">
                        <span className="text-xs font-bold uppercase tracking-widest opacity-60">Order Reference</span>
                        <div className="text-xl font-mono font-black mt-1">#ORD-{orderId.padStart(6, '0')}</div>
                    </div>
                </div>

                <div className="p-12">
                    {order && (
                        <div className="mb-10 space-y-4">
                            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-4">
                                <span className="text-gray-400 font-bold uppercase tracking-widest">Ships to</span>
                                <span className="text-gray-900 font-black">{order.shipping_address_details?.full_name}</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Final Acquisition</span>
                                <span className="text-gray-900 font-black text-xl">{formatPrice(order.total_amount)}</span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link 
                            to="/orders" 
                            className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                        >
                            <FiBox /> View Orders
                        </Link>
                        <Link 
                            to="/" 
                            className="bg-gray-100 text-gray-900 px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95"
                        >
                            <FiShoppingBag /> Keep Shopping <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderSuccessPage;
