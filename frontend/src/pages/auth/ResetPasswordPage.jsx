import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock } from 'react-icons/fi';

const ResetPasswordPage = () => {
    const { uidb64, token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus({ type: 'error', message: 'Passwords do not match.' });
            return;
        }
        setLoading(true);
        try {
            await axiosInstance.post(`accounts/password-reset-confirm/${uidb64}/${token}/`, { password });
            setStatus({ type: 'success', message: 'Password reset successful. Redirecting to login...' });
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setStatus({ type: 'error', message: 'Invalid or expired reset link.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg"
            >
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Set a New Password
                </h2>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {status.message && (
                        <div className={`p-3 rounded-md text-sm text-center ${status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                            {status.message}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div className="relative">
                            <FiLock className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="password"
                                required
                                className="appearance-none block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="password"
                                required
                                className="appearance-none block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
