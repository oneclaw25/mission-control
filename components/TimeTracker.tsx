// components/TimeTracker.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Play, Pause, Square, Plus, Trash2, Edit3, Check, X,
  Clock, Calendar, Tag, DollarSign, ChevronDown, Filter,
  Download, FileText
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, subDays } from 'date-fns';
import { TimeEntry } from '../types';
import { saveTimeEntries, loadActiveTimer, saveActiveTimer } from '../lib/storage';

interface TimeTrackerProps {
  entries: TimeEntry[];
  onEntriesChange: (entries: TimeEntry[]) => void;
  projects: { id: string; name: string }[];
}

export default function TimeTracker({ entries, onEntriesChange, projects }: TimeTrackerProps) {
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<'week' | 'month' | 'all'>('week');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editEntry, setEditEntry] = useState<Partial<TimeEntry>>({});

  // Load active timer on mount
  useEffect(() => {
    const saved = loadActiveTimer();
    if (saved && !saved.endTime) {
      setActiveTimer(saved);
    }
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer && !activeTimer.endTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(activeTimer.startTime).getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const startTimer = (projectId: string, description: string, billable: boolean = true) => {
    const project = projects.find(p => p.id === projectId);
    const newEntry: TimeEntry = {
      id: `te-${Date.now()}`,
      projectId,
      projectName: project?.name || 'Unknown',
      description,
      startTime: new Date(),
      duration: 0,
      billable,
      hourlyRate: 150,
      userId: 'user-1',
      userName: 'OneClaw',
      tags: [],
    };
    
    setActiveTimer(newEntry);
    saveActiveTimer(newEntry);
    setElapsedTime(0);
  };

  const stopTimer = () => {
    if (activeTimer) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - new Date(activeTimer.startTime).getTime()) / 60000);
      
      const completedEntry: TimeEntry = {
        ...activeTimer,
        endTime,
        duration,
      };
      
      const updatedEntries = [...entries, completedEntry];
      onEntriesChange(updatedEntries);
      saveTimeEntries(updatedEntries);
      
      setActiveTimer(null);
      saveActiveTimer(null);
      setElapsedTime(0);
    }
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    onEntriesChange(updated);
    saveTimeEntries(updated);
  };

  const updateEntry = (id: string, updates: Partial<TimeEntry>) => {
    const updated = entries.map(e => 
      e.id === id ? { ...e, ...updates } : e
    );
    onEntriesChange(updated);
    saveTimeEntries(updated);
    setIsEditing(null);
  };

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesProject = filterProject === 'all' || entry.projectId === filterProject;
    
    let matchesDate = true;
    if (filterDateRange === 'week') {
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());
      matchesDate = new Date(entry.startTime) >= weekStart && new Date(entry.startTime) <= weekEnd;
    } else if (filterDateRange === 'month') {
      const now = new Date();
      matchesDate = new Date(entry.startTime).getMonth() === now.getMonth() 
        && new Date(entry.startTime).getFullYear() === now.getFullYear();
    }
    
    return matchesProject && matchesDate;
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  // Calculate totals
  const totalHours = filteredEntries.reduce((sum, e) => sum + (e.duration / 60), 0);
  const billableHours = filteredEntries.filter(e => e.billable).reduce((sum, e) => sum + (e.duration / 60), 0);
  const totalRevenue = filteredEntries.filter(e => e.billable).reduce((sum, e) => 
    sum + ((e.duration / 60) * (e.hourlyRate || 0)), 0
  );

  // Weekly view data
  const weekDays = eachDayOfInterval({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date())
  });

  const getHoursForDay = (day: Date) => {
    return entries
      .filter(e => isSameDay(new Date(e.startTime), day))
      .reduce((sum, e) => sum + (e.duration / 60), 0);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Active Timer Widget */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              {activeTimer ? 'Timer Running' : 'Start Tracking'}
            </h3>
            <p className="text-gray-400">
              {activeTimer 
                ? `${activeTimer.projectName} - ${activeTimer.description}` 
                : 'Select a project and start tracking time'}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            {activeTimer && (
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-white">
                  {formatDuration(elapsedTime)}
                </div>
                <p className="text-sm text-gray-400">Current session</p>
              </div>
            )}
            
            {activeTimer ? (
              <button
                onClick={stopTimer}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors"
              >
                <Square className="w-5 h-5 fill-current" />
                Stop
              </button>
            ) : (
              <TimerStarter projects={projects} onStart={startTimer} />
            )}
          </div>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">This Week</h3>
        <div className="flex items-end justify-between gap-4">
          {weekDays.map((day) => {
            const hours = getHoursForDay(day);
            const maxHours = 8;
            const height = Math.min((hours / maxHours) * 100, 100);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div key={day.toISOString()} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full h-32 bg-gray-800 rounded-lg overflow-hidden">
                  <div 
                    className={`absolute bottom-0 w-full transition-all ${
                      isToday ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-medium ${isToday ? 'text-blue-400' : 'text-gray-400'}`}>
                    {format(day, 'EEE')}
                  </p>
                  <p className="text-xs text-gray-500">{hours.toFixed(1)}h</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-sm text-gray-400 mb-1">Total Hours</p>
          <p className="text-2xl font-bold text-white">{totalHours.toFixed(1)}h</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-sm text-gray-400 mb-1">Billable Hours</p>
          <p className="text-2xl font-bold text-green-400">{billableHours.toFixed(1)}h</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-sm text-gray-400 mb-1">Utilization</p>
          <p className="text-2xl font-bold text-blue-400">
            {totalHours > 0 ? ((billableHours / totalHours) * 100).toFixed(0) : 0}%
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-sm text-gray-400 mb-1">Revenue</p>
          <p className="text-2xl font-bold text-purple-400">${totalRevenue.toFixed(0)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="all">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        
        <div className="flex items-center bg-gray-800 rounded-lg p-1">
          {(['week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setFilterDateRange(range)}
              className={`px-3 py-1 rounded text-sm capitalize transition-colors ${
                filterDateRange === range ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            const csv = [
              ['Date', 'Project', 'Description', 'Duration', 'Billable', 'Rate', 'Amount'].join(','),
              ...filteredEntries.map(e => [
                format(new Date(e.startTime), 'yyyy-MM-dd'),
                e.projectName,
                `"${e.description}"`,
                (e.duration / 60).toFixed(2),
                e.billable ? 'Yes' : 'No',
                e.hourlyRate,
                e.billable ? ((e.duration / 60) * (e.hourlyRate || 0)).toFixed(2) : 0
              ].join(','))
            ].join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `time-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
            a.click();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors ml-auto"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Time Entries Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase bg-gray-800/50">
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Project</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3 text-right">Duration</th>
              <th className="px-6 py-3 text-center">Billable</th>
              <th className="px-6 py-3 text-right">Amount</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-800/50">
                {isEditing === entry.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="date"
                        value={format(new Date(entry.startTime), 'yyyy-MM-dd')}
                        onChange={(e) => setEditEntry({ ...editEntry, startTime: new Date(e.target.value) })}
                        className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={entry.projectId}
                        onChange={(e) => {
                          const project = projects.find(p => p.id === e.target.value);
                          setEditEntry({ 
                            ...editEntry, 
                            projectId: e.target.value,
                            projectName: project?.name || ''
                          });
                        }}
                        className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      >
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editEntry.description || entry.description}
                        onChange={(e) => setEditEntry({ ...editEntry, description: e.target.value })}
                        className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm w-full"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <input
                        type="number"
                        value={Math.round((editEntry.duration || entry.duration) / 6) / 10}
                        onChange={(e) => setEditEntry({ ...editEntry, duration: Number(e.target.value) * 60 })}
                        className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm w-20 text-right"
                        step="0.1"
                      />
                      <span className="text-gray-500 text-sm ml-1">h</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={editEntry.billable !== undefined ? editEntry.billable : entry.billable}
                        onChange={(e) => setEditEntry({ ...editEntry, billable: e.target.checked })}
                        className="rounded bg-gray-700 border-gray-600"
                      />
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300">
                      ${((entry.duration / 60) * (entry.hourlyRate || 0)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => updateEntry(entry.id, editEntry)}
                          className="p-1 hover:bg-green-500/20 text-green-400 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setIsEditing(null)}
                          className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 text-gray-300">
                      {format(new Date(entry.startTime), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-800 rounded text-sm text-gray-300">
                        {entry.projectName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{entry.description}</td>
                    <td className="px-6 py-4 text-right text-gray-300">
                      {Math.floor(entry.duration / 60)}h {entry.duration % 60}m
                    </td>
                    <td className="px-6 py-4 text-center">
                      {entry.billable ? (
                        <span className="text-green-400">●</span>
                      ) : (
                        <span className="text-gray-600">○</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300">
                      {entry.billable ? `$${((entry.duration / 60) * (entry.hourlyRate || 0)).toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setIsEditing(entry.id); setEditEntry(entry); }}
                          className="p-1 hover:bg-gray-700 text-gray-400 rounded"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="p-1 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {filteredEntries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No time entries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Timer Starter Component
function TimerStarter({ 
  projects, 
  onStart 
}: { 
  projects: { id: string; name: string }[];
  onStart: (projectId: string, description: string, billable: boolean) => void;
}) {
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [description, setDescription] = useState('');
  const [billable, setBillable] = useState(true);
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-colors"
      >
        <Play className="w-5 h-5 fill-current" />
        Start Timer
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-xl">
      <select
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
      >
        {projects.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What are you working on?"
        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white w-64"
        autoFocus
      />
      
      <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
        <input
          type="checkbox"
          checked={billable}
          onChange={(e) => setBillable(e.target.checked)}
          className="rounded bg-gray-700 border-gray-600"
        />
        <span className="text-sm">Billable</span>
      </label>
      
      <button
        onClick={() => {
          if (description.trim()) {
            onStart(selectedProject, description, billable);
            setShowForm(false);
            setDescription('');
          }
        }}
        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
      >
        Start
      </button>
      
      <button
        onClick={() => setShowForm(false)}
        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
