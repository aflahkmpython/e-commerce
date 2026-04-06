import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { motion } from 'framer-motion';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex bg-zinc-50/50 min-h-screen font-sans antialiased text-zinc-900">
      <AdminSidebar 
        isCollapsed={isCollapsed} 
        toggleSidebar={() => setIsCollapsed(!isCollapsed)} 
      />
      <div className="flex-grow flex flex-col min-w-0 transition-all duration-300">
        <AdminHeader />
        <motion.main 
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="p-6 lg:p-10 flex-grow"
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </motion.main>
        <footer className="py-8 px-10 text-center text-xs text-zinc-400 bg-white/50 border-t border-zinc-100">
          <p>&copy; 2026 Admin Dashboard &bull; Minimal Edition</p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
