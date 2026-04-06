import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../features/auth/authSlice';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiShield, FiLock, FiMail } from 'react-icons/fi';

const AdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, role } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(login({ email, password }));
        if (login.fulfilled.match(result)) {
            // Check if the user is actually an admin
            if (result.payload.role === 'admin' || result.payload.role === 'superadmin') {
                navigate('/admin/dashboard');
            } else {
                // If not an admin, logout and show error
                // In a real app we'd handle this better
                alert('Access denied. Admin privileges required.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full space-y-8 bg-gray-900 p-10 rounded-2xl shadow-2xl border border-gray-800"
            >
                <div>
                    <div className="flex justify-center mb-4">
                        <div className="bg-primary-600 p-4 rounded-full shadow-lg shadow-primary-500/20">
                            <FiShield className="text-white text-3xl" />
                        </div>
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
                        Admin Control Center
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Secure authorization required for nexus access
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-900/30 border border-red-800 text-red-400 p-3 rounded-md text-sm text-center">
                            Authentication Failed: Nexus access denied.
                        </div>
                    )}
                    <div className="rounded-md space-y-4">
                        <div className="relative">
                            <FiMail className="absolute left-3 top-3.5 text-gray-500" />
                            <input
                                type="email"
                                required
                                className="appearance-none block w-full px-12 py-3.5 bg-gray-800 border border-gray-700 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all sm:text-sm"
                                placeholder="Admin Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-3.5 text-gray-500" />
                            <input
                                type="password"
                                required
                                className="appearance-none block w-full px-12 py-3.5 bg-gray-800 border border-gray-700 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all sm:text-sm"
                                placeholder="Access Key"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-primary-500 transition-all transform active:scale-95"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Authorizing...
                                </span>
                            ) : 'Authorize Access'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminLoginPage;
