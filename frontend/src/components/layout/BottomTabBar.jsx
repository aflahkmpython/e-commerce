import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiSearch, FiShoppingCart, FiHeart, FiUser } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { buttonPulse } from '../../constants/animations';

const BottomTabBar = () => {
  const { items } = useSelector((state) => state.cart);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { to: '/', icon: FiHome, label: 'Home' },
    { to: '/search', icon: FiSearch, label: 'Search' },
    { to: '/cart', icon: FiShoppingCart, label: 'Cart', badge: itemCount },
    { to: '/wishlist', icon: FiHeart, label: 'Wishlist' },
    { to: '/profile', icon: FiUser, label: 'Profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-lg border-t border-gray-100 px-2 pb-safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              relative flex flex-col items-center justify-center w-full h-full
              ${isActive ? 'text-primary-600' : 'text-gray-400'}
            `}
          >
            {({ isActive }) => (
              <motion.div
                variants={buttonPulse}
                whileTap="whileTap"
                className="flex flex-col items-center"
              >
                <div className="relative">
                  <item.icon className="text-xl" />
                  {item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-brand-accent text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavDot"
                    className="absolute -bottom-1 w-1 h-1 bg-primary-600 rounded-full"
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomTabBar;
