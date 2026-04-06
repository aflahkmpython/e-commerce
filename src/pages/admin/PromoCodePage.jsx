import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPromoCodes, deletePromoCode, bulkDeactivatePromos, updatePromoCode } from '../../features/admin/promoSlice';
import { FiPlus, FiTrash2, FiActivity, FiTag, FiClock, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import moment from 'moment';
import PromoCodeFormModal from './components/PromoCodeFormModal';
import PromoUsageDrawer from './components/PromoUsageDrawer';

const UsageProgressBar = ({ used, limit }) => {
    if (!limit) return <span className="text-gray-400 font-mono text-xs">\u221e Unlimited</span>;
    
    const percentage = Math.min((used / limit) * 100, 100);
    const color = percentage < 50 ? 'bg-green-400' : percentage < 80 ? 'bg-amber-400' : 'bg-red-500';
    
    return (
        <div className="w-full">
            <div className="flex justify-between items-center text-[10px] font-black uppercase mb-1">
                <span className="text-gray-900">{used} USED</span>
                <span className="text-gray-400">{limit} LIMIT</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
};

const PromoCodePage = () => {
    const dispatch = useDispatch();
    const { list: promos, loading } = useSelector(state => state.promos);
    
    const [viewExpired, setViewExpired] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activePromo, setActivePromo] = useState(null);

    useEffect(() => {
        dispatch(fetchPromoCodes(viewExpired));
    }, [dispatch, viewExpired]);

    // Stats calculating
    const totalActive = promos.filter(p => p.is_active && new Date(p.expiry_date) > new Date()).length;
    const totalRedemptions = promos.reduce((sum, p) => sum + p.used_count, 0);

    const handleToggleStatus = async (promo, currentValue) => {
        try {
            await dispatch(updatePromoCode({ id: promo.id, data: { is_active: !currentValue } })).unwrap();
            toast.success(`Promo ${!currentValue ? 'Activated' : 'Deactivated'}`);
        } catch {
            toast.error('Glitched updating status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Annihilate this promo code?")) return;
        try {
            await dispatch(deletePromoCode(id)).unwrap();
            toast.success('Promo Eradicated');
        } catch {
            toast.error('Deletion Refused');
        }
    };

    const handleBulkDeactivate = async () => {
        if (!window.confirm("Deactivate all expired promos?")) return;
        try {
            const expiredIds = promos.filter(p => new Date(p.expiry_date) < new Date()).map(p => p.id);
             if (expiredIds.length === 0) return toast.info("No expired codes waiting to be deactivated.");
            await dispatch(bulkDeactivatePromos(expiredIds)).unwrap();
            toast.success('Expired campaigns purged');
        } catch {
            toast.error('Bulk deletion failed');
        }
    };

    const handleSavePromo = async (data) => {
        try {
            if (activePromo && activePromo.id) {
                await dispatch(updatePromoCode({ id: activePromo.id, data })).unwrap();
                toast.success('Promo Code Tuned');
            } else {
                await dispatch(createPromoCode(data)).unwrap();
                toast.success('Campaign Unleashed');
            }
            setModalOpen(false);
            setActivePromo(null);
            dispatch(fetchPromoCodes(viewExpired));
        } catch (err) {
            toast.error(err.code ? err.code[0] : 'Validation Rejected');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-widest text-gray-900 border-b-4 border-indigo-600 inline-block pr-6">Promotions</h1>
                    <p className="mt-2 text-gray-500 font-medium">Control discount engines and campaigns.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => handleBulkDeactivate()} className="h-12 px-6 bg-white border-2 border-gray-100 rounded-2xl font-black uppercase text-xs italic tracking-widest hover:border-gray-300 transition-all flex items-center gap-2">
                         <FiTrash2 /> Deactivate Expired
                    </button>
                    <button onClick={() => { setActivePromo(null); setModalOpen(true); }} className="h-12 px-8 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs italic tracking-widest hover:bg-indigo-700 hover:shadow-xl transition-all flex items-center gap-2">
                        <FiPlus /> New Campaign
                    </button>
                </div>
            </div>

            {/* Stats */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[ 
                    { title: 'Active Codes', val: totalActive, icon: FiActivity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { title: 'Total Redemptions', val: totalRedemptions, icon: FiCheck, color: 'text-green-600', bg: 'bg-green-50' },
                    { title: 'Legacy Campaigns', val: viewExpired ? promos.length : 0, icon: FiClock, color: 'text-orange-600', bg: 'bg-orange-50' }
                 ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-6">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                             <stat.icon size={24} />
                         </div>
                         <div>
                             <p className="text-[10px] font-black uppercase italic tracking-widest text-gray-400">{stat.title}</p>
                             <p className="text-3xl font-black italic text-gray-900 mt-1">{loading ? '-' : stat.val}</p>
                         </div>
                    </div>
                 ))}
             </div>

             {/* Main Table Container */}
             <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
                <div className="flex border-b border-gray-100">
                    <button onClick={() => setViewExpired(false)} className={`flex-1 flex justify-center items-center h-16 font-black uppercase italic text-xs tracking-widest transition-all ${!viewExpired ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'}`}>Active Promotions</button>
                    <button onClick={() => setViewExpired(true)} className={`flex-1 flex justify-center items-center h-16 font-black uppercase italic text-xs tracking-widest transition-all ${viewExpired ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'}`}>Expired Vault</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="py-4 px-6 text-[10px] font-black uppercase italic tracking-widest text-gray-400">Code</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase italic tracking-widest text-gray-400 min-w-[120px]">Value</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase italic tracking-widest text-gray-400 min-w-[200px]">Usage Metrics</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase italic tracking-widest text-gray-400">Duration</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase italic tracking-widest text-gray-400">Status</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase italic tracking-widest text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center text-gray-400 font-black italic">Loading Engines...</td>
                                </tr>
                            ) : promos.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300 mb-4">
                                            <FiTag size={24} />
                                        </div>
                                        <p className="font-bold text-gray-900">No campaigns found.</p>
                                    </td>
                                </tr>
                            ) : promos.map((promo) => (
                                <tr key={promo.id} className="border-b justify-center items-center border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                    <td className="py-5 px-6">
                                        <span className="inline-block px-3 py-1.5 bg-gray-900 text-white font-mono font-bold text-xs rounded-lg tracking-widest">{promo.code}</span>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="font-black italic text-gray-900">
                                            {promo.discount_type === 'percentage' ? `${promo.discount_value}% OFF` : `\u20b9${promo.discount_value} OFF`}
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">Min \u20b9{promo.min_order_value}</div>
                                    </td>
                                    <td className="py-5 px-6 w-[200px]">
                                        <UsageProgressBar used={promo.used_count} limit={promo.usage_limit} />
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="text-xs font-medium text-gray-600">{moment(promo.valid_from).format('MMM D')} \u2014</div>
                                        <div className="text-xs font-bold text-gray-900">{moment(promo.expiry_date).format('MMM D, YYYY')}</div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={promo.is_active} onChange={() => handleToggleStatus(promo, promo.is_active)} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                        </label>
                                    </td>
                                    <td className="py-5 px-6 pb-2 text-right">
                                         <div className="flex justify-end gap-2 pr-0 mr-0">
                                            <button onClick={() => { setActivePromo(promo); setDrawerOpen(true); }} className="w-20 pl-0 ml-0 bg-transparent text-gray-400 hover:text-indigo-600 transition-colors font-black uppercase text-[10px] mr-2">
                                                Log Book
                                            </button>
                                            <button onClick={() => handleDelete(promo.id)} className="p-2 ml-0 pl-1 text-gray-400 hover:text-red-600 transition-colors">
                                                <FiTrash2 size={16} />
                                            </button>
                                         </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>

             {modalOpen && (
                 <PromoCodeFormModal promo={activePromo} onClose={() => setModalOpen(false)} onSave={handleSavePromo} />
             )}
             
             <PromoUsageDrawer promo={activePromo} isOpen={drawerOpen} onClose={() => {setDrawerOpen(false); setActivePromo(null)}} />
        </div>
    );
};

export default PromoCodePage;
