import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingCart, 
  Users, 
  Image as ImageIcon, 
  Ticket, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

const AdminSidebar = ({ isCollapsed, toggleSidebar }) => {
  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { title: 'Products', icon: Package, path: '/admin/products' },
    { title: 'Categories', icon: Layers, path: '/admin/categories' },
    { title: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
    { title: 'Users', icon: Users, path: '/admin/users' },
    { title: 'Banners', icon: ImageIcon, path: '/admin/banners' },
    { title: 'Promos', icon: Ticket, path: '/admin/promos' },
    { title: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="h-screen bg-white border-r border-zinc-200 text-zinc-900 flex flex-col sticky top-0 left-0 z-50 transition-all duration-300 ease-in-out overflow-hidden"
    >
      <div className="p-6 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
              </div>
              <h1 className="text-lg font-bold tracking-tight">
                Console
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400 hover:text-zinc-900"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-grow mt-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-zinc-100 text-zinc-900 font-semibold' 
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`
                }
              >
                <item.icon 
                  size={20} 
                  className={`transition-colors ${isCollapsed ? 'mx-auto' : 'mr-3'} ${
                    isCollapsed ? '' : ''
                  }`} 
                />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm"
                  >
                    {item.title}
                  </motion.span>
                )}
                {/* Visual indicator for active link */}
                <NavLink 
                  to={item.path} 
                  end={item.path === '/admin'}
                  className={({ isActive }) => 
                    `absolute left-0 w-1 h-6 bg-zinc-900 rounded-r-full transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`
                  } 
                />
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
        {!isCollapsed && (
          <div className="flex items-center space-x-3 p-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 text-xs font-bold border border-zinc-300">
              A
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-zinc-900 truncate">System Admin</p>
              <p className="text-[10px] text-zinc-400 truncate">Master Account</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminSidebar;
