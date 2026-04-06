import React from 'react';
import { FiX, FiShoppingCart, FiHeart, FiShare2, FiStar } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ProductPreviewModal = ({ isOpen, onClose, product, images }) => {
    if (!isOpen) return null;

    const primaryImage = images.find(img => img.is_primary) || images[0];
    const previewUrl = primaryImage?.preview || primaryImage?.image || '/placeholder-product.png';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col md:flex-row"
                >
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg text-gray-500 hover:text-black transition-all z-20"
                    >
                        <FiX size={20} />
                    </button>

                    {/* Left: Image Gallery Preview */}
                    <div className="w-full md:w-1/2 bg-gray-50 p-8 flex flex-col items-center justify-center min-h-[400px]">
                        <div className="w-full h-full rounded-[2rem] overflow-hidden shadow-sm bg-white p-4">
                            <img 
                                src={previewUrl} 
                                alt="Preview" 
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="flex gap-2 mt-4 overflow-x-auto w-full pb-2">
                            {images.map((img, i) => (
                                <div key={i} className={`w-16 h-16 rounded-xl border-2 flex-shrink-0 p-1 ${img.is_primary ? 'border-blue-500' : 'border-white'}`}>
                                    <img src={img.preview || img.image} className="w-full h-full object-contain" alt="" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Info Preview */}
                    <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col overflow-y-auto">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">New Arrival</span>
                            <div className="flex text-yellow-400 gap-0.5">
                                {[...Array(5)].map((_, i) => <FiStar key={i} size={12} fill="currentColor" />)}
                            </div>
                        </div>

                        <h2 className="text-4xl font-black text-gray-900 italic uppercase tracking-tighter mb-4 leading-none">
                            {product.name || 'Product Title'}
                        </h2>

                        <div className="flex items-baseline gap-4 mb-8">
                            <span className="text-3xl font-black text-gray-900 italic">
                                ${product.discount_price || product.price || '0.00'}
                            </span>
                            {product.discount_price && product.price && (
                                <span className="text-xl text-gray-300 line-through font-bold">
                                    ${product.price}
                                </span>
                            )}
                        </div>

                        <div className="prose prose-sm max-w-none text-gray-600 mb-8" 
                             dangerouslySetInnerHTML={{ __html: product.description || 'No description provided.' }} />

                        <div className="mt-auto space-y-4">
                            <div className="flex gap-4">
                                <button className="flex-1 h-14 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all">
                                    <FiShoppingCart /> Add To Cart
                                </button>
                                <button className="w-14 h-14 border-2 border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all">
                                    <FiHeart />
                                </button>
                            </div>
                            <button className="w-full text-xs font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:text-gray-900 transition-colors">
                                <FiShare2 /> Share This Product
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProductPreviewModal;
