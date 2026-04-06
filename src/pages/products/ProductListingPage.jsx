import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../features/products/productSlice';
import { addToCart } from '../../features/cart/cartSlice';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FilterSidebar from '../../components/products/FilterSidebar';
import { FiSearch, FiShoppingCart, FiStar, FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import GlassCard from '../../components/common/GlassCard';
import ProductCard from '../../components/products/ProductCard';
import { hoverLift, buttonPulse, containerVariants, itemVariants } from '../../constants/animations';

// ProductCard removed (extracted)

const ProductListingPage = () => {
    const dispatch = useDispatch();
    const { items, loading, totalCount } = useSelector((state) => state.products);
    console.log("ITEMS:", items);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const params = Object.fromEntries(searchParams.entries());
        dispatch(fetchProducts(params));
    }, [dispatch, searchParams]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-10">
            <FilterSidebar />

            <div className="flex-1">
                <div className="flex flex-col sm:flex-row justify-between items-end mb-10 gap-6 border-b border-gray-100 pb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-brand-dark font-futuristic">
                            EXPLORE PRODUCTS
                        </h1>
                        <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Showing {items.length} of {totalCount} experimental units</p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-72 group">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-neon-teal transition-colors" />
                            <input
                                type="text"
                                placeholder="IDENTIFY UNIT..."
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-neon-teal/20 focus:border-neon-teal text-xs font-bold tracking-widest transition-all shadow-sm uppercase"
                                value={searchParams.get('search') || ''}
                                onChange={(e) => {
                                    const newParams = new URLSearchParams(searchParams);
                                    if (e.target.value) newParams.set('search', e.target.value);
                                    else newParams.delete('search');
                                    setSearchParams(newParams);
                                }}
                            />
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <div key="loading">
                            <SkeletonLoader type="card" count={8} />
                        </div>
                    ) : items.length > 0 ? (
                        <motion.div
                            key="grid"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8"
                        >
                            {items.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm"
                        >
                            <div className="bg-gray-50 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-inner border border-gray-100">
                                <FiSearch className="text-3xl text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-brand-dark font-futuristic">NO UNITS IDENTIFIED</h3>
                            <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Modify parameters or clear filters.</p>
                            <motion.button
                                variants={buttonPulse}
                                whileTap="whileTap"
                                onClick={() => setSearchParams({})}
                                className="mt-8 bg-brand-dark text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-xl"
                            >
                                RESET FILTERS
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProductListingPage;
