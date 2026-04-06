import React from 'react';
import useCountUp from '../../../hooks/useCountUp';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { SkeletonLoader } from '../../../components/admin/SkeletonLoader';
import { formatPrice } from '../../../utils/format';

const MetricCard = ({ title, value, change, icon: Icon, color, loading, isCurrency = false }) => {
    const animatedValue = useCountUp(value);

    if (loading) return <SkeletonLoader className="h-32 rounded-xl" />;

    return (
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{title}</p>
                    <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">
                        {isCurrency ? formatPrice(animatedValue) : animatedValue.toLocaleString()}
                    </h3>
                    <div className={`flex items-center gap-1 text-[10px] font-bold ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        <div className={`flex items-center p-0.5 rounded-full ${change >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                            {change >= 0 ? <FiArrowUp size={10} /> : <FiArrowDown size={10} />}
                        </div>
                        <span>{Math.abs(change)}%</span>
                        <span className="text-zinc-300 font-medium">vs last month</span>
                    </div>
                </div>
                <div className={`p-3 rounded-lg bg-zinc-50 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300`}>
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
};

export default MetricCard;
