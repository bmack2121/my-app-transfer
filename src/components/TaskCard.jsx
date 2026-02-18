import React, { useState } from 'react';
import { 
  hapticNotification, 
  hapticMedium 
} from "../utils/haptics";

const TaskCard = ({ task, onToggle, onDelete, onEdit }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    text: task.text,
    dueDate: task.dueDate
      ? new Date(task.dueDate).toISOString().slice(0, 10)
      : ''
  });

  const isCompleted = task.status === 'Completed';

  const handleToggle = async () => {
    await hapticNotification(isCompleted ? "warning" : "success");
    onToggle(task._id);
  };

  const handleSave = async () => {
    await hapticMedium();
    await onEdit(task._id, form);
    setEditing(false);
  };

  return (
    <div
      className={`group relative p-5 rounded-xl2 border transition-all duration-300 ${
        isCompleted
          ? 'bg-app-bg opacity-50 border-transparent'
          : 'bg-app-surface border-app-border shadow-card hover:border-app-accent'
      }`}
    >
      {editing ? (
        <div className="space-y-3">
          <input
            name="text"
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            className="w-full bg-app-bg border border-app-border p-2 rounded-lg text-sm font-bold text-white outline-none focus:ring-1 focus:ring-app-accent"
          />
          <input
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="w-full bg-app-bg border border-app-border p-2 rounded-lg text-sm font-bold text-white color-scheme-dark"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-app-accent py-2 rounded-lg text-[10px] font-black uppercase"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 bg-slate-800 py-2 rounded-lg text-[10px] font-black uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              {/* Custom Styled Checkbox */}
              <button
                onClick={handleToggle}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-app-success border-app-success'
                    : 'border-app-border hover:border-app-accent'
                }`}
              >
                {isCompleted && <span className="text-white text-xs">✓</span>}
              </button>

              <div>
                <h4
                  className={`text-sm font-black uppercase tracking-tight transition-all ${
                    isCompleted
                      ? 'line-through text-slate-500'
                      : 'text-white'
                  }`}
                >
                  {task.text}
                </h4>

                <div className="flex gap-3 mt-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    Due: {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : 'NO DATE'}
                  </span>

                  {task.priority === 'Urgent' && !isCompleted && (
                    <span className="text-[8px] font-black text-performance animate-pulse uppercase">
                      Urgent
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Hover Actions */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-app-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditing(true)}
              className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest"
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(task._id)}
              className="text-[10px] font-black text-rose-500/70 hover:text-rose-500 uppercase tracking-widest"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskCard;