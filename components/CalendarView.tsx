import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';

interface ScheduledTask {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type: 'cron' | 'reminder' | 'deadline' | 'meeting';
  status: 'pending' | 'completed' | 'overdue';
}

const INITIAL_TASKS: ScheduledTask[] = [
  {
    id: '1',
    title: 'Check Emirates tier miles',
    date: new Date(2026, 1, 19),
    time: '17:57',
    type: 'reminder',
    status: 'completed',
  },
  {
    id: '2',
    title: 'Voice AI Assessment Review',
    date: new Date(2026, 1, 20),
    type: 'deadline',
    status: 'pending',
  },
  {
    id: '3',
    title: 'Heartbeat Check - Telegram',
    date: new Date(2026, 1, 19),
    type: 'cron',
    status: 'pending',
  },
  {
    id: '4',
    title: 'Set up Voicebox on Mac Studio',
    date: new Date(2026, 1, 21),
    type: 'deadline',
    status: 'pending',
  },
  {
    id: '5',
    title: 'Record Kent\'s voice samples',
    date: new Date(2026, 1, 22),
    type: 'deadline',
    status: 'pending',
  },
];

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getTasksForDay = (date: Date) => {
    return INITIAL_TASKS.filter(task => 
      task.date.getDate() === date.getDate() &&
      task.date.getMonth() === date.getMonth() &&
      task.date.getFullYear() === date.getFullYear()
    );
  };

  const selectedTasks = selectedDate ? getTasksForDay(selectedDate) : [];

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Calendar</h2>
          <p className="text-gray-400">Scheduled tasks and reminders</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <h3 className="text-lg font-semibold text-white min-w-[150px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day) => {
          const dayTasks = getTasksForDay(day);
          const hasTasks = dayTasks.length > 0;
          const isSelected = selectedDate && day.getDate() === selectedDate.getDate();

          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`
                aspect-square p-2 rounded-lg border transition-all
                ${isToday(day) ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800'}
                ${isSelected ? 'ring-2 ring-blue-500' : ''}
                ${hasTasks ? 'hover:bg-gray-800' : 'hover:bg-gray-800/50'}
              `}
            >
              <span className={`text-sm ${isToday(day) ? 'text-blue-400 font-semibold' : 'text-gray-300'}`}>
                {format(day, 'd')}
              </span>
              {hasTasks && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {dayTasks.slice(0, 3).map((task, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'overdue' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-xs text-gray-500">+{dayTasks.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day tasks */}
      {selectedDate && (
        <div className="mt-6 bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {format(selectedDate, 'EEEE, MMMM do')}
          </h3>
          {selectedTasks.length === 0 ? (
            <p className="text-gray-500">No scheduled tasks for this day</p>
          ) : (
            <div className="space-y-3">
              {selectedTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TaskItem({ task }: { task: ScheduledTask }) {
  const typeIcons = {
    cron: Clock,
    reminder: CalendarIcon,
    deadline: AlertCircle,
    meeting: CheckCircle2,
  };

  const typeColors = {
    cron: 'text-blue-400 bg-blue-400/10',
    reminder: 'text-yellow-400 bg-yellow-400/10',
    deadline: 'text-red-400 bg-red-400/10',
    meeting: 'text-green-400 bg-green-400/10',
  };

  const statusColors = {
    pending: 'text-gray-400',
    completed: 'text-green-400',
    overdue: 'text-red-400',
  };

  const Icon = typeIcons[task.type];

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
      <div className={`p-2 rounded-lg ${typeColors[task.type]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-200">{task.title}</h4>
        <div className="flex items-center gap-3 mt-1">
          <span className={`text-xs ${statusColors[task.status]}`}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
          {task.time && (
            <span className="text-xs text-gray-500">
              {task.time}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
