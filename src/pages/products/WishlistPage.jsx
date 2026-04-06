import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWishlist, toggleWishlist } from '../../features/products/wishlistSlice';
import { addToCart } from '../../features/cart/cartSlice';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const WishlistPage = () => {
    const dispatch = useDispatch();
    const { wishlist, loading } = useSelector((state) => state.wishlist);
    const { isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchWishlist());
        }
    }, [dispatch, isAuthenticated]);

    const handleRemove = async (productId) => {
        const result = await dispatch(toggleWishlist(productId));
        if (toggleWishlist.fulfilled.match(result)) {
            toast.success('Removed from wishlist');
            dispatch(fetchWishlist());
        }
    };

    const handleAddToCart = (product_id, name) => {
        dispatch(addToCart({ product_id, quantity: 1 }));
        toast.success(`${name} added to bag!`);
    };

    if (!isAuthenticated) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <FiHeart className="w-20 h-20 text-gray-200 mx-auto mb-6" />
                <h1 className="text-3xl font-black text-gray-900 mb-4 uppercase italic">Your Wishlist</h1>
                <p className="text-gray-500 mb-8 font-medium">Please login to view and manage your wishlist.</p>
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
                >
                    Sign In <FiArrowRight className="w-5 h-5" />
                </Link>
            </div>
        );
    }

    if (loading && !wishlist) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-500 font-medium">Loading your favorites...</p>
            </div>
        );
    }

    const items = wishlist?.products || [];

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Wishlist</h1>
                    <p className="text-gray-500 mt-2 font-medium">You have {items.length} items saved for later.</p>
                </div>
                <Link to="/" className="text-primary-600 font-bold hover:underline">Continue Shopping</Link>
            </div>

            <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100"
                    >
                        <FiHeart className="w-20 h-20 text-gray-100 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">It's empty here</h2>
                        <p className="text-gray-500 mb-8 font-medium">Start adding your favorite items to the wishlist!</p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200"
                        >
                            Browse Shop
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {items.map((product) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={product.id}
                                className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 overflow-hidden group"
                            >
                                <div className="relative aspect-square overflow-hidden bg-gray-50 p-4">
                                    <img
                                        src={product.images?.[0]?.image || 'https://via.placeholder.com/300'}
                                        alt={product.name}
                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <button
                                        onClick={() => handleRemove(product.id)}
                                        className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-gray-100"
                                    >
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors truncate">
                                            <Link to={`/products/${product.slug}`}>{product.name}</Link>
                                        </h3>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{product.category_name}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-2xl font-black text-gray-900">${product.price}</span>
                                        <button
                                            onClick={() => handleAddToCart(product.id, product.name)}
                                            className="bg-gray-900 text-white p-3 rounded-2xl hover:bg-primary-600 transition-all active:scale-95 shadow-lg shadow-gray-200"
                                        >
                                            <FiShoppingCart className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WishlistPage;
