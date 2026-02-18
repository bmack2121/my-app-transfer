import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';

const TaskList = ({ tasks, onToggle, onDelete, onEdit }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-40">
        <div className="text-4xl mb-2">📋</div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Clean Slate: No Pending Tasks
        </p>
      </div>
    );
  }

  // ✅ Auto-Sorting: Urgent first, then by Date
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.priority === 'Urgent' && b.priority !== 'Urgent') return -1;
    if (a.priority !== 'Urgent' && b.priority === 'Urgent') return 1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  return (
    <div className="space-y-6">
      {/* 🚀 Priority Section Header (Only if urgent tasks exist) */}
      {sortedTasks.some(t => t.priority === 'Urgent' && t.status !== 'Completed') && (
        <div className="flex items-center gap-2 px-1">
          <span className="w-2 h-2 rounded-full bg-performance animate-ping" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-performance">
            High Priority Actions
          </h3>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence mode='popLayout'>
          {sortedTasks.map((task) => (
            <motion.div
              key={task._id}
              layout
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <TaskCard
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskList;