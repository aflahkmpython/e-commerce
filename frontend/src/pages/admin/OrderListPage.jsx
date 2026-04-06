import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    fetchAdminOrders, 
    setFilters, 
    exportOrdersCsv 
} from '../../features/admin/adminOrdersSlice';
import { 
    FiSearch, 
    FiFilter, 
    FiDownload, 
    FiChevronLeft, 
    FiChevronRight, 
    FiEye,
    FiCalendar,
    FiX
} from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

const STATUS_COLORS = {
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    confirmed: 'bg-blue-50 text-blue-600 border-blue-100',
    shipped: 'bg-purple-50 text-purple-600 border-purple-100',
    delivered: 'bg-green-50 text-green-600 border-green-100',
    cancelled: 'bg-red-50 text-red-600 border-red-100',
};

const PAYMENT_COLORS = {
    paid: 'bg-green-50 text-green-600',
    unpaid: 'bg-red-50 text-red-600',
    failed: 'bg-gray-50 text-gray-400',
    refunded: 'bg-blue-50 text-blue-400',
};

const OrderListPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { orders, totalCount, loading, filters } = useSelector(state => state.adminOrders);

    const [startDate, setStartDate] = useState(filters.created_at_after ? new Date(filters.created_at_after) : null);
    const [endDate, setEndDate] = useState(filters.created_at_before ? new Date(filters.created_at_before) : null);

    useEffect(() => {
        dispatch(fetchAdminOrders(filters));
    }, [dispatch, filters]);

    const handleFilterChange = (newFilters) => {
        dispatch(setFilters({ ...newFilters, page: 1 }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // search is handled by input onChange or a separate button. 
        // We'll do it on change with a small delay for better UX if needed, 
        // but for now let's just trigger on Enter or button click.
        dispatch(fetchAdminOrders(filters));
    };

    const handleExport = () => {
        dispatch(exportOrdersCsv(filters));
    };

    const totalPages = Math.ceil(totalCount / 20);

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 italic uppercase tracking-tighter">Order Management</h1>
                    <p className="text-gray-500 font-medium italic uppercase text-xs tracking-widest">Total Active Shipments: {totalCount}</p>
                </div>
                <button 
                    onClick={handleExport}
                    className="h-14 px-8 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-black transition-all shadow-xl shadow-gray-200"
                >
                    <FiDownload size={20} /> Export CSV
                </button>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="flex-grow max-w-md relative group">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <input 
                            type="text"
                            placeholder="ID, Email, or Name..."
                            className="w-full h-12 pl-12 pr-4 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-100 transition-all uppercase italic"
                            value={filters.search}
                            onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && dispatch(fetchAdminOrders(filters))}
                        />
                    </div>

                    {/* Status Filter */}
                    <select 
                        className="h-12 px-6 bg-gray-50 border-none rounded-xl text-xs font-black uppercase tracking-widest text-gray-600 focus:ring-4 focus:ring-blue-100 cursor-pointer italic"
                        value={filters.status}
                        onChange={(e) => handleFilterChange({ status: e.target.value })}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    {/* Payment Status */}
                    <select 
                        className="h-12 px-6 bg-gray-50 border-none rounded-xl text-xs font-black uppercase tracking-widest text-gray-600 focus:ring-4 focus:ring-blue-100 cursor-pointer italic"
                        value={filters.payment_status}
                        onChange={(e) => handleFilterChange({ payment_status: e.target.value })}
                    >
                        <option value="">All Payments</option>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                    </select>

                    {/* Date Pickers */}
                    <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
                        <div className="relative">
                            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => {
                                    setStartDate(date);
                                    handleFilterChange({ created_at_after: date ? format(date, 'yyyy-MM-dd') : '' });
                                }}
                                className="h-10 pl-10 pr-4 bg-transparent border-none text-[10px] font-black uppercase italic text-gray-600 w-32 focus:ring-0"
                                placeholderText="Start Date"
                            />
                        </div>
                        <span className="text-gray-300">/</span>
                        <div className="relative">
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => {
                                    setEndDate(date);
                                    handleFilterChange({ created_at_before: date ? format(date, 'yyyy-MM-dd') : '' });
                                }}
                                className="h-10 pl-4 pr-4 bg-transparent border-none text-[10px] font-black uppercase italic text-gray-600 w-32 focus:ring-0"
                                placeholderText="End Date"
                            />
                        </div>
                    </div>

                    {/* Reset button */}
                    <button 
                        onClick={() => {
                            setStartDate(null);
                            setEndDate(null);
                            dispatch(setFilters({ status: '', payment_status: '', search: '', created_at_after: '', created_at_before: '', page: 1 }));
                        }}
                        className="p-3 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic">Order ID</th>
                            <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic">Customer</th>
                            <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic text-center">Items</th>
                            <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic">Total</th>
                            <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic">Status</th>
                            <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic">Date</th>
                            <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="7" className="p-8 h-20 bg-gray-50/20"></td>
                                </tr>
                            ))
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-20 text-center text-gray-400 font-bold italic uppercase">No matching orders found</td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="py-6 px-8">
                                        <span className="font-black text-gray-900 uppercase italic">#ORD-{order.id.toString().padStart(4, '0')}</span>
                                    </td>
                                    <td className="py-6 px-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-gray-900 uppercase italic text-sm">{order.user_full_name}</span>
                                            <span className="text-[10px] text-gray-400 font-bold">{order.user_email}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4 text-center">
                                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-600">{order.item_count}</span>
                                    </td>
                                    <td className="py-6 px-4">
                                        <span className="font-black text-gray-900 italic">
                                            {Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(order.total_amount)}
                                        </span>
                                    </td>
                                    <td className="py-6 px-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_COLORS[order.status]}`}>
                                                {order.status}
                                            </span>
                                            <span className={`w-2 h-2 rounded-full ${PAYMENT_COLORS[order.payment_status] || 'bg-gray-200'}`}></span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4">
                                        <span className="text-[10px] font-black text-gray-400 uppercase italic">
                                            {format(new Date(order.created_at), 'dd MMM yyyy')}
                                        </span>
                                    </td>
                                    <td className="py-6 px-8 text-right">
                                        <button 
                                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                                            className="p-3 bg-white text-gray-900 rounded-xl shadow-sm border border-gray-100 hover:bg-gray-900 hover:text-white transition-all"
                                        >
                                            <FiEye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="bg-gray-50/50 p-8 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-[10px] font-black text-gray-400 uppercase italic">Showing {orders.length} of {totalCount} Orders</p>
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={filters.page === 1}
                            onClick={() => handleFilterChange({ page: filters.page - 1 })}
                            className="p-2 bg-white text-gray-400 rounded-lg shadow-sm border border-gray-100 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <FiChevronLeft size={20} />
                        </button>
                        {[...Array(totalPages)].map((_, i) => {
                            const p = i + 1;
                            if (p === 1 || p === totalPages || (p >= filters.page - 1 && p <= filters.page + 1)) {
                                return (
                                    <button 
                                        key={p}
                                        onClick={() => handleFilterChange({ page: p })}
                                        className={`w-10 h-10 rounded-lg font-black text-xs transition-all ${
                                            filters.page === p ? 'bg-gray-900 text-white shadow-xl' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                );
                            }
                            if (p === filters.page - 2 || p === filters.page + 2) return <span key={p} className="text-gray-300">...</span>;
                            return null;
                        })}
                        <button 
                            disabled={filters.page >= totalPages}
                            onClick={() => handleFilterChange({ page: filters.page + 1 })}
                            className="p-2 bg-white text-gray-400 rounded-lg shadow-sm border border-gray-100 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <FiChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderListPage;
export { STATUS_COLORS, PAYMENT_COLORS };
