import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    fetchAdminProducts, 
    deleteAdminProduct, 
    updateAdminProductStock,
    fetchCategories 
} from '../../features/products/productSlice';
import useDebounce from '../../hooks/useDebounce';
import { 
    FiSearch, 
    FiPlus, 
    FiEdit2, 
    FiTrash2, 
    FiArrowUp, 
    FiArrowDown,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiExternalLink
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductListPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, categories, loading } = useSelector((state) => state.products);

    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');
    const [stockFilter, setStockFilter] = useState('');
    const [ordering, setOrdering] = useState('-created_at');

    const debouncedSearch = useDebounce(search, 400);

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    useEffect(() => {
        const params = {
            search: debouncedSearch,
            category: category || undefined,
            is_active: status === 'active' ? true : status === 'inactive' ? false : undefined,
            in_stock: stockFilter === 'in_stock' ? true : stockFilter === 'out_of_stock' ? false : undefined,
            ordering: ordering,
        };
        dispatch(fetchAdminProducts(params));
    }, [dispatch, debouncedSearch, category, status, stockFilter, ordering]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to deactivate this product?')) {
            try {
                await dispatch(deleteAdminProduct(id)).unwrap();
                toast.success('Product deactivated');
            } catch (err) {
                toast.error('Failed to deactivate product');
            }
        }
    };

    const handleStockUpdate = async (id, currentStock) => {
        const newStock = window.prompt('Update Stock Level:', currentStock);
        if (newStock !== null) {
            try {
                await dispatch(updateAdminProductStock({ id, stock: parseInt(newStock) })).unwrap();
                toast.success('Stock updated');
            } catch (err) {
                toast.error('Failed to update stock');
            }
        }
    };

    const toggleOrdering = (field) => {
        if (ordering === field) setOrdering(`-${field}`);
        else if (ordering === `-${field}`) setOrdering('');
        else setOrdering(field);
    };

    const getSortIcon = (field) => {
        if (ordering === field) return <FiArrowUp className="inline ml-1" />;
        if (ordering === `-${field}`) return <FiArrowDown className="inline ml-1" />;
        return null;
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Products</h1>
                    <p className="text-sm text-zinc-500 font-medium">Manage your catalog, inventory levels, and visibility.</p>
                </div>
                <button 
                    onClick={() => navigate('/admin/products/new')}
                    className="h-11 px-6 bg-zinc-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
                >
                    <FiPlus size={16} /> New Product
                </button>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-wrap items-center gap-4 transition-all focus-within:border-zinc-300">
                <div className="flex-1 min-w-[280px] relative group">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                    <input 
                        type="text"
                        placeholder="Search products..."
                        className="w-full h-10 pl-10 pr-4 bg-zinc-50/50 border border-zinc-100 rounded-lg text-sm focus:ring-0 focus:border-zinc-300 transition-all font-medium placeholder:text-zinc-400"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <select 
                        className="h-10 px-3 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-600 focus:ring-0 focus:border-zinc-300 transition-all"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    <select 
                        className="h-10 px-3 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-600 focus:ring-0 focus:border-zinc-300 transition-all"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Draft</option>
                    </select>

                    <button 
                        onClick={() => setStockFilter(stockFilter === 'in_stock' ? '' : 'in_stock')}
                        className={`h-10 px-4 rounded-lg text-xs font-bold transition-all border ${
                            stockFilter === 'in_stock' 
                            ? 'bg-zinc-900 text-white border-zinc-900' 
                            : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
                        }`}
                    >
                        In Stock
                    </button>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50/50 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100">
                            <tr>
                                <th className="px-6 py-4">Product Details</th>
                                <th 
                                    className="px-6 py-4 cursor-pointer hover:text-zinc-900 transition-colors"
                                    onClick={() => toggleOrdering('category')}
                                >
                                    Category {getSortIcon('category')}
                                </th>
                                <th 
                                    className="px-6 py-4 cursor-pointer hover:text-zinc-900 transition-colors"
                                    onClick={() => toggleOrdering('price')}
                                >
                                    Price {getSortIcon('price')}
                                </th>
                                <th 
                                    className="px-6 py-4 cursor-pointer hover:text-zinc-900 transition-colors"
                                    onClick={() => toggleOrdering('stock')}
                                >
                                    Inventory {getSortIcon('stock')}
                                </th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-6 h-20 bg-zinc-50/20" />
                                    </tr>
                                ))
                            ) : items.map((product) => (
                                <tr key={product.id} className="hover:bg-zinc-50/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg border border-zinc-200 bg-white p-1 overflow-hidden group-hover:border-zinc-300 transition-colors flex-shrink-0">
                                                <img 
                                                    src={product.images?.[0]?.image || '/placeholder-product.png'} 
                                                    className="w-full h-full object-contain" 
                                                    alt="" 
                                                />
                                            </div>
                                            <div className="overflow-hidden">
                                                <h3 className="font-bold text-zinc-900 text-sm truncate leading-tight mb-0.5">{product.name}</h3>
                                                <span className="text-[10px] font-medium text-zinc-400 tracking-tight">ID: {product.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-semibold text-zinc-500">{product.category_name}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-zinc-900 text-sm tabular-nums">${product.price}</span>
                                            {product.discount_price && <span className="text-[10px] text-emerald-600 font-bold">-${(product.price - product.discount_price).toFixed(2)} Off</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm tabular-nums">
                                        <div 
                                            onClick={() => handleStockUpdate(product.id, product.stock)}
                                            className="cursor-pointer group/stock"
                                        >
                                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                                                product.stock < 10 ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                                product.stock <= 20 ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                                'bg-zinc-50 text-zinc-600 border-zinc-200'
                                            }`}>
                                                {product.stock < 10 ? <FiXCircle /> : product.stock <= 20 ? <FiAlertCircle /> : <FiCheckCircle />}
                                                {product.stock} Units
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                            product.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-zinc-100 text-zinc-400 border-zinc-200'
                                        }`}>
                                            {product.is_active ? 'Active' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {product.slug && (
                                                <button 
                                                    onClick={() => window.open(`/products/${product.slug}`, '_blank')}
                                                    className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all"
                                                    title="View on Site"
                                                >
                                                    <FiExternalLink size={14} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                                                className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all"
                                                title="Edit Product"
                                            >
                                                <FiEdit2 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                title="Deactivate"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && items.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="mx-auto w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200 mb-4">
                            <FiSearch size={32} />
                        </div>
                        <h2 className="text-lg font-bold text-zinc-900 mb-1">No products found</h2>
                        <p className="text-sm text-zinc-400">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductListPage;
