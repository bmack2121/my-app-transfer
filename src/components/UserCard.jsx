import React from 'react';
import { hapticLight, hapticMedium } from "../utils/haptics";

const UserCard = ({ user, onRoleChange, onDelete }) => {
  const handleRoleUpdate = async (e) => {
    await hapticLight();
    onRoleChange(user._id, e.target.value);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${user.name} from the VinPro team?`
    );

    if (confirmed) {
      await hapticMedium();
      onDelete(user._id);
    }
  };

  // ✅ KPI Helpers
  const isAvailable = user.settings?.isAvailable ?? true;
  const progress = user.goalProgress || 0;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 relative overflow-hidden transition-all active:scale-[0.99]">

      {/* 1. Status & Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
            }`}
          />
          <div>
            <h4 className="font-black text-slate-900 text-lg leading-tight">
              {user.name}
            </h4>
            <p className="text-xs text-slate-400 font-bold tracking-tight">
              {user.email}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-3 py-1 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {user.role}
        </div>
      </div>

      {/* 2. Performance Metric */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Monthly Goal
          </p>
          <p className="text-xs font-black text-slate-700">{progress}%</p>
        </div>

        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* 3. Controls */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
        <div className="flex-1 relative">
          <label className="absolute -top-2 left-3 bg-white px-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">
            Change Role
          </label>

          <select
            value={user.role}
            onChange={handleRoleUpdate}
            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="sales">Sales</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          onClick={handleDelete}
          className="w-11 h-11 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl active:bg-rose-100 transition-colors"
          title="Remove User"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default UserCard;