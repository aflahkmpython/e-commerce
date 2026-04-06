import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SkeletonLoader } from '../../../components/admin/SkeletonLoader';
import { formatPrice } from '../../../utils/format';

export const TopProductsTable = ({ data, loading }) => {
    if (loading) return <SkeletonLoader className="h-96 rounded-xl" />;

    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Best Selling Products</h3>
                <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Top 5</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-zinc-50/50 text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Rank</th>
                            <th className="px-6 py-3">Product</th>
                            <th className="px-6 py-3">Sales</th>
                            <th className="px-6 py-3 text-right">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-sm">
                        {data.map((product, index) => (
                            <tr key={product.product__id} className="hover:bg-zinc-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <span className="text-zinc-400 font-medium tabular-nums">{index + 1}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg border border-zinc-200 bg-white overflow-hidden flex-shrink-0 p-1">
                                            <img src={product.image} className="w-full h-full object-contain" alt="" />
                                        </div>
                                        <span className="font-semibold text-zinc-900 truncate max-w-[150px]">{product.product__name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-zinc-600 tabular-nums">{product.units_sold} units</td>
                                <td className="px-6 py-4 font-bold text-zinc-900 text-right tabular-nums">{formatPrice(product.revenue)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const STATUS_CLASSES = {
    pending: 'bg-amber-50 text-amber-700 border-amber-100',
    confirmed: 'bg-sky-50 text-sky-700 border-sky-100',
    shipped: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-100'
};

export const RecentOrdersTable = ({ data, loading }) => {
    const navigate = useNavigate();

    if (loading) return <SkeletonLoader className="h-96 rounded-xl" />;

    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Recent Orders</h3>
                <button 
                    onClick={() => navigate('/admin/orders')} 
                    className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-colors"
                >
                    View All
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-zinc-50/50 text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Order ID</th>
                            <th className="px-6 py-3">Customer</th>
                            <th className="px-6 py-3">Total</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-sm">
                        {data.map((order) => (
                            <tr 
                                key={order.id} 
                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                                className="hover:bg-zinc-50/50 transition-colors cursor-pointer group"
                            >
                                <td className="px-6 py-4 font-bold text-zinc-900 tabular-nums">#{order.id}</td>
                                <td className="px-6 py-4 font-medium text-zinc-500">{order.user_email}</td>
                                <td className="px-6 py-4 font-bold text-zinc-900 tabular-nums">{formatPrice(order.total_amount)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_CLASSES[order.status] || 'bg-zinc-100 text-zinc-600 border-zinc-200'} capitalize`}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
