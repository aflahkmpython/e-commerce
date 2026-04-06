import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProducts } from '../../features/admin/adminProductsSlice';
import { bulkUpdateStock } from '../../features/admin/inventorySlice';
import { FiSave, FiRefreshCcw, FiLayers, FiCheckCircle, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { z } from 'zod';

const stockSchema = z.number().int().min(0, "Non-negative").max(99999);

const BulkStockUpdatePage = () => {
    const dispatch = useDispatch();
    const { products, loading } = useSelector(state => state.products);
    const { updateLoading } = useSelector(state => state.inventory);
    
    const [modifiedStocks, setModifiedStocks] = useState({});

    useEffect(() => {
        dispatch(fetchAdminProducts({ page_size: 100 }));
    }, [dispatch]);

    const handleStockChange = (id, value) => {
        const numValue = parseInt(value) || 0;
        setModifiedStocks(prev => ({
            ...prev,
            [id]: numValue
        }));
    };

    const handleSaveAll = async () => {
        const updates = Object.entries(modifiedStocks).map(([id, stock]) => ({
            product_id: parseInt(id),
            new_stock: stock
        }));

        if (updates.length === 0) {
            toast.error('No inventory revisions detected');
            return;
        }

        try {
            await dispatch(bulkUpdateStock(updates)).unwrap();
            toast.success(`Successfully synchronized ${updates.length} inventory records`);
            setModifiedStocks({});
            dispatch(fetchAdminProducts({ page_size: 100 }));
        } catch (err) {
            toast.error(err.error || 'Bulk synchronization failed');
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic underline decoration-blue-500/30 decoration-8 underline-offset-[12px]">Bulk Inventory Correction</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Mass Data Entry & Supply-Chain Synchronization</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSaveAll}
                        disabled={Object.keys(modifiedStocks).length === 0 || updateLoading}
                        className="h-14 px-8 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl shadow-blue-100 flex items-center gap-3 disabled:opacity-30"
                    >
                        {updateLoading ? <FiRefreshCcw className="animate-spin" /> : <FiSave />} 
                        {updateLoading ? 'SYNCING...' : 'AUTHORIZE BULK ADJUSTMENT'}
                    </button>
                </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex items-start gap-4">
                <FiInfo className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-blue-900 uppercase italic leading-none">Atomic Transaction Guard Enabled</p>
                    <p className="text-[10px] font-semibold text-blue-600 uppercase italic">Either all {Object.keys(modifiedStocks).length} revisions succeed, or the entire batch will be rejected to maintain database integrity.</p>
                </div>
            </div>

            {/* Bulk Grid */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto relative">
                {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center font-black uppercase text-gray-400 italic">Pre-fetching Entire Product Catalog...</div>}
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="py-8 pl-10 pr-6 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Inventory Unit</th>
                            <th className="py-8 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Category</th>
                            <th className="py-8 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Current Registry</th>
                            <th className="py-8 px-10 text-right text-[10px] font-black uppercase tracking-widest text-gray-400 italic">New Target State</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.map((product) => {
                            const isModified = modifiedStocks[product.id] !== undefined;
                            return (
                                <tr key={product.id} className={`group hover:bg-gray-50/50 transition-all duration-300 ${isModified ? 'bg-blue-50/20' : ''}`}>
                                    <td className="py-8 pl-10 pr-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-400 text-[10px] italic">#{product.id}</div>
                                            <h4 className="text-sm font-black text-gray-900 italic uppercase leading-none">{product.name}</h4>
                                        </div>
                                    </td>
                                    <td className="py-8 px-6">
                                        <span className="text-[10px] font-black text-gray-400 uppercase italic">{product.category_name}</span>
                                    </td>
                                    <td className="py-8 px-6">
                                        <div className="text-sm font-black italic text-gray-400 tracking-tighter">
                                            {product.stock} <span className="text-[9px] font-black uppercase tracking-widest ml-1 not-italic opacity-40">Registered</span>
                                        </div>
                                    </td>
                                    <td className="py-8 px-10 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            {isModified && <FiCheckCircle className="text-green-500 animate-in zoom-in duration-300" />}
                                            <input 
                                                type="number"
                                                className={`w-28 h-12 bg-gray-50 border-none rounded-xl text-center text-xs font-black italic focus:ring-4 transition-all ${isModified ? 'ring-2 ring-blue-500 bg-white' : 'focus:ring-blue-100'}`}
                                                value={modifiedStocks[product.id] !== undefined ? modifiedStocks[product.id] : product.stock}
                                                onChange={(e) => handleStockChange(product.id, e.target.value)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BulkStockUpdatePage;
