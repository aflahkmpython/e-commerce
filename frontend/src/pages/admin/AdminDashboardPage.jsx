import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchDashboardStats, 
    fetchDailyRevenue, 
    fetchTopProducts, 
    fetchRecentOrders 
} from '../../features/admin/dashboardSlice';
import { 
    FiCreditCard, 
    FiShoppingCart, 
    FiUsers, 
    FiPackage, 
    FiRefreshCcw
} from 'react-icons/fi';
import MetricCard from './components/MetricCard';
import { RevenueLineChart, OrderStatusBarChart } from './components/Charts';
import { TopProductsTable, RecentOrdersTable } from './components/Tables';
import { DashboardSkeleton } from '../../components/admin/SkeletonLoader';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
    const dispatch = useDispatch();
    const { stats, dailyRevenue, topProducts, recentOrders } = useSelector((state) => state.dashboard);
    const [dateRange, setDateRange] = useState(30);

    const loadAllData = () => {
        Promise.all([
            dispatch(fetchDashboardStats()),
            dispatch(fetchDailyRevenue(dateRange)),
            dispatch(fetchTopProducts()),
            dispatch(fetchRecentOrders())
        ]).catch(() => {
            toast.error('Some dashboard components failed to load');
        });
    };

    useEffect(() => {
        loadAllData();
    }, [dispatch, dateRange]);

    useEffect(() => {
        const interval = setInterval(() => {
            dispatch(fetchDashboardStats());
            dispatch(fetchRecentOrders()); 
        }, 60000);

        return () => clearInterval(interval);
    }, [dispatch]);

    const handleRetry = (thunk, arg = null) => {
        dispatch(arg ? thunk(arg) : thunk());
    };

    const isInitialLoading = stats.loading && !stats.data;

    if (isInitialLoading) return <DashboardSkeleton />;

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Overview</h1>
                    <p className="text-sm text-zinc-500 font-medium">Monitoring business performance and real-time activity.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-zinc-200 rounded-lg p-1 shadow-sm">
                        {[7, 30, 90, 365].map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                                    dateRange === range 
                                    ? 'bg-zinc-900 text-white shadow-sm' 
                                    : 'text-zinc-400 hover:text-zinc-600'
                                }`}
                            >
                                {range === 365 ? '1Y' : `${range}D`}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={loadAllData}
                        className="p-2.5 bg-white border border-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 transition-all shadow-sm active:scale-95"
                        title="Refresh data"
                    >
                        <FiRefreshCcw size={16} />
                    </button>
                </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.error ? (
                    <div className="col-span-full bg-rose-50 p-6 rounded-xl border border-rose-100 flex items-center justify-between">
                        <p className="text-rose-700 text-sm font-semibold">Failed to load statistics</p>
                        <button onClick={() => handleRetry(fetchDashboardStats)} className="text-rose-700 text-xs underline font-bold">Retry</button>
                    </div>
                ) : (
                    <>
                        <MetricCard 
                            title="Total Revenue" 
                            value={stats.data?.revenue?.value || 0} 
                            change={stats.data?.revenue?.change || 0} 
                            icon={FiCreditCard} 
                            color="indigo" 
                            loading={stats.loading}
                            isCurrency={true}
                        />
                        <MetricCard 
                            title="Total Orders" 
                            value={stats.data?.orders?.value || 0} 
                            change={stats.data?.orders?.change || 0} 
                            icon={FiShoppingCart} 
                            color="indigo" 
                            loading={stats.loading}
                        />
                        <MetricCard 
                            title="New Customers" 
                            value={stats.data?.users?.value || 0} 
                            change={stats.data?.users?.change || 0} 
                            icon={FiUsers} 
                            color="indigo" 
                            loading={stats.loading}
                        />
                        <MetricCard 
                            title="Active Products" 
                            value={stats.data?.products?.value || 0} 
                            change={0} 
                            icon={FiPackage} 
                            color="indigo" 
                            loading={stats.loading}
                        />
                    </>
                )}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-2 rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                    {dailyRevenue.error ? (
                        <div className="bg-rose-50 p-6 rounded-lg border border-rose-100 flex flex-col items-center justify-center h-[400px] gap-4">
                            <p className="text-rose-700 text-sm font-semibold text-center">Failed to load revenue data</p>
                            <button onClick={() => handleRetry(fetchDailyRevenue, dateRange)} className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-200 transition-colors">Retry Load</button>
                        </div>
                    ) : (
                        <RevenueLineChart data={dailyRevenue.data} loading={dailyRevenue.loading} />
                    )}
                </div>

                <div className="bg-white p-2 rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                    <OrderStatusBarChart 
                        data={stats.data?.status_breakdown || []} 
                        loading={stats.loading} 
                    />
                </div>
            </div>

            {/* Bottom Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="min-h-[450px]">
                    {topProducts.error ? (
                        <div className="bg-rose-50 p-6 rounded-xl border border-rose-100 flex flex-col items-center justify-center h-full gap-4">
                            <p className="text-rose-700 text-sm font-semibold">Failed to load best sellers</p>
                            <button onClick={() => handleRetry(fetchTopProducts)} className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-200 transition-colors">Retry</button>
                        </div>
                    ) : (
                        <TopProductsTable data={topProducts.data} loading={topProducts.loading} />
                    )}
                </div>

                <div className="min-h-[450px]">
                    {recentOrders.error ? (
                        <div className="bg-rose-50 p-6 rounded-xl border border-rose-100 flex flex-col items-center justify-center h-full gap-4">
                            <p className="text-rose-700 text-sm font-semibold">Failed to load recent activity</p>
                            <button onClick={() => handleRetry(fetchRecentOrders)} className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-200 transition-colors">Retry</button>
                        </div>
                    ) : (
                        <RecentOrdersTable data={recentOrders.data} loading={recentOrders.loading} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
