import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchSiteConfig, updateSiteConfig, 
    fetchBanners, reorderBannersAction,
    fetchFeatured, addFeatured, removeFeatured
} from '../../features/admin/siteCustomizationSlice';
import { 
    FiSettings, FiImage, FiStar, FiLayers, 
    FiSave, FiRefreshCcw, FiPlus, FiTrash2, 
    FiMove, FiCheck, FiX, FiSearch, FiLayout,
    FiMaximize2, FiEye
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// --- Sub-components (Sections) ---

const SortableBannerCard = ({ banner, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: banner.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className="bg-white border border-gray-100 rounded-3xl p-6 flex items-center gap-6 group hover:shadow-xl hover:shadow-gray-100/50 transition-all">
            <div {...attributes} {...listeners} className="cursor-grab p-2 text-gray-300 hover:text-gray-900">
                <FiMove size={20} />
            </div>
            <div className="w-40 h-24 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                <img src={banner.image} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-1">
                <h4 className="text-sm font-black text-gray-900 italic uppercase leading-none">{banner.title}</h4>
                <p className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">{banner.subtitle || 'No Subtitle'}</p>
                <div className="flex items-center gap-2 pt-2">
                    <span className="px-3 py-1 bg-gray-900 text-white text-[8px] font-black uppercase italic rounded-md tracking-widest">{banner.cta_text}</span>
                    <span className={`px-3 py-1 rounded-md text-[8px] font-black uppercase italic tracking-widest ${banner.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {banner.is_active ? 'Active' : 'Hidden'}
                    </span>
                </div>
            </div>
            <button onClick={() => onDelete(banner.id)} className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                <FiTrash2 size={18} />
            </button>
        </div>
    );
};

// --- Main Page Component ---

const SiteCustomizationPage = () => {
    const dispatch = useDispatch();
    const { config, banners, featuredProducts, loading, updateLoading } = useSelector(state => state.siteCustomization);

    const [activeSection, setActiveSection] = useState('general');
    const [localConfig, setLocalConfig] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    
    // Banner Handling
    const [localBanners, setLocalBanners] = useState([]);
    const [activeBanner, setActiveBanner] = useState(null);
    const [bannerImageFile, setBannerImageFile] = useState(null);
    
    // Featured Product Search
    // ... (rest of states)

    const handleSaveBanner = async () => {
        const formData = new FormData();
        Object.entries(activeBanner).forEach(([key, value]) => {
            if (key !== 'image' && value !== null) formData.append(key, value);
        });
        if (bannerImageFile) formData.append('image', bannerImageFile);

        try {
            if (activeBanner.id && typeof activeBanner.id === 'number') {
                await dispatch(updateBannerThunk({ id: activeBanner.id, formData })).unwrap();
                toast.success('Hero Story Updated');
            } else {
                await dispatch(createBanner(formData)).unwrap();
                toast.success('New Hero Story Manifested');
            }
            setActiveBanner(null);
            setBannerImageFile(null);
            dispatch(fetchBanners());
        } catch (err) {
            toast.error('Banner Synchronization Failed');
        }
    };
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        dispatch(fetchSiteConfig());
        dispatch(fetchBanners());
        dispatch(fetchFeatured());
    }, [dispatch]);

    useEffect(() => {
        if (config) setLocalConfig(config);
    }, [config]);

    useEffect(() => {
        if (banners) setLocalBanners(banners);
    }, [banners]);

    const handleInputChange = (field, value) => {
        setLocalConfig(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleSaveGeneral = async () => {
        const formData = new FormData();
        Object.entries(localConfig).forEach(([key, value]) => {
            if (value instanceof File) formData.append(key, value);
            else if (value !== null && value !== undefined) formData.append(key, value);
        });

        try {
            await dispatch(updateSiteConfig(formData)).unwrap();
            toast.success('Identity Synchronized Successfully');
            setIsDirty(false);
        } catch (err) {
            toast.error('Identity Synchronization Failed');
        }
    };

    const handleBannerDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setLocalBanners((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                dispatch(reorderBannersAction(newItems.map(b => b.id)));
                return newItems;
            });
        }
    };

    const handleReset = () => {
        setLocalConfig(config);
        setIsDirty(false);
        toast.success('Settings Reverted to Server State');
    };

    // Product Picker Logic
    useEffect(() => {
        if (!searchQuery) return;
        const delayDebounce = setTimeout(async () => {
            try {
                const response = await axiosInstance.get(`/products/admin/products/?search=${searchQuery}`);
                setSearchResults(response.data.results || response.data);
            } catch (err) {
                toast.error('Search failed');
            }
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    const handleAddFeatured = async (product) => {
        try {
            await dispatch(addFeatured(product.id)).unwrap();
            toast.success(`${product.name} Featured`);
            dispatch(fetchFeatured());
        } catch (err) {
            toast.error(err.message || 'Limit reached (max 8)');
        }
    };

    if (!localConfig) return <div className="p-20 text-center font-black uppercase text-gray-300 italic tracking-[0.2em] animate-pulse">Initializing Boutique Identity...</div>;

    return (
        <div className="flex h-full min-h-[80vh] gap-8 pb-32">
            {/* Control Panel (Left) */}
            <div className="flex-1 space-y-12">
                <header className="space-y-1">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic underline decoration-indigo-500/30 decoration-8 underline-offset-[12px]">Storefront DNA</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Identity, Visual Narrative & Curated Experiences</p>
                </header>

                <div className="space-y-6">
                    {/* Accordion 1: General Identity */}
                    <div className={`overflow-hidden rounded-[3rem] border transition-all duration-500 ${activeSection === 'general' ? 'bg-white border-indigo-100 shadow-xl shadow-indigo-50/50' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                        <button 
                            onClick={() => setActiveSection('general')}
                            className="w-full px-10 py-8 flex items-center justify-between text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl ${activeSection === 'general' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    <FiSettings size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 italic uppercase">General Identity</h3>
                                    <p className="text-[9px] font-black text-gray-400 uppercase italic tracking-widest">Base Branding & Global UI</p>
                                </div>
                            </div>
                        </button>
                        
                        <AnimatePresence>
                            {activeSection === 'general' && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-10 pb-12 space-y-10"
                                >
                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">Boutique Name</label>
                                            <input 
                                                type="text"
                                                className="w-full h-16 bg-gray-50 border-none rounded-2xl px-6 font-black italic text-gray-900 focus:ring-4 focus:ring-indigo-100 transition-all"
                                                value={localConfig.site_name}
                                                onChange={(e) => handleInputChange('site_name', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">Global Colors</label>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-[8px] font-black text-gray-300 uppercase leading-none italic">Primary</p>
                                                    <div className="flex items-center gap-3 h-16 bg-gray-50 rounded-2xl px-4 border border-gray-100">
                                                        <input type="color" value={localConfig.primary_color} onChange={(e) => handleInputChange('primary_color', e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none" />
                                                        <span className="text-[10px] font-black italic text-gray-900 uppercase tracking-tighter">{localConfig.primary_color}</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-[8px] font-black text-gray-300 uppercase leading-none italic">Secondary</p>
                                                    <div className="flex items-center gap-3 h-16 bg-gray-50 rounded-2xl px-4 border border-gray-100">
                                                        <input type="color" value={localConfig.secondary_color} onChange={(e) => handleInputChange('secondary_color', e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none" />
                                                        <span className="text-[10px] font-black italic text-gray-900 uppercase tracking-tighter">{localConfig.secondary_color}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Announcement Bar */}
                                    <div className="bg-gray-900 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-black text-white italic uppercase leading-none">Global Announcement</h4>
                                                <p className="text-[9px] font-black text-indigo-400 uppercase italic">Header Promotional Strip</p>
                                            </div>
                                            <button 
                                                onClick={() => handleInputChange('announcement_is_active', !localConfig.announcement_is_active)}
                                                className={`w-14 h-8 rounded-full relative transition-all duration-500 ease-in-out ${localConfig.announcement_is_active ? 'bg-indigo-500' : 'bg-gray-700'}`}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 ${localConfig.announcement_is_active ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        <div className="space-y-4 relative z-10">
                                            <div className="flex justify-between items-center text-[9px] font-black uppercase text-gray-500 italic">
                                                <span>Payload Message</span>
                                                <span className={localConfig.announcement_text.length > 110 ? 'text-orange-500' : ''}>{localConfig.announcement_text.length}/120</span>
                                            </div>
                                            <input 
                                                type="text"
                                                maxLength={120}
                                                className="w-full h-14 bg-gray-800 border-none rounded-xl px-5 font-black text-xs italic text-white placeholder:text-gray-600 focus:ring-4 focus:ring-indigo-500/20"
                                                placeholder="ENTER FLASH PROMO TEXT..."
                                                value={localConfig.announcement_text}
                                                onChange={(e) => handleInputChange('announcement_text', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">Main Mark (Logo)</label>
                                            <input 
                                                type="file" 
                                                id="logo-upload" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={(e) => handleInputChange('site_logo', e.target.files[0])}
                                            />
                                            <div 
                                                onClick={() => document.getElementById('logo-upload').click()}
                                                className="h-40 bg-gray-50 border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 hover:border-indigo-400 hover:bg-white transition-all cursor-pointer group overflow-hidden"
                                            >
                                                {localConfig.site_logo && (localConfig.site_logo instanceof File ? <img src={URL.createObjectURL(localConfig.site_logo)} className="w-full h-full object-contain p-4" /> : <img src={localConfig.site_logo} className="w-full h-full object-contain p-4" />)}
                                                {!localConfig.site_logo && <><FiImage className="text-gray-300 group-hover:text-indigo-500" size={32} /><span className="text-[9px] font-black text-gray-400 uppercase italic tracking-widest">Replace Branding Asset</span></>}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">Browser Badge (Favicon)</label>
                                            <input 
                                                type="file" 
                                                id="favicon-upload" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={(e) => handleInputChange('favicon', e.target.files[0])}
                                            />
                                            <div 
                                                onClick={() => document.getElementById('favicon-upload').click()}
                                                className="h-40 bg-gray-50 border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 hover:border-indigo-400 hover:bg-white transition-all cursor-pointer group overflow-hidden"
                                            >
                                                {localConfig.favicon && (localConfig.favicon instanceof File ? <img src={URL.createObjectURL(localConfig.favicon)} className="w-full h-full object-contain p-10" /> : <img src={localConfig.favicon} className="w-full h-full object-contain p-10" />)}
                                                {!localConfig.favicon && <><FiMaximize2 className="text-gray-300 group-hover:text-indigo-500" size={32} /><span className="text-[9px] font-black text-gray-400 uppercase italic tracking-widest">Update Browser Icon</span></>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pt-6">
                                        <button 
                                            onClick={handleSaveGeneral}
                                            disabled={!isDirty || updateLoading}
                                            className="h-14 px-10 bg-gray-900 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs flex items-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-gray-200 disabled:opacity-30"
                                        >
                                            {updateLoading ? <FiRefreshCcw className="animate-spin" /> : <FiSave />} 
                                            Synchronize Identity
                                        </button>
                                        <button 
                                            onClick={handleReset}
                                            className="h-14 px-8 border border-gray-100 text-gray-400 rounded-2xl font-black uppercase italic tracking-widest text-[9px] hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all"
                                        >
                                            Discard Revision
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Accordion 2: Hero Banners */}
                    <div className={`overflow-hidden rounded-[3rem] border transition-all duration-500 ${activeSection === 'banners' ? 'bg-white border-orange-100 shadow-xl shadow-orange-50/50' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                        <button onClick={() => setActiveSection('banners')} className="w-full px-10 py-8 flex items-center justify-between text-left">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl ${activeSection === 'banners' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    <FiImage size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 italic uppercase">Hero Carousels</h3>
                                    <p className="text-[9px] font-black text-gray-400 uppercase italic tracking-widest">Main Visibility Narrative</p>
                                </div>
                            </div>
                        </button>
                        <AnimatePresence>
                            {activeSection === 'banners' && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-10 pb-12 space-y-8">
                                    <DndContext collisionDetection={closestCenter} onDragEnd={handleBannerDragEnd}>
                                        <SortableContext items={localBanners} strategy={verticalListSortingStrategy}>
                                            <div className="space-y-4">
                                                {localBanners.map(banner => (
                                                    <SortableBannerCard key={banner.id} banner={banner} onDelete={(id) => toast.error('Delete flow pending')} />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                    <button className="w-full h-16 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center gap-3 text-gray-400 font-black uppercase italic text-[10px] hover:border-orange-400 hover:text-orange-600 transition-all">
                                        <FiPlus /> Manifest New Hero Story
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Accordion 3: Featured Strip */}
                    <div className={`overflow-hidden rounded-[3rem] border transition-all duration-500 ${activeSection === 'featured' ? 'bg-white border-emerald-100 shadow-xl shadow-emerald-50/50' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                        <button onClick={() => setActiveSection('featured')} className="w-full px-10 py-8 flex items-center justify-between text-left">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl ${activeSection === 'featured' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    <FiStar size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 italic uppercase">Curated Product Strip</h3>
                                    <p className="text-[9px] font-black text-gray-400 uppercase italic tracking-widest">Hand-Picked Showcase (Max 8)</p>
                                </div>
                            </div>
                        </button>
                        <AnimatePresence>
                            {activeSection === 'featured' && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-10 pb-12 space-y-10">
                                    <div className="flex flex-wrap gap-4">
                                        {featuredProducts.map(p => (
                                            <div key={p.id} className="relative w-40 group">
                                                <div className="aspect-[4/5] bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
                                                    <img src={p.product_image} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="pt-3 space-y-0.5">
                                                    <p className="text-[10px] font-black text-gray-900 italic uppercase truncate leading-none">{p.product_name}</p>
                                                    <p className="text-[9px] font-black text-emerald-500 italic uppercase">${p.product_price}</p>
                                                </div>
                                                <button onClick={() => dispatch(removeFeatured(p.id))} className="absolute -top-2 -right-2 w-8 h-8 bg-white text-red-500 rounded-full border border-red-50 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <FiX />
                                                </button>
                                            </div>
                                        ))}
                                        {featuredProducts.length < 8 && (
                                            <button 
                                                onClick={() => setShowPicker(true)}
                                                className="w-40 aspect-[4/5] border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center gap-3 text-gray-300 hover:border-emerald-400 hover:text-emerald-500 transition-all font-black uppercase italic text-[9px]"
                                            >
                                                <FiPlus size={24} /> Add Product
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Live Preview Monitor (Right) */}
            <div className="w-[400px] h-[calc(100vh-10rem)] sticky top-32 hidden xl:block">
                <div className="h-full bg-gray-50 rounded-[4rem] border border-gray-100 shadow-2xl p-6 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-gray-200/50 scale-150 -rotate-12 translate-y-[-50%]" />
                    
                    <div className="space-y-4 relative z-10 flex-1 overflow-hidden">
                        <div className="flex items-center justify-between pb-6 border-b border-gray-200/50">
                            <h4 className="text-xs font-black italic uppercase tracking-tighter text-gray-900 flex items-center gap-2">
                                <FiEye className="text-indigo-600" /> Reality Stream
                            </h4>
                            <span className="px-3 py-1 bg-white rounded-lg text-[8px] font-black uppercase italic tracking-widest text-indigo-500 shadow-sm border border-indigo-50">LIVE PREVIEW</span>
                        </div>

                        {/* Miniature Mockup */}
                        <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-inner h-[calc(100%-4rem)] overflow-y-auto no-scrollbar relative flex flex-col">
                            {/* Announcment Strip Preview */}
                            {localConfig.announcement_is_active && localConfig.announcement_text && (
                                <div 
                                    className="h-8 flex items-center justify-center text-[7px] font-black uppercase italic tracking-widest text-white animate-pulse"
                                    style={{ backgroundColor: localConfig.announcement_bg_color }}
                                >
                                    {localConfig.announcement_text}
                                </div>
                            )}

                            {/* Nav Preview */}
                            <div className="p-6 flex items-center justify-between">
                                <span className="text-[12px] font-black italic uppercase tracking-tighter" style={{ color: localConfig.primary_color }}>{localConfig.site_name}</span>
                                <div className="flex gap-2">
                                    <div className="w-4 h-4 bg-gray-50 rounded-full" />
                                    <div className="w-4 h-4 bg-gray-50 rounded-full" />
                                </div>
                            </div>

                            {/* Banner Preview */}
                            {localBanners.length > 0 && (
                                <div className="mx-4 h-48 bg-gray-100 rounded-[2rem] relative overflow-hidden flex items-center justify-center group/mini">
                                    <img src={localBanners[0].image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                    <div className="relative z-10 text-center space-y-1">
                                        <p className="text-[8px] font-black italic uppercase text-gray-900 leading-none">{localBanners[0].title}</p>
                                        <button className="px-3 py-1 bg-black text-white text-[6px] font-black uppercase italic rounded-md" style={{ backgroundColor: localConfig.primary_color }}>{localBanners[0].cta_text}</button>
                                    </div>
                                </div>
                            )}

                            {/* Section Preview Strip */}
                            <div className="p-6 space-y-4">
                                <h5 className="text-[9px] font-black uppercase italic tracking-widest text-gray-400">Featured Drop</h5>
                                <div className="flex gap-3">
                                    {featuredProducts.slice(0, 3).map((p, i) => (
                                        <div key={i} className="flex-1 aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200/50">
                                            <img src={p.product_image} alt="" className="w-full h-full object-cover grayscale-[0.2]" />
                                        </div>
                                    ))}
                                </div>
                                <div className="h-10 border-2 border-dashed border-gray-100 rounded-2xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Modal placeholder */}
            {showPicker && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-gray-900/60 backdrop-blur-xl">
                    <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 shadow-2xl relative animate-in zoom-in-95 duration-500">
                        <button onClick={() => setShowPicker(false)} className="absolute top-10 right-10 p-4 bg-gray-50 text-gray-400 rounded-3xl hover:text-black transition-all">
                            <FiX size={24} />
                        </button>
                        <h2 className="text-3xl font-black text-gray-900 italic uppercase mb-8">Asset Selector</h2>
                        <div className="relative mb-6">
                            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input 
                                type="text"
                                placeholder="IDENTIFY PRODUCT BY FRAGMENT..."
                                className="w-full h-16 pl-16 pr-6 bg-gray-50 border-none rounded-2xl font-black text-xs italic focus:ring-4 focus:ring-emerald-50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="h-96 overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                           {searchResults.map(product => {
                               const isFeatured = featuredProducts.some(p => p.product === product.id);
                               return (
                                   <div 
                                        key={product.id} 
                                        className="p-6 bg-gray-50 rounded-3xl flex items-center justify-between group hover:bg-emerald-50 transition-all border border-gray-100/50"
                                    >
                                       <div className="flex items-center gap-4">
                                           <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
                                               {product.images?.[0] ? <img src={product.images[0].image} alt="" className="w-full h-full object-cover" /> : <FiImage className="text-gray-200" />}
                                           </div>
                                           <div>
                                               <h4 className="text-sm font-black text-gray-900 italic uppercase leading-none">{product.name}</h4>
                                               <p className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest pt-1">${product.price}</p>
                                           </div>
                                       </div>
                                       {isFeatured ? (
                                           <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg"><FiCheck size={20} /></div>
                                       ) : (
                                           <button 
                                                onClick={() => handleAddFeatured(product)}
                                                className="h-10 px-6 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase italic tracking-widest hover:bg-emerald-600 transition-all"
                                            >
                                               FEATURE ITEM
                                           </button>
                                       )}
                                   </div>
                               );
                           })}
                           {searchQuery && searchResults.length === 0 && (
                               <div className="text-center py-20 text-gray-300 font-black uppercase italic text-xs tracking-widest">No Matches Found in Repository</div>
                           )}
                           {!searchQuery && (
                               <div className="text-center py-20 text-gray-300 font-black uppercase italic text-xs tracking-widest">Begin Discovery Query...</div>
                           )}
                        </div>
                    </div>
                </div>
            )}

            {/* Banner Creation/Edit Modal with Crop */}
            {activeBanner && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-gray-900/60 backdrop-blur-xl overflow-y-auto">
                    <div className="bg-white w-full max-w-4xl rounded-[3.5rem] p-12 shadow-2xl relative animate-in zoom-in-95 duration-500 my-10">
                        <button onClick={() => setActiveBanner(null)} className="absolute top-10 right-10 p-4 bg-gray-50 text-gray-400 rounded-3xl hover:text-black transition-all">
                            <FiX size={24} />
                        </button>
                        
                        <div className="grid grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <h2 className="text-3xl font-black text-gray-900 italic uppercase">Banner Manifest</h2>
                                
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">Story Title</p>
                                        <input 
                                            type="text" 
                                            value={activeBanner.title} 
                                            onChange={(e) => setActiveBanner({...activeBanner, title: e.target.value})}
                                            className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 font-black italic text-gray-900 focus:ring-4 focus:ring-orange-100 transition-all"
                                            placeholder="E.G. AUTUMN NOIR COLLECTION" 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">Narrative Subtitle</p>
                                        <input 
                                            type="text" 
                                            value={activeBanner.subtitle} 
                                            onChange={(e) => setActiveBanner({...activeBanner, subtitle: e.target.value})}
                                            className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 font-black italic text-gray-900 focus:ring-4 focus:ring-orange-100 transition-all"
                                            placeholder="E.G. EXPLORE THE ESSENCE OF DARKNESS" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">CTA Label</p>
                                            <input 
                                                type="text" 
                                                value={activeBanner.cta_text} 
                                                onChange={(e) => setActiveBanner({...activeBanner, cta_text: e.target.value})}
                                                className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 font-black italic text-gray-900 focus:ring-4 focus:ring-orange-100 transition-all"
                                                placeholder="SHOP NOW" 
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">CTA Target Link</p>
                                            <input 
                                                type="text" 
                                                value={activeBanner.cta_link} 
                                                onChange={(e) => setActiveBanner({...activeBanner, cta_link: e.target.value})}
                                                className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 font-black italic text-gray-900 focus:ring-4 focus:ring-orange-100 transition-all"
                                                placeholder="/products/new" 
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-900 italic uppercase">Visibility Status</p>
                                            <p className="text-[8px] font-black text-gray-400 uppercase italic tracking-widest">Toggle banner visibility globally</p>
                                        </div>
                                        <button 
                                            onClick={() => setActiveBanner({...activeBanner, is_active: !activeBanner.is_active})}
                                            className={`w-14 h-8 rounded-full relative transition-all duration-500 ease-in-out ${activeBanner.is_active ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                        >
                                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 ${activeBanner.is_active ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <p className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">Visual Asset (21:9 Aspect Recommeded)</p>
                                <div className="aspect-[21/9] bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3 overflow-hidden group hover:border-orange-400 hover:bg-white transition-all cursor-pointer relative">
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => setBannerImageFile(e.target.files[0])} />
                                    {bannerImageFile ? (
                                        <img src={URL.createObjectURL(bannerImageFile)} className="w-full h-full object-cover" />
                                    ) : activeBanner.image ? (
                                        <img src={activeBanner.image} className="w-full h-full object-cover" />
                                    ) : (
                                        <><FiImage className="text-gray-200 group-hover:text-orange-500" size={48} /><span className="text-[9px] font-black text-gray-400 uppercase italic">Supply Visual Narrative</span></>
                                    )}
                                </div>
                                <button 
                                    onClick={() => handleSaveBanner()}
                                    className="w-full h-16 bg-gray-900 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-xl shadow-gray-200"
                                >
                                    <FiCheck size={20} /> Authorize Hero Narrative
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Accordion 4: Promo Sections */}
            <div className={`overflow-hidden rounded-[3rem] border transition-all duration-500 ${activeSection === 'promos' ? 'bg-white border-blue-100 shadow-xl shadow-blue-50/50' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                <button onClick={() => setActiveSection('promos')} className="w-full px-10 py-8 flex items-center justify-between text-left">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${activeSection === 'promos' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <FiLayout size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 italic uppercase">Promotional Blocks</h3>
                            <p className="text-[9px] font-black text-gray-400 uppercase italic tracking-widest">Mid-Page & Footer Marketing</p>
                        </div>
                    </div>
                </button>
                <AnimatePresence>
                    {activeSection === 'promos' && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-10 pb-12 space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-10 border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-gray-300 hover:border-blue-400 hover:text-blue-500 transition-all font-black uppercase italic text-[10px]">
                                    <FiPlus size={24} /> Declare Promotional Segment
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SiteCustomizationPage;
