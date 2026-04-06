import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminUsers, setFilters, optimisticUpdateUser, toggleUserActive } from '../../features/admin/adminUsersSlice';
import { 
    FiSearch, FiFilter, FiMoreVertical, FiEye, 
    FiUserCheck, FiUserX, FiShield, FiDownload, 
    FiTrash2, FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
    customer: 'bg-blue-50 text-blue-600 border-blue-100',
    admin: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    superadmin: 'bg-purple-50 text-purple-600 border-purple-100'
};

const UserListPage = () => {
    const dispatch = useDispatch();
    const { users, count, loading, filters } = useSelector(state => state.adminUsers);
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        dispatch(fetchAdminUsers(filters));
    }, [dispatch, filters]);

    const handleSearch = (e) => {
        dispatch(setFilters({ search: e.target.value, page: 1 }));
    };

    const handleFilterChange = (key, value) => {
        dispatch(setFilters({ [key]: value, page: 1 }));
    };

    const handleToggleSelectAll = () => {
        if (selectedUsers.length === users.length) setSelectedUsers([]);
        else setSelectedUsers(users.map(u => u.id));
    };

    const handleSelectUser = (id) => {
        if (selectedUsers.includes(id)) setSelectedUsers(selectedUsers.filter(sid => sid !== id));
        else setSelectedUsers([...selectedUsers, id]);
    };

    const handleToggleStatus = async (user) => {
        const id = user.id;
        const previousStatus = user.is_active;
        
        // Optimistic UI
        dispatch(optimisticUpdateUser({ id, updates: { is_active: !previousStatus } }));
        
        try {
            await dispatch(toggleUserActive(id)).unwrap();
            toast.success(`User ${!previousStatus ? 'activated' : 'deactivated'}`);
        } catch (err) {
            toast.error(err.error || 'Action failed');
            dispatch(optimisticUpdateUser({ id, updates: { is_active: previousStatus } }));
        }
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic underline decoration-blue-500/30 decoration-8 underline-offset-[12px]">Directory Registry</h1>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] italic">Identity & Permission Management Panel</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-14 px-8 bg-gray-50 text-gray-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all border border-gray-100 flex items-center gap-2">
                        <FiDownload /> Data Export
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-wrap items-center gap-6">
                <div className="flex-grow min-w-[300px] relative">
                    <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="SEARCH BY IDENTITY (NAME, EMAIL, VOICE)..."
                        className="w-full h-16 bg-gray-50 border-none rounded-[1.5rem] pl-16 pr-6 text-xs font-black uppercase italic text-gray-900 focus:ring-4 focus:ring-blue-100 transition-all tracking-wider"
                        value={filters.search}
                        onChange={handleSearch}
                    />
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-gray-50 rounded-2xl px-4 border border-gray-100">
                        <FiFilter className="text-gray-400" />
                        <select 
                            className="h-12 bg-transparent border-none text-[10px] font-black uppercase italic text-gray-600 focus:ring-0 pr-10"
                            value={filters.role}
                            onChange={(e) => handleFilterChange('role', e.target.value)}
                        >
                            <option value="">ALL PERMISSION TIERS</option>
                            <option value="superadmin">SUPERADMIN</option>
                            <option value="admin">ADMINISTRATOR</option>
                            <option value="customer">CUSTOMER</option>
                        </select>
                    </div>

                    <div className="flex items-center bg-gray-50 rounded-2xl px-4 border border-gray-100">
                        <select 
                            className="h-12 bg-transparent border-none text-[10px] font-black uppercase italic text-gray-600 focus:ring-0 pr-10"
                            value={filters.is_active}
                            onChange={(e) => handleFilterChange('is_active', e.target.value)}
                        >
                            <option value="">ALL STATUSES</option>
                            <option value="true">ACTIVE ONLY</option>
                            <option value="false">DEACTIVATED</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Bulk Actions View */}
            {selectedUsers.length > 0 && (
                <div className="bg-blue-600 p-6 rounded-3xl flex items-center justify-between text-white animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black italic">{selectedUsers.length}</div>
                        <p className="text-xs font-black uppercase tracking-widest italic">User Identities Selected</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase italic transition-all flex items-center gap-2">
                            <FiTrash2 /> Deactivate Selected
                        </button>
                        <button className="px-6 py-3 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase italic transition-all flex items-center gap-2">
                            <FiDownload /> Export Selection
                        </button>
                    </div>
                </div>
            )}

            {/* Table Construction */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto relative">
                {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center font-black uppercase text-gray-400 italic">Syncing Registry...</div>}
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="py-8 pl-10 pr-6 w-10">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded-lg border-gray-200 text-blue-600 focus:ring-blue-500"
                                    checked={users.length > 0 && selectedUsers.length === users.length}
                                    onChange={handleToggleSelectAll}
                                />
                            </th>
                            <th className="py-8 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">User Identification</th>
                            <th className="py-8 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Permission Tier</th>
                            <th className="py-8 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">System Status</th>
                            <th className="py-8 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Registry Metrics</th>
                            <th className="py-8 px-10 text-right text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map((user) => (
                            <tr key={user.id} className="group hover:bg-gray-50/50 transition-all duration-300">
                                <td className="py-8 pl-10 pr-6">
                                    <input 
                                        type="checkbox" 
                                        className="w-5 h-5 rounded-lg border-gray-200 text-blue-600 focus:ring-blue-500"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => handleSelectUser(user.id)}
                                    />
                                </td>
                                <td className="py-8 px-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gray-100 rounded-[1.25rem] flex items-center justify-center font-black text-gray-400 text-sm italic border border-gray-200 group-hover:scale-105 transition-transform">
                                            {getInitials(user.full_name)}
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-black text-gray-900 italic uppercase leading-none">{user.full_name}</h4>
                                            <p className="text-[10px] font-black text-gray-400 uppercase italic opacity-60 tracking-tight">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-8 px-6">
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${ROLE_COLORS[user.role]}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="py-8 px-6">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500 ring-4 ring-green-50' : 'bg-red-500 ring-4 ring-red-50'}`}></div>
                                        <span className={`text-[10px] font-black uppercase italic ${user.is_active ? 'text-green-700' : 'text-red-700'}`}>
                                            {user.is_active ? 'SYSTEM ACTIVE' : 'LOCKED ACCOUNT'}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-8 px-6">
                                    <div className="space-y-1 text-[10px] font-black italic">
                                        <div className="flex items-center gap-2 text-gray-900">
                                            <span className="text-gray-400 uppercase tracking-widest text-[8px]">Purchase history:</span> {user.total_orders} ORDERS
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <span className="uppercase tracking-widest text-[8px]">Registry Date:</span> {format(new Date(user.date_joined), 'dd MMM yyyy')}
                                        </div>
                                    </div>
                                </td>
                                <td className="py-8 px-10 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link to={`/admin/users/${user.id}`} className="p-3 bg-white border border-gray-100 rounded-xl text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                                            <FiEye size={18} />
                                        </Link>
                                        <button 
                                            onClick={() => handleToggleStatus(user)}
                                            className={`p-3 bg-white border border-gray-100 rounded-xl transition-all shadow-sm ${user.is_active ? 'text-red-600 hover:border-red-200' : 'text-green-600 hover:border-green-200'}`}
                                        >
                                            {user.is_active ? <FiUserX size={18} /> : <FiUserCheck size={18} />}
                                        </button>
                                        <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                                            <FiShield size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Layer */}
            <div className="flex items-center justify-between px-10 pb-10">
                <p className="text-[10px] font-black text-gray-400 uppercase italic">Displaying {users.length} of {count} Register Entries</p>
                <div className="flex items-center gap-4">
                    <button 
                        disabled={filters.page === 1}
                        onClick={() => handleFilterChange('page', filters.page - 1)}
                        className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 disabled:opacity-20 transition-all shadow-sm"
                    >
                        <FiChevronLeft />
                    </button>
                    <span className="text-[10px] font-black italic">PAGE {filters.page}</span>
                    <button 
                        disabled={users.length >= count}
                        onClick={() => handleFilterChange('page', filters.page + 1)}
                        className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 disabled:opacity-20 transition-all shadow-sm"
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserListPage;
