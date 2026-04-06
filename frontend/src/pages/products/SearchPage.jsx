import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../features/products/productSlice';
import ProductCard from '../../components/products/ProductCard';
import { FiSearch, FiFrown } from 'react-icons/fi';
import { motion } from 'framer-motion';

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [searchTerm, setSearchTerm] = useState(query);
    const dispatch = useDispatch();
    const { items: products, status } = useSelector((state) => state.products);

    useEffect(() => {
        if (query) {
            dispatch(fetchProducts({ search: query }));
        }
    }, [query, dispatch]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams({ q: searchTerm });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Search Bar */}
                <div className="mb-12">
                    <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search products, brands, categories..."
                            className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-14 pr-4 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-medium shadow-xl shadow-gray-200/50"
                        />
                        <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                        <button 
                            type="submit"
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-500/20"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-black text-gray-900">
                            {query ? `Search results for "${query}"` : 'Discover something new'}
                        </h1>
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                            {products.length} Products Found
                        </span>
                    </div>

                    {status === 'loading' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-gray-200 animate-pulse rounded-3xl h-80"></div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {products.map((product) => (
                                <motion.div 
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
                                <FiFrown className="text-5xl text-gray-300" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">No products found</h2>
                            <p className="text-gray-500 max-w-sm">
                                We couldn't find anything matching your search. Try different keywords or browse our categories.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
