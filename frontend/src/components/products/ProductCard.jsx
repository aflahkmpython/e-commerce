import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiStar, FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { addToCart } from '../../features/cart/cartSlice';
import { formatPrice } from '../../utils/format';
import GlassCard from '../common/GlassCard';
import { buttonPulse, itemVariants } from '../../constants/animations';

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.error('Please login to add items to cart');
            navigate('/login');
            return;
        }
        dispatch(addToCart({ product_id: product.id, quantity: 1 }));
        toast.success(`${product.name} added to cart!`);
    };

    const primaryImage = product.primary_image || 
                       product.images?.find(img => img.is_primary)?.image || 
                       product.images?.[0]?.image || 
                       'https://via.placeholder.com/400x500?text=Product';

    return (
        <motion.div variants={itemVariants}>
            <GlassCard className="group h-full flex flex-col">
                <Link to={`/products/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-50 border-b border-white/10">
                    <img 
                        src={primaryImage} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                    />
                    {product.discount_price && (
                      <div className="absolute top-4 left-4 bg-brand-accent text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                          SALE
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-brand-dark/80 to-transparent flex justify-center">
                        <motion.button 
                            variants={buttonPulse}
                            whileTap="whileTap"
                            onClick={handleAddToCart}
                            className="bg-white text-brand-dark px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl"
                        >
                            <FiPlus className="text-lg" /> QUICK ADD
                        </motion.button>
                    </div>
                </Link>
                <div className="p-5 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-neon-teal uppercase tracking-widest">{product.category_name}</span>
                        <div className="flex items-center gap-1">
                            <FiStar className="text-yellow-400 fill-current text-[10px]" />
                            <span className="text-[10px] font-bold text-gray-400">{product.average_rating.toFixed(1)}</span>
                        </div>
                    </div>
                    <Link to={`/products/${product.slug}`} className="block mb-4">
                        <h3 className="font-bold text-brand-dark group-hover:text-neon-teal transition-colors line-clamp-1 font-futuristic">{product.name}</h3>
                    </Link>
                    <div className="mt-auto flex items-center justify-between">
                        <div className="flex flex-col">
                            {product.discount_price ? (
                                <>
                                    <span className="text-[10px] font-bold text-gray-400 line-through decoration-brand-accent/30">{formatPrice(product.price)}</span>
                                    <span className="text-lg font-black text-brand-dark leading-none">{formatPrice(product.discount_price)}</span>
                                </>
                            ) : (
                                <span className="text-lg font-black text-brand-dark">{formatPrice(product.price)}</span>
                            )}
                        </div>
                        <motion.button 
                            variants={buttonPulse}
                            whileTap="whileTap"
                            onClick={handleAddToCart}
                            role="add-to-cart-button"
                            className="bg-brand-dark text-white p-3 rounded-2xl transition-all shadow-lg hover:shadow-neon-teal/20"
                        >
                            <FiShoppingCart className="text-lg" />
                        </motion.button>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
};

export default ProductCard;
