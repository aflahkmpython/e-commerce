import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiCalendar, FiPackage, FiSettings, FiLogOut } from 'react-icons/fi';
import { logout } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Please log in to view your profile</h2>
                    <button 
                        onClick={() => navigate('/login')}
                        className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden"
                >
                    {/* Header/Cover */}
                    <div className="h-48 bg-gradient-to-r from-primary-600 to-indigo-600"></div>
                    
                    {/* Profile Info */}
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-16 mb-8">
                            <div className="w-32 h-32 bg-white rounded-3xl p-2 shadow-lg">
                                <div className="w-full h-full bg-primary-100 rounded-2xl flex items-center justify-center">
                                    <FiUser className="text-5xl text-primary-600" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button className="p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition">
                                    <FiSettings className="text-xl" />
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className="p-3 bg-red-100 text-red-600 rounded-2xl hover:bg-red-200 transition"
                                >
                                    <FiLogOut className="text-xl" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 capitalize">{user?.username}</h1>
                                <p className="text-gray-500 font-medium">Customer Account</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-gray-50 rounded-2xl flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        <FiMail className="text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                        <p className="text-gray-900 font-bold">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-2xl flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        <FiCalendar className="text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Member Since</p>
                                        <p className="text-gray-900 font-bold">April 2026</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { icon: FiPackage, label: 'Orders', to: '/orders' },
                                        { icon: FiUser, label: 'Details', to: '/profile' },
                                        { icon: FiSettings, label: 'Settings', to: '/profile' },
                                        { icon: FiLogOut, label: 'Logout', action: handleLogout },
                                    ].map((item, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => item.action ? item.action() : navigate(item.to)}
                                            className="flex flex-col items-center gap-3 p-6 bg-white border border-gray-100 rounded-2xl hover:border-primary-600 hover:shadow-lg hover:shadow-primary-600/10 transition-all group"
                                        >
                                            <item.icon className="text-2xl text-gray-400 group-hover:text-primary-600 transition-colors" />
                                            <span className="text-sm font-bold text-gray-600">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProfilePage;
