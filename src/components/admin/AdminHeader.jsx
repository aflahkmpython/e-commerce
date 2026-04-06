import React from 'react';
import { Search, Bell, User, LogOut } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const AdminHeader = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-40 backdrop-blur-md bg-white/80">
      <div className="flex items-center space-x-4 bg-zinc-50 px-4 py-2 rounded-lg border border-zinc-200 w-96 transition-all focus-within:ring-2 focus-within:ring-zinc-100 focus-within:border-zinc-300">
        <Search size={16} className="text-zinc-400" />
        <input 
          type="text" 
          placeholder="Quick search..." 
          className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-zinc-400 text-zinc-900"
        />
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-colors">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-indigo-600 rounded-full border border-white"></span>
        </button>

        <div className="flex items-center space-x-4 pl-4 border-l border-zinc-100">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-zinc-900 leading-tight">{user?.first_name} {user?.last_name || 'Admin'}</p>
            <p className="text-[10px] text-zinc-400 uppercase tracking-tight">{user?.role || 'Administrator'}</p>
          </div>
          <div className="relative group">
            <button className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.first_name?.[0] || 'A'}
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-zinc-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1.5">
              <button className="w-full text-left px-4 py-2 text-xs text-zinc-600 hover:bg-zinc-50 flex items-center space-x-3">
                <User size={14} />
                <span>My Profile</span>
              </button>
              <div className="my-1 border-t border-zinc-100"></div>
              <button className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-3">
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
