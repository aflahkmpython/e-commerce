import React from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, Legend
} from 'recharts';
import { SkeletonLoader } from '../../../components/admin/SkeletonLoader';
import { formatPrice } from '../../../utils/format';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100">
                <p className="text-xs font-black text-gray-400 mb-1">{new Date(label).toDateString()}</p>
                <p className="text-lg font-black text-gray-900 italic">{formatPrice(payload[0].value)}</p>
            </div>
        );
    }
    return null;
};

export const RevenueLineChart = ({ data, loading }) => {
    if (loading) return <SkeletonLoader className="h-80" />;

    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-96 group">
            <h3 className="text-xl font-black text-gray-900 italic mb-8 uppercase tracking-tighter">Revenue Overview</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                            tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const STATUS_COLORS = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#ef4444'
};

export const OrderStatusBarChart = ({ data, loading }) => {
    if (loading) return <SkeletonLoader className="h-80" />;

    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-96 group">
            <h3 className="text-xl font-black text-gray-900 italic mb-8 uppercase tracking-tighter">Order Breakdown</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8', textTransform: 'uppercase' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#cbd5e1'} />
                            ))}
                        </Bar>
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
