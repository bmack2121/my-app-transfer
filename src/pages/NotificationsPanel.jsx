import React from "react";
import {
  FaPhone,
  FaCar,
  FaCheck,
  FaExclamationTriangle
} from "react-icons/fa";

// ✅ Safe haptics wrapper
import { hapticMedium } from "../utils/haptics";

const NotificationsPanel = ({ tasks, onUpdateTask }) => {
  // -------------------------------
  // ⭐ Task Grouping Logic
  // -------------------------------
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const overdue = tasks.filter(
    (t) => t.status !== "Completed" && t.dueDate < today
  );

  const urgent = tasks.filter(
    (t) => t.status !== "Completed" && t.dueDate === today
  );

  const upcoming = tasks.filter(
    (t) => t.status !== "Completed" && t.dueDate > today
  );

  return (
    <div className="bg-app-surface border border-app-border rounded-vin p-6 shadow-pro space-y-6">
      <header className="flex items-center justify-between border-b border-app-border pb-4">
        <div className="flex items-center gap-3">
          <FaExclamationTriangle className="text-performance text-xl" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
            Lot Alerts
          </h2>
        </div>
      </header>

      <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
        {/* Overdue */}
        {overdue.map((t) => (
          <NotificationItem
            key={t._id}
            task={t}
            accent="border-l-performance"
            onUpdate={onUpdateTask}
          />
        ))}

        {/* Urgent (Due Today) */}
        {urgent.map((t) => (
          <NotificationItem
            key={t._id}
            task={t}
            accent="border-l-warning"
            onUpdate={onUpdateTask}
          />
        ))}

        {/* Upcoming */}
        {upcoming.map((t) => (
          <NotificationItem
            key={t._id}
            task={t}
            accent="border-l-blue-400"
            onUpdate={onUpdateTask}
          />
        ))}
      </div>
    </div>
  );
};

const NotificationItem = ({ task, accent, onUpdate }) => {
  const handleAction = async (type) => {
    await hapticMedium(); // 🔵 Safe haptic

    if (type === "complete") {
      onUpdate(task._id, { status: "Completed" });
    }
  };

  return (
    <div
      className={`bg-app-bg border border-app-border ${accent} border-l-4 p-4 rounded-xl transition-all hover:border-app-accent group`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs font-black text-white uppercase tracking-tight">
              {task.text}
            </p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              {task.customer
                ? `${task.customer.firstName} ${task.customer.lastName}`
                : "General Task"}
            </p>
          </div>

          <span className="text-[9px] font-mono text-slate-600 font-bold">
            {new Date(task.dueDate).toLocaleDateString([], {
              month: "short",
              day: "numeric"
            })}
          </span>
        </div>

        {/* 🚀 Quick Action Bar */}
        <div className="flex gap-2 pt-2 border-t border-white/5">
          {task.customer?.phone && (
            <a
              href={`tel:${task.customer.phone}`}
              onClick={() => handleAction("call")}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-app-surface border border-app-border rounded-lg text-[9px] font-black uppercase text-slate-400 hover:text-app-success hover:border-app-success transition-all"
            >
              <FaPhone className="text-[8px]" /> Call
            </a>
          )}

          {task.vehicle && (
            <button
              onClick={() => handleAction("inventory")}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-app-surface border border-app-border rounded-lg text-[9px] font-black uppercase text-slate-400 hover:text-blue-400 hover:border-blue-400 transition-all"
            >
              <FaCar className="text-[8px]" /> Unit
            </button>
          )}

          <button
            onClick={() => handleAction("complete")}
            className="px-4 py-2 bg-app-surface border border-app-border rounded-lg text-slate-400 hover:text-app-success hover:border-app-success transition-all"
          >
            <FaCheck className="text-[8px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;