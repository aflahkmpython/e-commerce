import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, clearCurrentProduct } from '../../features/products/productSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiShoppingCart, 
    FiHeart, 
    FiShare2, 
    FiStar, 
    FiArrowLeft, 
    FiCheckCircle, 
    FiPackage, 
    FiEdit2 
} from 'react-icons/fi';
import { addToCart } from '../../features/cart/cartSlice';
import { toast } from 'react-hot-toast';
import ReviewSection from '../../components/products/ReviewSection';
import GlassCard from '../../components/common/GlassCard';
import { buttonPulse, hoverLift } from '../../constants/animations';
import { formatPrice } from '../../utils/format';

const ProductDetailPage = () => {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentProduct, loading, error } = useSelector((state) => state.products);
    const { isAuthenticated, role } = useSelector((state) => state.auth);
    const [selectedImage, setSelectedImage] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const scrollRef = useRef(null);

    const isAdmin = role === 'admin';

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            toast.error('Please login to add items to cart');
            navigate('/login');
            return;
        }
        dispatch(addToCart({ product_id: currentProduct.id, quantity }));
        toast.success(`${currentProduct.name} added to cart!`);
    };

    useEffect(() => {
        dispatch(fetchProductById(slug));
        return () => dispatch(clearCurrentProduct());
    }, [dispatch, slug]);

    useEffect(() => {
        if (currentProduct?.images?.length > 0) {
            const primary = currentProduct.images.find(img => img.is_primary) || currentProduct.images[0];
            setSelectedImage(primary.image);
        }
    }, [currentProduct]);

    const scrollToImage = (idx) => {
        if (scrollRef.current) {
            const width = scrollRef.current.offsetWidth;
            scrollRef.current.scrollTo({
                left: width * idx,
                behavior: 'smooth'
            });
        }
    };

    if (loading) return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-neon-teal"></div>
      </div>
    );
    
    if (error || !currentProduct) return (
      <div className="text-center py-20 text-brand-accent font-bold">
        Product not found. <Link to="/" className="underline text-gray-500">Go back</Link>
      </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-24 md:pb-12">
            <div className="flex items-center justify-between mb-8">
                <Link to="/" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-neon-teal group transition-colors">
                    <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> BACK TO SHOP
                </Link>

                {isAdmin && (
                    <button 
                        onClick={() => navigate(`/admin/products/${currentProduct.id}/edit`)}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
                    >
                        <FiEdit2 size={14} /> Edit in Admin
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                {/* Image Gallery */}
                <div className="space-y-6">
                    {/* Main Image */}
                    <div className="relative group">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="hidden md:flex aspect-square rounded-3xl overflow-hidden bg-white shadow-2xl border border-gray-100 items-center justify-center p-4"
                        >
                            <AnimatePresence mode="wait">
                                <motion.img 
                                    key={selectedImage}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    src={selectedImage} 
                                    alt={currentProduct.name}
                                    className="w-full h-full object-contain"
                                />
                            </AnimatePresence>
                        </motion.div>

                        {/* Mobile Swipe View */}
                        <div 
                          ref={scrollRef}
                          className="md:hidden flex aspect-square overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-2xl bg-white shadow-xl border border-gray-100"
                        >
                          {currentProduct.images.map((img, idx) => (
                            <div key={idx} className="flex-shrink-0 w-full h-full snap-center p-4">
                              <img src={img.image} className="w-full h-full object-contain" alt="" />
                            </div>
                          ))}
                        </div>

                        {/* Navigation Dots (Mobile) */}
                        <div className="md:hidden flex justify-center gap-2 mt-4">
                          {currentProduct.images.map((_, idx) => (
                            <button 
                              key={idx}
                              onClick={() => scrollToImage(idx)}
                              className="w-2 h-2 rounded-full bg-gray-200 transition-all hover:bg-neon-teal"
                            />
                          ))}
                        </div>
                    </div>
                    
                    {/* Thumbnails (Desktop) */}
                    <div className="hidden md:flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {currentProduct.images.map((img, idx) => (
                            <motion.button 
                                key={idx}
                                variants={hoverLift}
                                whileHover="whileHover"
                                onClick={() => setSelectedImage(img.image)}
                                className={`flex-shrink-0 w-24 h-24 rounded-2xl border-2 transition-all p-2 bg-white shadow-md ${selectedImage === img.image ? 'border-neon-teal ring-4 ring-neon-teal/10' : 'border-gray-100 opacity-70 hover:opacity-100'}`}
                            >
                                <img src={img.image} className="w-full h-full object-contain" />
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <span className="px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-[10px] font-black uppercase tracking-widest">{currentProduct.category_name}</span>
                        <div className="flex gap-2">
                             <motion.button variants={buttonPulse} whileTap="whileTap" className="p-3 bg-white text-gray-400 hover:text-brand-accent rounded-full transition-all shadow-sm border border-gray-100"><FiHeart /></motion.button>
                             <motion.button variants={buttonPulse} whileTap="whileTap" className="p-3 bg-white text-gray-400 hover:text-neon-teal rounded-full transition-all shadow-sm border border-gray-100"><FiShare2 /></motion.button>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-brand-dark mb-4 leading-tight font-futuristic">{currentProduct.name}</h1>
                    
                    <div className="flex items-center gap-6 mb-8">
                        <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                            {[...Array(5)].map((_, i) => (
                                <FiStar key={i} className={`text-sm ${i < Math.round(currentProduct.average_rating) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                            ))}
                            <span className="text-sm font-bold text-yellow-700 ml-1">{currentProduct.average_rating.toFixed(1)}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest border-l pl-6">{currentProduct.reviews.length} REVIEWS</span>
                    </div>

                    <GlassCard className="p-8 mb-10 group" hover={false}>
                         <div className="relative z-10">
                            {currentProduct.discount_price ? (
                                <div className="space-y-1">
                                    <span className="text-sm font-bold text-brand-accent line-through opacity-50 block">{formatPrice(currentProduct.price)}</span>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-5xl font-black text-brand-dark">{formatPrice(currentProduct.discount_price)}</span>
                                        <span className="bg-brand-accent text-white px-3 py-1 rounded-xl text-xs font-black">-{Math.round((1 - currentProduct.discount_price / currentProduct.price) * 100)}%</span>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-5xl font-black text-brand-dark">{formatPrice(currentProduct.price)}</span>
                            )}
                            
                            <div className="mt-6 flex flex-wrap gap-4">
                                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${currentProduct.stock > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                    <FiPackage /> {currentProduct.stock > 0 ? `${currentProduct.stock} IN STOCK` : 'OUT OF STOCK'}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                                  <FiCheckCircle /> AUTHENTIC
                                </div>
                            </div>
                         </div>
                    </GlassCard>

                    <div className="flex flex-col sm:flex-row gap-4 mb-10">
                        <div className="flex items-center bg-white border border-gray-100 rounded-2xl p-2 h-14 w-full sm:w-32 shadow-md">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl font-bold text-xl transition-colors">-</button>
                            <span className="flex-1 text-center font-black text-lg">{quantity}</span>
                            <button onClick={() => setQuantity(Math.min(currentProduct.stock, quantity + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl font-bold text-xl transition-colors">+</button>
                        </div>
                        <motion.button 
                            variants={buttonPulse}
                            whileTap="whileTap"
                            onClick={handleAddToCart}
                            className="flex-1 bg-brand-dark text-white font-black rounded-2xl h-14 shadow-xl shadow-gray-200 flex items-center justify-center gap-3 transition-all disabled:opacity-50" 
                            disabled={currentProduct.stock === 0}
                        >
                            <FiShoppingCart className="text-xl" /> ADD TO BAG
                        </motion.button>
                    </div>

                    <div className="prose prose-sm text-gray-500 bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-gray-100 font-medium leading-relaxed shadow-sm">
                        <h4 className="text-xs font-black uppercase tracking-widest text-brand-dark mb-3">Product Description</h4>
                        <div dangerouslySetInnerHTML={{ __html: currentProduct.description }} />
                    </div>
                </div>
            </div>
            
            <div className="mt-20">
              <ReviewSection reviews={currentProduct.reviews} averageRating={currentProduct.average_rating} />
            </div>
        </div>
    );
};

export default ProductDetailPage;
