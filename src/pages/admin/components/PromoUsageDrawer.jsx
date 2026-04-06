import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPromoUsage } from '../../../features/admin/promoSlice';
import moment from 'moment';

const PromoUsageDrawer = ({ promo, isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { usages, usageLoading } = useSelector(state => state.promos);
    const promoUsages = promo ? usages[promo.id] : [];

    useEffect(() => {
        if (isOpen && promo) {
            dispatch(fetchPromoUsage(promo.id));
        }
    }, [isOpen, promo, dispatch]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[200] bg-gray-900/40 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[210] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-gray-100 flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase text-gray-900">
                                    Redemption Log
                                </h3>
                                <p className="text-gray-400 font-medium font-mono text-sm mt-1">
                                    {promo?.code}
                                </p>
                            </div>
                            <button onClick={onClose} className="p-3 bg-gray-50 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-all">
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                            {usageLoading ? (
                                <div className="flex items-center justify-center py-20">
                                     <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                                </div>
                            ) : !promoUsages || promoUsages.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="w-16 h-16 bg-gray-100 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiCheckCircle size={32} />
                                    </div>
                                    <h4 className="text-gray-900 font-bold">No redemptions yet</h4>
                                    <p className="text-gray-500 text-sm mt-1">This code hasn't been used.</p>
                                </div>
                            ) : (
                                <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-indigo-100">
                                    {promoUsages.map(usage => (
                                        <div key={usage.id} className="relative pl-8 pb-6 last:pb-0">
                                            <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-white border-4 border-indigo-100 rounded-full z-10" />
                                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-bold text-gray-900 leading-tight">{usage.customer_name}</p>
                                                        <p className="text-sm font-medium text-gray-400">{usage.customer_email}</p>
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                        {moment(usage.used_at).fromNow()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
                                                    <div>
                                                        <p className="text-[10px] font-black italic text-gray-400 uppercase">Order</p>
                                                        <p className="text-sm font-mono font-bold text-gray-900">#{usage.order_id}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black italic text-gray-400 uppercase">Total</p>
                                                        <p className="text-sm font-medium text-gray-900">\u20b9{usage.order_total}</p>
                                                    </div>
                                                    <div className="ml-auto text-right">
                                                        <p className="text-[10px] font-black italic text-indigo-400 uppercase">Saved</p>
                                                        <p className="text-sm font-black italic text-indigo-600">\u20b9{usage.discount_applied}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PromoUsageDrawer;
