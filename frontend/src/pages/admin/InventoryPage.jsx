import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLowStock, updateStock, optimisticUpdateStock, fetchStockHistory } from '../../features/admin/inventorySlice';
import { 
    FiAlertCircle, FiEdit2, FiHistory, FiSave, 
    FiX, FiChevronRight, FiPackage, FiBarChart2,
    FiArrowUpRight, FiZap
} from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { z } from 'zod';

// Zod Schema for Stock
const stockSchema = z.number().int().min(0, "Stock cannot be negative").max(99999, "Maximum stock limit reached");

const InventoryPage = () => {
    const dispatch = useDispatch();
    const { lowStockItems: items, loading, history, historyLoading } = useSelector(state => state.inventory);
    
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [selectedHistoryId, setSelectedHistoryId] = useState(null);

    useEffect(() => {
        dispatch(fetchLowStock());
    }, [dispatch]);

    const handleEditClick = (item) => {
        setEditingId(item.id);
        setEditValue(item.stock.toString());
    };

    const handleSave = async (id) => {
        const value = parseInt(editValue);
        const result = stockSchema.safeParse(value);
        
        if (!result.success) {
            toast.error(result.error.errors[0].message);
            return;
        }

        const previousItem = items.find(i => i.id === id);
        const previousStock = previousItem.stock;

        // Optimistic UI
        dispatch(optimisticUpdateStock({ id, stock: value }));
        setEditingId(null);

        try {
            await dispatch(updateStock({ id, stock: value })).unwrap();
            toast.success('Inventory state synchronized');
        } catch (err) {
            toast.error(err.error || 'Sync failed');
            dispatch(optimisticUpdateStock({ id, stock: previousStock }));
        }
    };

    const openHistory = (id) => {
        setSelectedHistoryId(id);
        dispatch(fetchStockHistory(id));
    };

    const getStockBadge = (stock) => {
        if (stock < 5) return 'bg-red-50 text-red-600 border-red-100 ring-4 ring-red-50';
        return 'bg-amber-50 text-amber-600 border-amber-100 ring-4 ring-amber-50';
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header Identity */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic underline decoration-orange-500/30 decoration-8 underline-offset-[12px]">Inventory Intelligence</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Critical Supply Level Monitoring & Lifecycle Management</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-14 px-6 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                            <FiAlertCircle size={20} />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest italic leading-none">Alert Items</p>
                            <p className="text-sm font-black text-gray-900 italic leading-none">{items.length} CRITICAL</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Low Stock Alert Grid */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto relative min-h-[400px]">
                {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center font-black uppercase text-gray-400 italic">Syncing Stock Manifest...</div>}
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="py-8 pl-10 pr-6 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Product Manifest</th>
                            <th className="py-8 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Status state</th>
                            <th className="py-8 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Current Level</th>
                            <th className="py-8 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Adjustment Hint</th>
                            <th className="py-8 px-10 text-right text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Lifecycle Ops</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {items.map((item) => (
                            <tr key={item.id} className="group hover:bg-gray-50/50 transition-all duration-300">
                                <td className="py-8 pl-10 pr-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-[1.25rem] overflow-hidden border border-gray-200 group-hover:scale-105 transition-transform flex items-center justify-center">
                                            {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <FiPackage className="text-gray-300" size={24} />}
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-black text-gray-900 italic uppercase leading-none">{item.name}</h4>
                                            <p className="text-[10px] font-black text-gray-400 uppercase italic tracking-tight">{item.category_name || 'Electronics'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-8 px-6">
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStockBadge(item.stock)} animate-pulse`}>
                                        {item.stock < 5 ? 'CRITICAL DEPLETION' : 'LOW INVENTORY'}
                                    </span>
                                </td>
                                <td className="py-8 px-6">
                                    {editingId === item.id ? (
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number"
                                                className="w-20 h-10 bg-gray-50 border border-orange-200 rounded-xl text-center text-xs font-black italic focus:ring-4 focus:ring-orange-50 transition-all"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                autoFocus
                                            />
                                            <button onClick={() => handleSave(item.id)} className="p-2 bg-gray-900 text-white rounded-xl hover:bg-black"><FiSave size={14} /></button>
                                            <button onClick={() => setEditingId(null)} className="p-2 bg-gray-100 text-gray-400 rounded-xl hover:text-red-500"><FiX size={14} /></button>
                                        </div>
                                    ) : (
                                        <div className="text-xl font-black italic text-gray-900 tracking-tighter cursor-pointer group-hover:text-orange-600 transition-colors" onClick={() => handleEditClick(item)}>
                                            {item.stock} <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 not-italic">Units</span>
                                        </div>
                                    )}
                                </td>
                                <td className="py-8 px-6">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase italic text-gray-400">
                                        <FiZap className="text-orange-400" /> SUGGESTED RESTOCK: <span className="text-gray-900">+15 UNITS</span>
                                    </div>
                                </td>
                                <td className="py-8 px-10 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openHistory(item.id)} className="p-3 bg-white border border-gray-100 rounded-xl text-gray-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase italic">
                                            <FiHistory /> Trace History
                                        </button>
                                        <button onClick={() => handleEditClick(item)} className="p-3 bg-white border border-gray-100 rounded-xl text-gray-600 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm">
                                            <FiEdit2 />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-20 text-center font-black uppercase italic text-gray-300 text-xs tracking-widest">System Healthy: No Critical Depletions Detected</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Stock History Sidebar/Modal */}
            {selectedHistoryId && (
                <div className="fixed inset-0 z-50 flex items-center justify-end p-6 bg-gray-900/40 backdrop-blur-md">
                    <div className="bg-white max-w-lg w-full h-[calc(100vh-3rem)] rounded-[3rem] p-10 shadow-2xl relative animate-in slide-in-from-right-8 duration-500 overflow-y-auto">
                        <button onClick={() => setSelectedHistoryId(null)} className="absolute top-10 right-10 p-3 bg-gray-50 text-gray-400 rounded-2xl hover:text-black transition-all">
                            <FiX size={24} />
                        </button>
                        
                        <div className="space-y-10">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Adjustment Timeline</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Chronological Inventory Movement Trace</p>
                            </div>

                            {historyLoading ? (
                                <div className="space-y-4 pt-10">
                                    {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-3xl" />)}
                                </div>
                            ) : (
                                <div className="space-y-6 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-50 pl-0">
                                    {history.map((log, i) => (
                                        <div key={log.id} className="relative pl-16 group">
                                            <div className="absolute left-0 top-1 w-12 h-12 rounded-2xl border-4 border-white bg-gray-900 text-white flex items-center justify-center font-black italic shadow-lg group-hover:scale-110 transition-transform">
                                                <FiBarChart2 size={18} />
                                            </div>
                                            <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 space-y-3 group-hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase text-gray-400 italic">{format(new Date(log.timestamp), 'dd MMM yyyy HH:mm')}</span>
                                                    <span className="px-3 py-1 bg-white rounded-lg text-[9px] font-black uppercase italic text-gray-900 shadow-sm">VERIFIED</span>
                                                </div>
                                                <div className="flex items-center gap-10">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] italic">From State</p>
                                                        <p className="text-lg font-black italic text-gray-400 line-through">{log.old_value || '0'}</p>
                                                    </div>
                                                    <FiChevronRight className="text-orange-500" />
                                                    <div className="space-y-0.5">
                                                        <p className="text-[8px] font-black text-orange-400 uppercase tracking-[0.2em] italic">Target State</p>
                                                        <p className="text-2xl font-black italic text-gray-900">{log.new_value}</p>
                                                    </div>
                                                </div>
                                                <div className="pt-2 flex items-center gap-2 text-[9px] font-black uppercase italic text-gray-400">
                                                    <FiArrowUpRight className="text-indigo-500" /> Adjusted by <span className="text-gray-900 underline decoration-indigo-200">{log.performed_by_name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {history.length === 0 && (
                                        <div className="pl-16 py-10 text-center font-black uppercase italic text-gray-300 text-[10px]">No historical tracing detected for this unit</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;
