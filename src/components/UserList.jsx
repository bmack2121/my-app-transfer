import React from 'react';
import UserCard from './UserCard';

const UserList = ({ users, onRoleChange, onDelete, loading }) => {
  // 1. Loading State (Skeleton placeholder)
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-slate-100 rounded-[2rem]" />
        ))}
      </div>
    );
  }

  // 2. Empty State
  if (!users.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
        <span className="text-5xl mb-4">👥</span>
        <h3 className="text-xl font-black text-slate-900">The floor is empty</h3>
        <p className="text-slate-500 font-medium">Add your first salesperson to get started.</p>
      </div>
    );
  }

  // 3. KPI Logic (Calculates team stats for the header)
  const activeStaff = users.filter(u => u.settings?.isAvailable).length;

  return (
    <div className="space-y-8">
      {/* Team Meta Header */}
      <div className="flex items-center justify-between px-4">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Composition</p>
          <p className="text-sm font-bold text-slate-700">
            {users.length} Total • <span className="text-emerald-600">{activeStaff} On Floor</span>
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <span className="text-xs font-black">{users.length}</span>
        </div>
      </div>

      

      {/* Grid of User Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user._id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <UserCard 
              user={user} 
              onRoleChange={onRoleChange} 
              onDelete={onDelete} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;