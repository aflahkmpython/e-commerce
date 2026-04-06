import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, fetchCart } from '../../features/cart/cartSlice';
import { formatPrice } from '../../utils/format';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, totalPrice } = useSelector((state) => state.cart);

    const handleUpdateQuantity = (product_id, currentQty, delta) => {
        const newQty = currentQty + delta;
        if (newQty > 0) {
            dispatch(updateQuantity({ product_id, quantity: newQty }));
        }
    };

    const handleRemove = (product_id) => {
        dispatch(removeFromCart(product_id));
    };

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white/70 backdrop-blur-3xl z-50 shadow-[-20px_0_50px_rgba(0,0,0,0.1)] border-l border-white/30 flex flex-col overflow-hidden"
                    >
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 -z-10 w-full h-full opacity-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        {/* Header */}
                        <div className="p-6 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="w-6 h-6 text-indigo-600" />
                                <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
                                <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-sm font-medium">
                                    {items.reduce((acc, item) => acc + item.quantity, 0)}
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-grow overflow-y-auto p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                                    <ShoppingBag className="w-16 h-16 opacity-20" />
                                    <p className="text-lg">Your cart is empty</p>
                                    <button
                                        onClick={onClose}
                                        className="text-indigo-600 font-medium hover:underline"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.product?.id || Math.random()} className="flex gap-4 group">
                                        <div className="w-24 h-24 bg-white/50 backdrop-blur-sm rounded-2xl overflow-hidden flex-shrink-0 border border-white/50 shadow-sm relative group">
                                            <img
                                                src={item.product?.primary_image || item.product?.images?.[0]?.image || 'https://via.placeholder.com/400x500?text=Product'}
                                                alt={item.product?.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between">
                                                <h3 className="font-medium text-gray-900">{item.product?.name}</h3>
                                                <button
                                                    onClick={() => handleRemove(item.product?.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-2">{formatPrice(item.product?.current_price || item.product?.price)}</p>
                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex items-center border rounded-lg bg-gray-50">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.product?.id, item.quantity, -1)}
                                                        className="p-1 hover:bg-gray-200 rounded-l-lg transition-colors"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="px-3 text-sm font-medium w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.product?.id, item.quantity, 1)}
                                                        className="p-1 hover:bg-gray-200 rounded-r-lg transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="font-bold text-gray-900">{formatPrice((Number(item.product?.current_price || item.product?.price) || 0) * (Number(item.quantity) || 0))}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 border-t bg-gray-50 space-y-4">
                                <div className="flex justify-between items-center text-lg">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-bold text-gray-900">{formatPrice(totalPrice)}</span>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Shipping and taxes calculated at checkout.
                                </p>
                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
