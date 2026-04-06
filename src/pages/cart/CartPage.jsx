import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, removeFromCart, updateQuantity, applyPromoCode, clearPromo } from '../../features/cart/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { formatPrice } from '../../utils/format';

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, totalPrice, loading, promoCode, promoDiscount, newTotal, promoError } = useSelector((state) => state.cart);
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [promoInput, setPromoInput] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart());
        }
    }, [dispatch, isAuthenticated]);

    const handleApplyPromo = () => {
        if (promoInput.trim()) {
            dispatch(applyPromoCode(promoInput.trim()));
            setPromoInput('');
        }
    };

    const handleQuantityChange = (product_id, currentQty, delta) => {
        const newQty = currentQty + delta;
        if (newQty > 0) {
            dispatch(updateQuantity({ product_id, quantity: newQty }));
        }
    };

    const handleRemove = (product_id) => {
        dispatch(removeFromCart(product_id));
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <FiShoppingBag className="text-6xl text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is lonely</h2>
                <p className="text-gray-500 mb-6 text-center max-w-sm">Please log in to see your cart and start shopping for amazing products.</p>
                <Link to="/login" className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary-500/20">Sign In to Shop</Link>
            </div>
        );
    }

    if (items.length === 0 && !loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <div className="bg-gray-50 p-8 rounded-full mb-6">
                    <FiShoppingBag className="text-6xl text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
                <Link to="/" className="bg-primary-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-primary-500/30 transition-transform hover:-translate-y-1">Start Browsing</Link>
            </div>
        );
    }

    const safeNum = (val) => Number(val) || 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
            {/* Decorative Ambient Glows */}
            <div className="absolute top-0 left-1/4 -z-10 w-64 h-64 bg-primary-400/10 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-20 right-1/4 -z-10 w-96 h-96 bg-indigo-400/10 blur-[120px] rounded-full"></div>

            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter font-futuristic">
                        YOUR <span className="text-primary-600">BAG</span>
                    </h1>
                    <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">
                        Ready for deployment: {items.length} units identified
                    </p>
                </div>
                <Link to="/" className="text-xs font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-2 group">
                    Continue Exploration <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1 space-y-6">
                    <AnimatePresence>
                        {items.map((item) => (
                            <motion.div 
                                key={item.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-md transition-shadow"
                            >
                                <div className="w-24 h-24 sm:w-40 sm:h-40 bg-white/50 backdrop-blur-md rounded-[2rem] overflow-hidden flex-shrink-0 border border-white/50 shadow-inner group">
                                    <img 
                                        src={item.product?.primary_image || item.product?.images?.[0]?.image || 'https://via.placeholder.com/400x500?text=Product'} 
                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
                                        alt={item.product.name}
                                    />
                                </div>
                                
                                <div className="flex-1 min-w-0 py-2">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="px-3 py-1 bg-primary-50 text-xs font-black text-primary-600 rounded-full uppercase tracking-widest mb-2 inline-block">
                                                {item.product.category_name}
                                            </span>
                                            <h3 className="text-xl md:text-2xl font-black text-gray-900 truncate pr-4 leading-tight">
                                                {item.product.name}
                                            </h3>
                                        </div>
                                        <button 
                                            onClick={() => handleRemove(item.product.id)}
                                            className="text-gray-300 hover:text-red-500 p-2 rounded-2xl hover:bg-red-50 transition-all hover:scale-110"
                                        >
                                            <FiTrash2 className="text-xl" />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between mt-6 gap-6">
                                        <div className="flex items-center bg-white border border-gray-100 rounded-[1.25rem] p-1.5 shadow-sm">
                                            <button 
                                                onClick={() => handleQuantityChange(item.product.id, item.quantity, -1)}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-colors font-bold text-lg"
                                            >
                                                <FiMinus />
                                            </button>
                                            <span className="w-12 text-center font-black text-lg">{item.quantity}</span>
                                            <button 
                                                onClick={() => handleQuantityChange(item.product.id, item.quantity, 1)}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-colors font-bold text-lg"
                                            >
                                                <FiPlus />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sub-unit Total</p>
                                            <span className="font-black text-2xl text-gray-900">
                                                {formatPrice(safeNum(item.product.current_price || item.product.price) * safeNum(item.quantity))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="lg:w-[26rem]">
                    <div className="bg-gray-900/95 backdrop-blur-xl rounded-[3rem] p-10 text-white sticky top-32 shadow-2xl border border-white/5 overflow-hidden">
                        {/* Summary Background Glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/20 blur-[60px] rounded-full"></div>
                        
                        <h2 className="text-3xl font-black mb-10 tracking-tight relative">SUMMARY</h2>
                        
                        <div className="space-y-6 mb-10 relative">
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Base Subtotal</span>
                                <span className="text-xl font-bold">{formatPrice(totalPrice)}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Global Logistics</span>
                                <span className="text-xs font-black text-primary-400 uppercase bg-primary-400/10 px-3 py-1 rounded-full">Optimized</span>
                            </div>
                            
                            {safeNum(promoDiscount) > 0 && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-baseline py-4 border-y border-white/5">
                                    <span className="text-sm font-bold text-primary-400 uppercase tracking-widest flex items-center gap-2">
                                        PROMO: {promoCode?.code}
                                        <button onClick={() => dispatch(clearPromo())} className="text-[10px] text-red-400 hover:text-red-300 underline font-black">DROP</button>
                                    </span>
                                    <span className="text-xl font-bold">-{formatPrice(promoDiscount)}</span>
                                </motion.div>
                            )}
                        </div>
-
                        <div className="mb-10 relative">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={promoInput}
                                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                    placeholder="INPUT PROMO" 
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-black placeholder-gray-600 uppercase focus:ring-1 focus:ring-primary-500/50 outline-none transition-all"
                                />
                                <button 
                                    onClick={handleApplyPromo}
                                    className="bg-primary-600 hover:bg-primary-500 text-white font-black px-6 rounded-2xl transition-all shadow-lg active:scale-95"
                                >
                                    APPLY
                                </button>
                            </div>
                            {promoError && <p className="text-red-400 text-[10px] mt-3 font-black uppercase tracking-widest">{promoError}</p>}
                        </div>
-
                        <div className="pt-8 border-t border-white/10 mb-10 relative">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 text-right">TOTAL ACQUISITION COST</p>
                            <div className="flex justify-end gap-3 items-baseline">
                                <span className="text-5xl font-black text-white tracking-tighter">{formatPrice(safeNum(newTotal) || safeNum(totalPrice))}</span>
                            </div>
                        </div>
-
                        <button 
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-white text-gray-900 hover:bg-primary-50 font-black py-6 rounded-[1.75rem] flex items-center justify-center gap-3 shadow-2xl transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden"
                        >
                            <span className="relative z-10">INITIALIZE CHECKOUT</span>
                            <FiArrowRight className="text-xl relative z-10 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
