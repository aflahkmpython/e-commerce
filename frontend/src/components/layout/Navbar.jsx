import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { FiShoppingCart, FiUser, FiLogOut, FiShoppingBag, FiHeart } from 'react-icons/fi';

const Navbar = () => {
    const dispatch = useDispatch();
    const { items } = useSelector((state) => state.cart);
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <nav className="bg-white border-b sticky top-0 z-50 glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-primary-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary-500/20">
                                <FiShoppingBag className="text-white text-xl" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-gray-900">
                                ECO<span className="text-primary-600">STORE</span>
                            </span>
                        </Link>
                        
                        <div className="hidden md:flex items-center gap-6">
                            <Link to="/" className="text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors uppercase tracking-widest">Shop</Link>
                            {isAuthenticated && (
                                <Link to="/orders" className="text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors uppercase tracking-widest">My Orders</Link>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/wishlist" className="p-3 hover:bg-gray-50 rounded-2xl transition-colors group">
                            <FiHeart className="text-2xl text-gray-600 group-hover:text-red-500 transition-colors" />
                        </Link>

                        <Link 
                            to="/cart"
                            className="relative p-3 hover:bg-gray-50 rounded-2xl transition-colors group"
                        >
                            <FiShoppingCart className="text-2xl text-gray-600 group-hover:text-primary-600 transition-colors" />
                            {cartCount > 0 && (
                                <span className="absolute top-2 right-2 bg-primary-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm ring-2 ring-primary-100">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden sm:block"></div>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <Link to="/profile" className="flex items-center gap-2 group p-1 pr-3 hover:bg-gray-50 rounded-2xl transition-colors">
                                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                                        <FiUser className="text-primary-600 text-lg" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 hidden sm:block capitalize">{user?.username}</span>
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className="p-3 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all"
                                    title="Logout"
                                >
                                    <FiLogOut className="text-xl" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link 
                                    to="/login" 
                                    className="text-sm font-bold text-gray-600 hover:text-primary-600 px-4 py-2 transition-colors uppercase tracking-widest"
                                >
                                    Sign In
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="bg-gray-900 hover:bg-black text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5 uppercase tracking-widest"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
