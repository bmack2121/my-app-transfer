import React, { useState } from 'react';
import { Haptics, NotificationType } from '@capacitor/haptics';

const TaskForm = ({ onAdd }) => {
  const [form, setForm] = useState({
    text: '', // Changed 'title' to 'text' to match your Schema
    dueDate: '',
    priority: 'Medium', // Matched Schema capitalization
    category: 'Follow-up' // Default category
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Physical feedback for lot-speed usage
    await Haptics.notification({ type: NotificationType.Success });
    
    onAdd(form);
    
    // Reset to professional defaults
    setForm({ 
      text: '', 
      dueDate: '', 
      priority: 'Medium', 
      category: 'Follow-up' 
    });
  };

  const priorityLevels = ['Low', 'Medium', 'High', 'Urgent'];

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-app-surface p-6 rounded-vin border border-app-border shadow-pro mb-8 space-y-5"
    >
      <div className="flex flex-col md:flex-row gap-4">
        {/* Task Title */}
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Action Item
          </label>
          <input 
            name="text" 
            placeholder="e.g., Call about the Silver Silverado appraisal" 
            value={form.text} 
            onChange={handleChange} 
            required 
            className="w-full bg-app-bg border border-app-border p-4 rounded-xl text-sm font-bold text-white focus:ring-2 focus:ring-app-accent outline-none transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Due Date */}
        <div className="md:w-52 space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Deadline
          </label>
          <input 
            name="dueDate" 
            type="date" 
            value={form.dueDate} 
            onChange={handleChange} 
            required
            className="w-full bg-app-bg border border-app-border p-4 rounded-xl text-sm font-bold text-white focus:ring-2 focus:ring-app-accent outline-none color-scheme-dark"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Priority Selector */}
        <div className="flex gap-1.5 p-1 bg-app-bg rounded-xl border border-app-border">
          {priorityLevels.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setForm({ ...form, priority: p })}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${
                form.priority === p 
                  ? p === 'Urgent' 
                    ? 'bg-performance text-white shadow-[0_0_12px_rgba(255,59,48,0.4)]' 
                    : 'bg-app-accent text-white shadow-glow' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button 
          type="submit" 
          className="w-full sm:w-auto bg-pro-metal px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-card active:scale-95 transition-all border border-white/5"
        >
          Assign to Lot
        </button>
      </div>
    </form>
  );
};

export default TaskForm;