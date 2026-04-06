import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { 
    createAdminProduct, 
    updateAdminProduct, 
    fetchProductById,
    fetchCategories,
    clearCurrentProduct
} from '../../features/products/productSlice';
import RichTextEditor from '../../components/admin/RichTextEditor';
import ImageUploader from '../../components/admin/ImageUploader';
import ProductPreviewModal from '../../components/admin/ProductPreviewModal';
import { 
    FiArrowLeft, 
    FiSave, 
    FiEye, 
    FiInfo, 
    FiAlertCircle,
    FiExternalLink
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// Zod Schema for Validation
const productSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(200, 'Name cannot exceed 200 characters'),
    category: z.string().min(1, 'Please select a category'),
    description: z.string().min(20, 'Description must be at least 20 characters').max(5000, 'Description cannot exceed 5000 characters'),
    price: z.number().positive('Price must be a positive number'),
    discount_price: z.number().nonnegative().optional().nullable(),
    stock: z.number().int().nonnegative('Stock must be a non-negative integer'),
    is_active: z.boolean().default(true),
}).refine(data => !data.discount_price || data.discount_price < data.price, {
    message: "Discount price must be less than the original price",
    path: ["discount_price"]
});

const ProductFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { categories, currentProduct, loading } = useSelector((state) => state.products);

    const isEditMode = !!id;

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        discount_price: '',
        stock: 0,
        is_active: true,
    });
    const [images, setImages] = useState([]);
    const [errors, setErrors] = useState({});
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchCategories());
        if (isEditMode) {
            dispatch(fetchProductById(id));
        } else {
            dispatch(clearCurrentProduct());
        }
    }, [dispatch, id, isEditMode]);

    useEffect(() => {
        if (isEditMode && currentProduct) {
            setFormData({
                name: currentProduct.name,
                category: currentProduct.category.toString(),
                description: currentProduct.description,
                price: parseFloat(currentProduct.price),
                discount_price: currentProduct.discount_price ? parseFloat(currentProduct.discount_price) : '',
                stock: currentProduct.stock,
                is_active: currentProduct.is_active,
            });
            // Handle existing images
            if (currentProduct.images) {
                setImages(currentProduct.images.map(img => ({
                    ...img,
                    id: img.id.toString(), 
                })));
            }
        }
    }, [currentProduct, isEditMode]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validateForm = () => {
        try {
            const validationData = {
                ...formData,
                price: parseFloat(formData.price),
                discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
                stock: parseInt(formData.stock),
            };
            productSchema.parse(validationData);
            setErrors({});
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                const formattedErrors = {};
                err.errors.forEach(e => {
                    formattedErrors[e.path[0]] = e.message;
                });
                setErrors(formattedErrors);
            }
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix form errors');
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== '' && formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        const newImages = images.filter(img => img instanceof File);
        const existingImages = images.filter(img => !(img instanceof File));
        
        newImages.forEach(file => {
            data.append('uploaded_images', file);
        });

        if (isEditMode) {
            const currentImgIds = existingImages.map(img => parseInt(img.id));
            const deletedImgIds = currentProduct.images
                .filter(img => !currentImgIds.includes(img.id))
                .map(img => img.id);
            
            deletedImgIds.forEach(id => data.append('delete_images', id));
        }

        try {
            if (isEditMode) {
                await dispatch(updateAdminProduct({ id, formData: data })).unwrap();
                toast.success('Product updated');
            } else {
                await dispatch(createAdminProduct(data)).unwrap();
                toast.success('Product created');
            }
            navigate('/admin/products');
        } catch (err) {
            toast.error(err.message || 'Action failed');
        }
    };

    const nameCharCount = formData.name.length;
    const descCharCount = formData.description.replace(/<[^>]*>/g, '').length;

    return (
        <div className="space-y-8 pb-20">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2.5 bg-white border border-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-900 transition-all shadow-sm active:scale-95"
                    >
                        <FiArrowLeft size={18} />
                    </button>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
                            {isEditMode ? 'Edit Product' : 'New Product'}
                        </h1>
                        <p className="text-sm text-zinc-500 font-medium">
                            {isEditMode ? `Managing product ID: ${id}` : 'Create a new item in your catalog.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isEditMode && currentProduct?.slug && (
                        <button 
                            onClick={() => window.open(`/products/${currentProduct.slug}`, '_blank')}
                            className="h-11 px-4 bg-white border border-zinc-200 text-zinc-600 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-zinc-50 transition-all shadow-sm active:scale-95"
                        >
                            <FiExternalLink size={16} /> View on Site
                        </button>
                    )}
                    <button 
                        onClick={() => setIsPreviewOpen(true)}
                        className="h-11 px-6 bg-white border border-zinc-200 text-zinc-600 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-zinc-50 transition-all shadow-sm active:scale-95"
                    >
                        <FiEye size={16} /> Preview
                    </button>
                    <button 
                        onClick={handleSubmit}
                        className="h-11 px-8 bg-zinc-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
                    >
                        <FiSave size={16} /> {isEditMode ? 'Save Changes' : 'Publish Product'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-sm space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-none">Product Name</label>
                                <span className={`text-[10px] font-medium ${nameCharCount > 180 ? 'text-rose-500' : 'text-zinc-300'}`}>
                                    {nameCharCount} / 200
                                </span>
                            </div>
                            <input 
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g. Leather Messenger Bag"
                                className={`w-full h-11 bg-zinc-50/50 border border-zinc-200 rounded-lg px-4 font-medium text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-100 transition-all ${errors.name ? 'border-rose-300' : 'focus:border-zinc-400'}`}
                            />
                            {errors.name && <p className="text-rose-600 text-[10px] font-bold tracking-tight mt-1 items-center flex gap-1"><FiAlertCircle /> {errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-none">Description</label>
                                <span className={`text-[10px] font-medium ${descCharCount > 4980 ? 'text-rose-500' : 'text-zinc-300'}`}>
                                    {descCharCount} / 5000
                                </span>
                            </div>
                            <RichTextEditor 
                                value={formData.description}
                                onChange={(val) => setFormData(p => ({ ...p, description: val }))}
                            />
                            {errors.description && <p className="text-rose-600 text-[10px] font-bold tracking-tight mt-1 items-center flex gap-1"><FiAlertCircle /> {errors.description}</p>}
                        </div>
                    </div>

                    {/* Image Manager */}
                    <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-none">Product Imagery</label>
                            <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded">Multi-Upload</span>
                        </div>
                        <ImageUploader images={images} setImages={setImages} />
                    </div>
                </div>

                {/* Sidebar Configuration */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-sm space-y-8 sticky top-8">
                        {/* Status Toggle */}
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg cursor-pointer group hover:bg-zinc-100/80 transition-all border border-zinc-100">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-wide">Public Visibility</span>
                                    <span className="text-[10px] text-zinc-400 font-medium">Show in storefront</span>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="checkbox" 
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleInputChange}
                                        className="sr-only"
                                    />
                                    <div className={`w-11 h-6 rounded-full transition-colors ${formData.is_active ? 'bg-zinc-900' : 'bg-zinc-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Inventory & Pricing */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">Base Price</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-400 text-sm">$</span>
                                    <input 
                                        type="number"
                                        name="price"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-lg pl-8 pr-4 font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-100 focus:border-zinc-400 transition-all tabular-nums"
                                    />
                                </div>
                                {errors.price && <p className="text-rose-600 text-[10px] font-bold tracking-tight mt-1 px-1 flex items-center gap-1"><FiAlertCircle /> {errors.price}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">Sale Price (Optional)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-400 text-sm">$</span>
                                    <input 
                                        type="number"
                                        name="discount_price"
                                        step="0.01"
                                        value={formData.discount_price}
                                        onChange={handleInputChange}
                                        className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-lg pl-8 pr-4 font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-100 focus:border-zinc-400 transition-all tabular-nums"
                                    />
                                </div>
                                {errors.discount_price && <p className="text-rose-600 text-[10px] font-bold tracking-tight mt-1 px-1 flex items-center gap-1"><FiAlertCircle /> {errors.discount_price}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">Stock Level</label>
                                <input 
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-lg px-4 font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-100 focus:border-zinc-400 transition-all tabular-nums"
                                />
                                {errors.stock && <p className="text-rose-600 text-[10px] font-bold tracking-tight mt-1 px-1 flex items-center gap-1"><FiAlertCircle /> {errors.stock}</p>}
                            </div>
                        </div>

                        {/* Category Selector */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">Collection</label>
                            <select 
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-lg px-4 font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-100 focus:border-zinc-400 transition-all text-sm"
                            >
                                <option value="">Choose category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {errors.category && <p className="text-rose-600 text-[10px] font-bold tracking-tight mt-1 px-1 flex items-center gap-1"><FiAlertCircle /> {errors.category}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            <ProductPreviewModal 
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                product={formData}
                images={images}
            />
        </div>
    );
};

export default ProductFormPage;
