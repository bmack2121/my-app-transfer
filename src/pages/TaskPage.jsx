import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "../api/axiosClient";
import CalendarView from "./CalendarView";
import NotificationsPanel from "./NotificationsPanel";

// Safe haptics wrapper
import {
  hapticWarning,
  hapticSuccess,
  hapticHeavy
} from "../utils/haptics";

const categories = ["Sales", "Inventory", "Finance", "Admin", "Follow-up"];
const priorities = ["Low", "Medium", "High", "Urgent"];

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);

  const [form, setForm] = useState({
    text: "",
    category: "Sales",
    priority: "Medium",
    dueDate: "",
    notes: ""
  });

  const [filters, setFilters] = useState({
    category: "All",
    priority: "All",
    status: "All",
    search: ""
  });

  // Load tasks
  const loadTasks = useCallback(async () => {
    try {
      const res = await axiosClient.get("/tasks");
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Task load error:", err);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Add task
  const handleAddTask = async () => {
    if (!form.text.trim() || !form.dueDate) {
      await hapticWarning();
      return;
    }

    try {
      const res = await axiosClient.post("/tasks", {
        ...form,
        subtasks: [],
        status: "Pending"
      });

      setTasks(prev => [res.data, ...prev]);

      setForm({
        text: "",
        category: "Sales",
        priority: "Medium",
        dueDate: "",
        notes: ""
      });

      await hapticSuccess();
    } catch (err) {
      console.error("Create task error:", err);
    }
  };

  // Update task
  const updateTask = async (id, updates) => {
    try {
      const res = await axiosClient.put(`/tasks/${id}`, updates);

      setTasks(prev =>
        prev.map(t => (t._id === id ? res.data : t))
      );

      if (updates.status === "Completed") {
        await hapticSuccess();
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  // Filter logic
  const filteredTasks = tasks.filter(t => {
    const matchesCat =
      filters.category === "All" || t.category === filters.category;

    const matchesPri =
      filters.priority === "All" || t.priority === filters.priority;

    const matchesStat =
      filters.status === "All" ||
      (filters.status === "Completed" && t.status === "Completed") ||
      (filters.status === "Active" && t.status !== "Completed");

    const matchesSearch = t.text
      .toLowerCase()
      .includes(filters.search.toLowerCase());

    return matchesCat && matchesPri && matchesStat && matchesSearch;
  });

  // XP / Focus Score
  const completedCount = tasks.filter(t => t.status === "Completed").length;
  const focusScore =
    tasks.length > 0
      ? Math.round((completedCount / tasks.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-app-bg text-white p-6 pb-20 space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-app-accent">
            VinPro Sync
          </p>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            Inventory Actions
          </h1>
        </div>

        <NotificationsPanel tasks={tasks} onUpdateTask={updateTask} />
      </header>

      {/* Analytics */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-app-surface border border-app-border rounded-vin p-4 shadow-pro overflow-hidden">
          <CalendarView tasks={tasks} />
        </div>

        <div className="bg-pro-metal border border-white/5 rounded-vin p-8 flex flex-col justify-center shadow-glow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-black uppercase italic">
            XP
          </div>

          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-2">
            Dealership Focus
          </h3>

          <p className="text-6xl font-black tracking-tighter">{focusScore}%</p>

          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
            Efficiency Rating
          </p>

          <div className="w-full bg-white/10 h-1.5 mt-6 rounded-full overflow-hidden">
            <div
              className="bg-app-accent h-full transition-all duration-1000 ease-out"
              style={{ width: `${focusScore}%` }}
            />
          </div>
        </div>
      </section>

      {/* Search + Filters */}
      <div className="space-y-4">
        <div className="bg-app-surface p-4 rounded-xl2 border border-app-border flex flex-col md:flex-row gap-4 shadow-card">
          <input
            placeholder="Search lot actions..."
            className="flex-1 bg-app-bg border border-app-border rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-app-accent transition-all"
            onChange={e =>
              setFilters({ ...filters, search: e.target.value })
            }
          />

          <select
            className="bg-app-bg border border-app-border rounded-xl p-3 text-[10px] font-black uppercase outline-none"
            onChange={e =>
              setFilters({ ...filters, category: e.target.value })
            }
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            className="bg-app-bg border border-app-border rounded-xl p-3 text-[10px] font-black uppercase outline-none"
            onChange={e =>
              setFilters({ ...filters, priority: e.target.value })
            }
          >
            <option value="All">All Priorities</option>
            {priorities.map(p => (
              <option key={p}>{p}</option>
            ))}
          </select>

          <select
            className="bg-app-bg border border-app-border rounded-xl p-3 text-[10px] font-black uppercase outline-none"
            onChange={e =>
              setFilters({ ...filters, status: e.target.value })
            }
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Quick Add */}
        <div className="bg-app-surface p-6 rounded-vin border border-app-border shadow-pro relative group">
          <div className="absolute -top-3 left-6 bg-app-accent px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest">
            Quick Log
          </div>

          <input
            value={form.text}
            onChange={e => setForm({ ...form, text: e.target.value })}
            placeholder="Assign new vehicle action..."
            className="w-full bg-app-bg border border-app-border p-4 rounded-xl text-lg font-black placeholder:text-slate-700 outline-none mb-4 focus:border-app-accent transition-colors"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <select
              value={form.category}
              onChange={e =>
                setForm({ ...form, category: e.target.value })
              }
              className="bg-app-bg border border-app-border p-3 rounded-xl text-xs font-bold uppercase color-scheme-dark"
            >
              {categories.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <select
              value={form.priority}
              onChange={e =>
                setForm({ ...form, priority: e.target.value })
              }
              className="bg-app-bg border border-app-border p-3 rounded-xl text-xs font-bold uppercase color-scheme-dark"
            >
              {priorities.map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>

            <input
              type="date"
              value={form.dueDate}
              onChange={e =>
                setForm({ ...form, dueDate: e.target.value })
              }
              className="bg-app-bg border border-app-border p-3 rounded-xl text-xs font-bold uppercase color-scheme-dark col-span-2 md:col-span-2"
            />
          </div>

          <button
            onClick={handleAddTask}
            className="w-full py-5 bg-app-accent rounded-xl font-black uppercase tracking-widest shadow-glow active:scale-95 transition-all hover:bg-performance duration-300"
          >
            Sync Action to Lot
          </button>
        </div>
      </div>

      {/* Live Feed */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-20 bg-app-surface/30 rounded-vin border border-dashed border-app-border">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
              No Pending Actions Detected
            </p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task._id}
              className={`group bg-app-surface p-6 rounded-xl2 border border-app-border flex items-center justify-between transition-all duration-300 ${
                task.status === "Completed"
                  ? "opacity-30 grayscale"
                  : "hover:border-app-accent shadow-card"
              }`}
            >
              <div className="flex items-center gap-6">
                <input
                  type="checkbox"
                  checked={task.status === "Completed"}
                  onChange={() =>
                    updateTask(task._id, {
                      status:
                        task.status === "Completed"
                          ? "Pending"
                          : "Completed"
                    })
                  }
                  className="w-6 h-6 rounded-lg bg-app-bg border-app-border accent-app-accent cursor-pointer"
                />

                <div>
                  <h4
                    className={`text-lg font-black uppercase tracking-tighter ${
                      task.status === "Completed" ? "line-through" : ""
                    }`}
                  >
                    {task.text}
                  </h4>

                  <div className="flex gap-4 mt-1 items-center">
                    <span
                      className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                        task.priority === "Urgent"
                          ? "bg-performance text-white animate-pulse"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {task.priority}
                    </span>

                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      {task.category}
                    </span>

                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest opacity-60">
                      |
                    </span>

                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={async () => {
                  await hapticHeavy();
                  updateTask(task._id, { status: "Cancelled" });
                }}
                className="opacity-0 group-hover:opacity-100 p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
              >
                <span className="text-[10px] font-black uppercase">
                  Dismiss
                </span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskPage;