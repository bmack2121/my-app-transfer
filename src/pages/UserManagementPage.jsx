import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { 
  hapticLight,
  hapticMedium,
  hapticSuccess,
  hapticError
} from "../utils/haptics";

import { FaShieldAlt, FaUserEdit, FaTrashAlt, FaSpinner } from "react-icons/fa";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosClient.get("/users");
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Master Access Denied:", err);
        await hapticError();
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    await hapticMedium();

    if (newRole === "admin" && !window.confirm("Grant FULL SYSTEM access to this user?")) {
      return;
    }

    setUpdating(userId);

    try {
      const res = await axiosClient.put(`/users/${userId}/role`, { role: newRole });

      setUsers(prev =>
        prev.map(u => (u._id === userId ? { ...u, role: res.data.role } : u))
      );

      await hapticSuccess();

    } catch (err) {
      console.error("Role update failed:", err);
      await hapticError();
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-6 bg-app-bg min-h-screen text-white">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-app-accent uppercase tracking-[0.3em]">
            Master Control
          </p>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            User Management
          </h1>
        </div>

        <div className="bg-app-surface px-4 py-2 rounded-lg border border-app-border flex items-center gap-2 shadow-glow">
          <FaShieldAlt className="text-app-success text-xs" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Admin Encrypted
          </span>
        </div>
      </header>

      <div className="bg-app-surface rounded-vin border border-app-border overflow-hidden shadow-pro transition-all">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-app-bg/50 border-b border-app-border">
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Employee
              </th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Access Level
              </th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Last Login
              </th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-app-border/30">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-20 text-center">
                  <FaSpinner className="animate-spin inline-block text-app-accent text-2xl" />
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-pro-metal flex items-center justify-center font-black text-xs shadow-inner">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-tight">{user.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold font-mono">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="relative inline-block">
                      <select
                        disabled={updating === user._id}
                        value={user.role}
                        onChange={e => handleRoleChange(user._id, e.target.value)}
                        className={`appearance-none bg-app-bg border border-app-border rounded-lg px-3 py-1.5 text-[10px] font-black uppercase outline-none transition-all ${
                          user.role === "admin"
                            ? "text-performance border-performance/50"
                            : "text-app-accent"
                        } disabled:opacity-50`}
                      >
                        <option value="sales">Sales Associate</option>
                        <option value="manager">Desk Manager</option>
                        <option value="admin">System Admin</option>
                      </select>

                      {updating === user._id && (
                        <FaSpinner className="animate-spin absolute right-[-20px] top-1/2 -translate-y-1/2 text-xs text-app-accent" />
                      )}
                    </div>
                  </td>

                  <td className="p-4 text-xs font-mono text-slate-400 font-bold">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : "Never"}
                  </td>

                  <td className="p-4 text-right space-x-4">
                    <button className="text-slate-500 hover:text-white transition-colors text-sm">
                      <FaUserEdit />
                    </button>
                    <button className="text-slate-500 hover:text-performance transition-colors text-sm">
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;