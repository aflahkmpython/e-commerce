import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchAdminUserDetail, 
    updateUserRole, 
    toggleUserActive,
    optimisticUpdateUser
} from '../../features/admin/adminUsersSlice';
import { 
    FiMail, FiPhone, FiCalendar, FiClock, FiShield, 
    FiMapPin, FiPackage, FiActivity, FiArrowLeft,
    FiCheckCircle, FiXCircle, FiLock, FiUnlock,
    FiChevronRight, FiCreditCard
} from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const UserDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentUser: user, detailLoading: loading, updateLoading } = useSelector(state => state.adminUsers);
    
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');

    useEffect(() => {
        dispatch(fetchAdminUserDetail(id));
    }, [dispatch, id]);

    if (loading) return <div className="p-20 text-center font-black uppercase italic text-gray-400 animate-pulse">Syncing User profile Registry...</div>;
    if (!user) return <div className="p-20 text-center font-black uppercase italic text-red-400 font-bold">Identity Not Found</div>;

    const handleRoleUpdate = async () => {
        if (confirmEmail !== user.email) {
            toast.error('Identity confirmation failed');
            return;
        }
        try {
            await dispatch(updateUserRole({ id: user.id, role: newRole })).unwrap();
            toast.success('Permission tier updated');
            setShowRoleModal(false);
            setConfirmEmail('');
        } catch (err) {
            toast.error(err.error || 'Update failed');
        }
    };

    const handleToggleStatus = async () => {
        const id = user.id;
        const previousStatus = user.is_active;
        
        // Optimistic
        dispatch(optimisticUpdateUser({ id, updates: { is_active: !previousStatus } }));
        
        try {
            await dispatch(toggleUserActive(id)).unwrap();
            toast.success(`Account ${!previousStatus ? 'restored' : 'suspended'}`);
            setShowDeactivateModal(false);
        } catch (err) {
            toast.error(err.error || 'Action failed');
            dispatch(optimisticUpdateUser({ id, updates: { is_active: previousStatus } }));
        }
    };

    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <div className="space-y-8 pb-20">
            {/* Header Navigation */}
            <div className="flex items-center justify-between">
                <Link to="/admin/users" className="flex items-center gap-2 text-gray-400 hover:text-black font-black uppercase italic text-xs transition-colors">
                    <FiArrowLeft /> Back to Directory
                </Link>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest italic">
                    Admin <FiChevronRight /> Users <FiChevronRight /> <span className="text-gray-900">ID-{user.id.toString().padStart(4, '0')}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Profile Overview Card */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-10">
                        <div className="text-center space-y-4">
                            <div className="w-24 h-24 bg-gray-900 text-white rounded-[2rem] flex items-center justify-center font-black text-3xl italic mx-auto shadow-xl shadow-gray-200">
                                {getInitials(user.full_name)}
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight">{user.full_name}</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">{user.role} Identity</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-[10px] font-black text-gray-400 uppercase italic">Status</span>
                                <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase italic ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                    {user.is_active ? <><FiUnlock /> Secure</> : <><FiLock /> Locked</>}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-[10px] font-black text-gray-400 uppercase italic">Lifetime Value</span>
                                <span className="text-xs font-black text-gray-900 italic">{Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(user.lifetime_spend)}</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-8 border-t border-gray-50">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
                                <FiMail className="text-blue-500" /> Contact Detail
                            </h3>
                            <div className="space-y-2">
                                <div className="text-xs font-black text-gray-700 italic flex items-center gap-3">
                                    <FiMail className="text-gray-300" /> {user.email}
                                </div>
                                <div className="text-xs font-black text-gray-700 italic flex items-center gap-3">
                                    <FiPhone className="text-gray-300" /> {user.phone_number || 'No contact voice entry'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-8 border-t border-gray-50">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
                                <FiCalendar className="text-purple-500" /> System Registry
                            </h3>
                            <div className="space-y-2 text-[10px] font-black">
                                <div className="flex justify-between uppercase italic">
                                    <span className="text-gray-400">Joined Date</span>
                                    <span className="text-gray-900">{format(new Date(user.date_joined), 'dd MMM yyyy')}</span>
                                </div>
                                <div className="flex justify-between uppercase italic">
                                    <span className="text-gray-400">Last Activity</span>
                                    <span className="text-gray-900">{user.last_login ? format(new Date(user.last_login), 'dd MMM yyyy HH:mm') : 'Never'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-6">
                            <button 
                                onClick={() => setShowRoleModal(true)}
                                className="w-full h-14 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                                <FiShield /> Modify Permission Tier
                            </button>
                            <button 
                                onClick={() => setShowDeactivateModal(true)}
                                className={`w-full h-14 border rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${user.is_active ? 'border-red-100 text-red-600 hover:bg-red-50' : 'border-green-100 text-green-600 hover:bg-green-50'}`}
                            >
                                {user.is_active ? <><FiUserX /> Terminate Access</> : <><FiUserCheck /> Restore Access</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Shipping Grid */}
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic flex items-center gap-2">
                                <FiMapPin className="text-red-500" /> Destination Registry
                            </h3>
                            <span className="px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-black uppercase italic text-gray-500">
                                {user.shipping_addresses?.length || 0} Saved Locations
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                            {user.shipping_addresses?.map((addr, i) => (
                                <div key={i} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4 hover:bg-gray-100/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-[10px] italic">#{i+1}</div>
                                        {addr.is_primary && (
                                            <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-[8px] font-black uppercase tracking-widest italic">Default</span>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-black text-gray-900 uppercase italic">{addr.full_name}</h4>
                                        <p className="text-[10px] font-black text-gray-400 italic">PH: {addr.phone_number}</p>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-600 uppercase italic leading-relaxed">
                                        {addr.address_line1}, {addr.address_line2 && <>{addr.address_line2}, </>}{addr.city}, {addr.state} - {addr.pincode}
                                    </p>
                                </div>
                            ))}
                            {user.shipping_addresses?.length === 0 && (
                                <div className="col-span-full py-10 text-center font-black uppercase text-gray-300 italic text-xs bg-gray-50/50 rounded-[2rem]">No address entries detected</div>
                            )}
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-10 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic flex items-center gap-2">
                                <FiPackage className="text-blue-500" /> Transactional Milestone History
                            </h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase italic">Latest 5 Entries</p>
                        </div>
                        <div className="overflow-x-auto text-left">
                            <table className="w-full">
                                <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase italic tracking-widest">
                                    <tr>
                                        <th className="py-6 px-10">Entry ID</th>
                                        <th className="py-6 px-6">Timestamp</th>
                                        <th className="py-6 px-6">Manifest</th>
                                        <th className="py-6 px-6">Valuation</th>
                                        <th className="py-6 px-10 text-right">State</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {user.recent_orders?.map((ord) => (
                                        <tr key={ord.id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="py-6 px-10 tabular-nums font-black text-xs">#{ord.id.toString().padStart(6, '0')}</td>
                                            <td className="py-6 px-6 text-[10px] uppercase font-black text-gray-400 italic">{format(new Date(ord.created_at), 'dd MMM yyyy')}</td>
                                            <td className="py-6 px-6 text-[10px] uppercase font-black text-gray-900 italic">{ord.item_count} Items</td>
                                            <td className="py-6 px-6 font-black text-xs italic">{Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(ord.total_amount)}</td>
                                            <td className="py-6 px-10 text-right">
                                                <Link to={`/admin/orders/${ord.id}`} className="group-hover:opacity-100 opacity-0 transition-opacity flex items-center justify-end gap-2 text-[10px] font-black uppercase text-blue-600 italic">
                                                    Inspect <FiChevronRight />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Operational Timeline */}
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic flex items-center gap-2">
                            <FiActivity className="text-orange-500" /> Administrative Action log
                        </h3>
                        <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-50 pl-2">
                            {user.activity_logs?.map((log, i) => (
                                <div key={log.id} className="relative pl-12">
                                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white bg-blue-50 text-blue-600 flex items-center justify-center font-black italic">
                                        <FiActivity size={12} />
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black uppercase italic text-gray-900">{log.action.replace('_', ' ')}</span>
                                            <span className="text-[8px] font-black text-gray-400 uppercase italic">By {log.performed_by_name} • {format(new Date(log.timestamp), 'dd MMM HH:mm')}</span>
                                        </div>
                                        <p className="text-[10px] font-medium text-gray-500 bg-gray-50 p-3 rounded-xl inline-block mt-1 italic tracking-tight">{log.notes}</p>
                                    </div>
                                </div>
                            ))}
                            {user.activity_logs?.length === 0 && (
                                <div className="pl-12 py-4">
                                    <p className="text-[10px] font-black uppercase text-gray-300 italic">No administrative actions logged</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Role Change Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md">
                    <div className="bg-white max-w-md w-full rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setShowRoleModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-black"><FiXCircle size={24} /></button>
                        <div className="space-y-6 text-center">
                            <FiShield size={48} className="mx-auto text-indigo-500" />
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase italic tracking-tight">Identity Elevation</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Modify permission tier for {user.full_name}</p>
                            </div>
                            
                            <div className="bg-gray-50 p-6 rounded-3xl space-y-1">
                                <p className="text-[8px] font-black text-gray-400 uppercase italic tracking-[0.2em]">Current Permission Hierarchy</p>
                                <p className="text-xs font-black text-indigo-600 uppercase italic">{user.role}</p>
                            </div>

                            <div className="space-y-4">
                                <select 
                                    className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-black uppercase italic text-gray-900 text-xs focus:ring-4 focus:ring-indigo-100"
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                >
                                    <option value="">SELECT TARGET TIER...</option>
                                    <option value="customer">CUSTOMER (STANDARD ACCESS)</option>
                                    <option value="admin">ADMINISTRATOR (CORE OPS)</option>
                                    <option value="superadmin">SUPERADMIN (SYSTEM ROOT)</option>
                                </select>

                                <div className="space-y-2 p-6 bg-amber-50 rounded-2xl text-[9px] font-black text-amber-700 uppercase italic leading-relaxed">
                                    WARNING: ELEVATING IDENTITY TO SUPERADMIN WILL GRANT FULL SYSTEM OVERRIDE CAPABILITIES. CONFIRM TARGET EMAIL TO AUTHORIZE.
                                </div>

                                <input 
                                    type="text" 
                                    placeholder="TYPE TARGET EMAIL TO CONFIRM..."
                                    className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-black uppercase italic text-gray-900 text-xs placeholder:text-gray-300"
                                    value={confirmEmail}
                                    onChange={(e) => setConfirmEmail(e.target.value)}
                                />
                            </div>

                            <button 
                                onClick={handleRoleUpdate}
                                disabled={!newRole || confirmEmail !== user.email || updateLoading}
                                className="w-full h-16 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl shadow-indigo-100 disabled:opacity-30"
                            >
                                {updateLoading ? 'ELEVATING...' : 'AUTHORIZE IDENTITY CHANGE'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Deactivation Modal */}
            {showDeactivateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md">
                    <div className="bg-white max-w-md w-full rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setShowDeactivateModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-black"><FiXCircle size={24} /></button>
                        <div className="space-y-6 text-center">
                            <FiLock size={48} className={`mx-auto ${user.is_active ? 'text-red-500' : 'text-green-500'}`} />
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase italic tracking-tight">{user.is_active ? 'ACCESS TERMINATION' : 'IDENTITY RESTORATION'}</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Modify System Access state for {user.full_name}</p>
                            </div>

                            <div className="p-6 rounded-2xl text-[9px] font-black uppercase italic leading-relaxed text-gray-500 bg-gray-50">
                                {user.is_active 
                                    ? "SUSPENDING THIS IDENTITY WILL PREVENT ALL AUTHENTICATION ATTEMPTS. THE USER WILL BE LOGGED OUT IMMEDIATELY ACROSS ALL SESSIONS."
                                    : "RESTORING THIS IDENTITY WILL ALLOW THE USER TO LOG BACK INTO THE STOREFRONT AND VIEW PREVIOUS ORDERS."}
                            </div>

                            <button 
                                onClick={handleToggleStatus}
                                className={`w-full h-16 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl ${user.is_active ? 'bg-red-600 shadow-red-100 hover:bg-red-700' : 'bg-green-600 shadow-green-100 hover:bg-green-700'}`}
                            >
                                {user.is_active ? 'CONFIRM LOCKDOWN' : 'CONFIRM RESTORATION'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetailPage;
