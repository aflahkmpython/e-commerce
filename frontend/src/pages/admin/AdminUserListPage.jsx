import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  UserPlus, 
  ShieldCheck, 
  UserMinus, 
  Mail, 
  Calendar, 
  MoreVertical,
  User as UserIcon,
  ShieldAlert,
  Settings
} from 'lucide-react';

const AdminUserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users/');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this user? They will no longer be able to log in.')) {
      try {
        await axios.patch(`/api/admin/users/${id}/deactivate/`);
        fetchUsers();
      } catch (err) {
        alert('Failed to deactivate user');
      }
    }
  };

  const handleChangeRole = async (id, newRole) => {
    try {
      await axios.patch(`/api/admin/users/${id}/change_role/`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert('Failed to change role');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">Manage customer accounts and administrative roles.</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all flex items-center shadow-lg shadow-blue-500/20">
          <UserPlus size={20} className="mr-2" />
          <span>Invite Admin</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-medium">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-20 text-center text-gray-400">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-20 text-center text-gray-400">No users found.</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm ${
                        user.role === 'customer' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600 border border-purple-100'
                      }`}>
                        {user.first_name?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <Mail size={12} />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       {user.role === 'superadmin' ? (
                         <span className="flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold uppercase tracking-wide">
                            <ShieldAlert size={14} />
                            Superadmin
                         </span>
                       ) : user.role === 'admin' ? (
                         <span className="flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold uppercase tracking-wide">
                            <ShieldCheck size={14} />
                            Admin
                         </span>
                       ) : (
                         <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                            Customer
                         </span>
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {user.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="relative group/actions">
                        <button className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-lg transition-all">
                          <MoreVertical size={18} />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover/actions:opacity-100 group-hover/actions:visible transition-all duration-200 z-[70] py-2">
                           <button 
                             onClick={() => handleChangeRole(user.id, 'admin')}
                             className="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wide hover:bg-gray-50 flex items-center gap-2"
                           >
                             <ShieldCheck size={14} className="text-purple-600" />
                             Promote to Admin
                           </button>
                           <button 
                             onClick={() => handleChangeRole(user.id, 'customer')}
                             className="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wide hover:bg-gray-50 flex items-center gap-2"
                           >
                             <UserIcon size={14} className="text-blue-500" />
                             Set as Customer
                           </button>
                           {user.is_active && (
                             <button 
                               onClick={() => handleDeactivate(user.id)}
                               className="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wide hover:bg-red-50 text-red-600 flex items-center gap-2 border-t border-gray-50 mt-1"
                             >
                               <UserMinus size={14} />
                               Deactivate
                             </button>
                           )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUserListPage;
