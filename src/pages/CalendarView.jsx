import React, { useState } from "react";

const CalendarView = ({ tasks }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getUrgencyColor = (date) => {
    const now = new Date();
    const due = new Date(date);
    const diff = (due - now) / (1000 * 60 * 60 * 24);

    if (diff < 0) return "bg-app.danger";
    if (diff <= 1) return "bg-app.danger";
    if (diff <= 3) return "bg-app.warning";
    return "bg-app.success";
  };

  const tasksByDate = (date) => tasks.filter((t) => t.dueDate === date);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="bg-app.surface text-calendar-text dark:bg-app.surface dark:text-calendar-text p-6 rounded-card shadow-card">
      <h2 className="font-heading text-2xl text-white mb-4">Calendar</h2>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="font-heading text-gray-500 dark:text-gray-400">
            {d}
          </div>
        ))}

        {days.map((day, idx) => {
          if (!day) return <div key={idx} className="h-16"></div>;

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayTasks = tasksByDate(dateStr);
          const isToday = dateStr === today.toISOString().split("T")[0];

          return (
            <div
              key={idx}
              onClick={() => setSelectedDate(dateStr)}
              className={`h-16 border border-app.border rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors
                ${isToday ? "bg-calendar-today text-white" : "hover:bg-app.surfaceSoft"}
              `}
            >
              <span className="font-heading">{day}</span>

              {/* Task dots */}
              <div className="flex space-x-1 mt-1">
                {dayTasks.slice(0, 3).map((t) => (
                  <span
                    key={t.id}
                    className={`w-2 h-2 rounded-full ${getUrgencyColor(t.dueDate)}`}
                  ></span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Tasks */}
      {selectedDate && (
        <div className="mt-6">
          <h3 className="font-heading text-xl text-white mb-2">
            Tasks for {selectedDate}
          </h3>

          {tasksByDate(selectedDate).length === 0 ? (
            <p className="text-gray-400">No tasks due.</p>
          ) : (
            tasksByDate(selectedDate).map((t) => (
              <div key={t.id} className="border-b border-app.border py-2">
                <span className="font-heading text-white">{t.text}</span>
                <div className="text-sm text-gray-400">
                  {t.category} • {t.priority}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarView;