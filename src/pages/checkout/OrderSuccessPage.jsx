import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiPackage, FiArrowRight } from 'react-icons/fi';

const OrderSuccessPage = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl shadow-green-500/10 border border-green-50 animate-glow"
            >
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <FiCheckCircle className="text-5xl text-green-600" />
                </div>
                
                <h1 className="text-4xl font-black text-gray-900 mb-4 italic uppercase tracking-tighter">Success!</h1>
                <p className="text-gray-500 mb-10 font-medium">Your order has been placed successfully. We'll send you a confirmation email shortly.</p>
                
                <div className="space-y-4">
                    <Link 
                        to="/orders" 
                        className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                    >
                        VIEW MY ORDERS <FiPackage className="text-xl" />
                    </Link>
                    
                    <Link 
                        to="/" 
                        className="w-full bg-white text-gray-900 border-2 border-gray-100 font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-gray-50"
                    >
                        CONTINUE SHOPPING <FiArrowRight className="text-xl" />
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderSuccessPage;
