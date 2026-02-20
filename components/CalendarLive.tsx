// components/CalendarLive.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, 
  CheckCircle2, AlertCircle, Plus, X, RefreshCw, ExternalLink,
  Play, Pause, RotateCcw, Settings, Trash2, Edit3
} from 'lucide-react';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, 
  isToday, addMonths, subMonths, startOfWeek, endOfWeek, addDays,
  isSameDay, parseISO
} from 'date-fns';
import { CalendarEvent, CronJob } from '../types';
import { 
  loadCalendarEvents, saveCalendarEvents, loadCronJobs, 
  loadGoogleToken, saveGoogleToken 
} from '../lib/storage';
import { googleCalendarAPI } from '../lib/googleCalendar';

interface EventModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<CalendarEvent>) => void;
  onDelete?: (id: string) => void;
  selectedDate: Date;
}

function EventModal({ event, isOpen, onClose, onSave, onDelete, selectedDate }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<CalendarEvent['type']>('meeting');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setStartDate(format(event.start, 'yyyy-MM-dd'));
      setStartTime(format(event.start, 'HH:mm'));
      setEndDate(format(event.end, 'yyyy-MM-dd'));
      setEndTime(format(event.end, 'HH:mm'));
      setType(event.type);
      setLocation(event.location || '');
    } else {
      setTitle('');
      setDescription('');
      setStartDate(format(selectedDate, 'yyyy-MM-dd'));
      setStartTime('09:00');
      setEndDate(format(selectedDate, 'yyyy-MM-dd'));
      setEndTime('10:00');
      setType('meeting');
      setLocation('');
    }
  }, [event, selectedDate, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    
    onSave({
      id: event?.id,
      title,
      description,
      start,
      end,
      type,
      location,
      status: 'pending',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {event ? 'Edit Event' : 'New Event'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Event title"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CalendarEvent['type'])}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="meeting">Meeting</option>
              <option value="deadline">Deadline</option>
              <option value="reminder">Reminder</option>
              <option value="mission">Mission Control</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Location (optional)"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 h-20 resize-none"
              placeholder="Description (optional)"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          {event && onDelete && (
            <button
              onClick={() => { onDelete(event.id); onClose(); }}
              className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              Delete
            </button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalendarLive() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showCronDetails, setShowCronDetails] = useState(false);

  // Load data on mount
  useEffect(() => {
    const savedEvents = loadCalendarEvents();
    const savedCronJobs = loadCronJobs();
    const googleToken = loadGoogleToken();
    
    setEvents(savedEvents);
    setCronJobs(savedCronJobs);
    setIsGoogleConnected(!!googleToken);
    
    if (googleToken) {
      googleCalendarAPI.setAccessToken(googleToken);
    }
  }, []);

  // Save events when changed
  useEffect(() => {
    saveCalendarEvents(events);
  }, [events]);

  // Generate calendar days based on view
  const getCalendarDays = () => {
    switch (view) {
      case 'month': {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
      }
      case 'week': {
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return eachDayOfInterval({ start: weekStart, end: weekEnd });
      }
      case 'day':
        return [currentDate];
      default:
        return [];
    }
  };

  const days = getCalendarDays();

  // Convert cron jobs to calendar events
  const cronEvents: CalendarEvent[] = cronJobs.map(job => ({
    id: `cron-${job.id}`,
    title: job.name,
    start: job.nextRun,
    end: new Date(job.nextRun.getTime() + 30 * 60 * 1000), // 30 min duration
    type: 'cron',
    status: job.status === 'error' ? 'failed' : job.lastStatus === 'success' ? 'completed' : 'pending',
    source: 'cron',
    metadata: {
      schedule: job.schedule,
      command: job.command,
      lastRun: job.lastRun,
      runCount: job.runCount,
      failCount: job.failCount,
    },
  }));

  // Combine all events
  const allEvents = [...events, ...cronEvents];

  const getEventsForDay = (date: Date) => {
    return allEvents.filter(event => isSameDay(new Date(event.start), date));
  };

  const selectedEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  const handlePrev = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addDays(currentDate, -7));
    else setCurrentDate(addDays(currentDate, -1));
  };

  const handleNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    if (eventData.id) {
      // Update existing
      setEvents(prev => prev.map(e => e.id === eventData.id ? { ...e, ...eventData } as CalendarEvent : e));
    } else {
      // Create new
      const newEvent: CalendarEvent = {
        id: `evt-${Date.now()}`,
        title: eventData.title || 'Untitled',
        description: eventData.description,
        start: eventData.start || new Date(),
        end: eventData.end || new Date(),
        type: eventData.type || 'meeting',
        status: 'pending',
        location: eventData.location,
        source: 'local',
      };
      setEvents(prev => [...prev, newEvent]);
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleSyncGoogle = async () => {
    setIsSyncing(true);
    try {
      // In a real implementation, this would fetch from Google Calendar API
      // For now, simulate a sync
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add some mock Google events
      const mockGoogleEvents: CalendarEvent[] = [
        {
          id: `google-${Date.now()}-1`,
          title: 'Team Standup',
          start: new Date(Date.now() + 24 * 60 * 60 * 1000),
          end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
          type: 'meeting',
          status: 'pending',
          source: 'google',
        },
        {
          id: `google-${Date.now()}-2`,
          title: 'Client Review',
          start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
          type: 'meeting',
          status: 'pending',
          source: 'google',
        },
      ];
      
      setEvents(prev => [...prev.filter(e => e.source !== 'google'), ...mockGoogleEvents]);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleCronJob = (jobId: string) => {
    setCronJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: job.status === 'active' ? 'paused' : 'active' as CronJob['status'] }
        : job
    ));
  };

  const runCronJobNow = (jobId: string) => {
    setCronJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, lastRun: new Date(), lastStatus: 'success' }
        : job
    ));
  };

  const typeIcons = {
    google: CalendarIcon,
    cron: Clock,
    mission: CheckCircle2,
    meeting: CalendarIcon,
    deadline: AlertCircle,
    reminder: Clock,
  };

  const typeColors = {
    google: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    cron: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    mission: 'text-green-400 bg-green-400/10 border-green-400/30',
    meeting: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
    deadline: 'text-red-400 bg-red-400/10 border-red-400/30',
    reminder: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  };

  const statusColors = {
    pending: 'bg-gray-500',
    completed: 'bg-green-500',
    overdue: 'bg-red-500',
    running: 'bg-blue-500 animate-pulse',
    failed: 'bg-red-600',
  };

  return (
    <div className="h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Calendar</h2>
          <p className="text-gray-400">Google Calendar, cron jobs, and mission events</p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Switcher */}
          <div className="flex items-center bg-gray-800 rounded-lg p-1">
            {(['month', 'week', 'day'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded text-sm capitalize transition-colors ${
                  view === v ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <h3 className="text-lg font-semibold text-white min-w-[150px] text-center">
              {view === 'day' ? format(currentDate, 'EEEE, MMMM do') : format(currentDate, 'MMMM yyyy')}
            </h3>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncGoogle}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isGoogleConnected 
                  ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isGoogleConnected ? 'Sync' : 'Connect Google'}
            </button>
            <button
              onClick={() => { setEditingEvent(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Event
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="col-span-3">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            {/* Day Headers */}
            <div className={`grid gap-2 mb-2 ${view === 'day' ? 'grid-cols-1' : 'grid-cols-7'}`}>
              {(view === 'day' ? [format(currentDate, 'EEEE')] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className={`grid gap-2 ${view === 'day' ? 'grid-cols-1' : 'grid-cols-7'}`}>
              {days.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      ${view === 'day' ? 'h-96' : 'aspect-square'} 
                      p-2 rounded-lg border transition-all text-left overflow-hidden
                      ${isTodayDate ? 'border-blue-500 bg-blue-500/5' : 'border-gray-800'}
                      ${isSelected ? 'ring-2 ring-blue-500' : ''}
                      ${!isCurrentMonth && view === 'month' ? 'opacity-50' : ''}
                      hover:bg-gray-800/50
                    `}
                  >
                    <span className={`text-sm ${isTodayDate ? 'text-blue-400 font-semibold' : 'text-gray-300'}`}>
                      {format(day, view === 'day' ? 'EEEE, MMMM do' : 'd')}
                    </span>
                    
                    {/* Events */}
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, view === 'day' ? 20 : 3).map((event, i) => (
                        <div
                          key={i}
                          className={`text-xs truncate px-1.5 py-0.5 rounded ${typeColors[event.type]}`}
                        >
                          {view === 'day' && (
                            <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: 'currentColor' }} />
                          )}
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > (view === 'day' ? 20 : 3) && (
                        <span className="text-xs text-gray-500">+{dayEvents.length - (view === 'day' ? 20 : 3)} more</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected Day Events */}
          {selectedDate && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">
                {format(selectedDate, 'EEEE, MMMM do')}
              </h3>
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-gray-500">No events</p>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map((event) => {
                    const Icon = typeIcons[event.type];
                    return (
                      <div
                        key={event.id}
                        onClick={() => { setEditingEvent(event); setIsModalOpen(true); }}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${typeColors[event.type]}`}
                      >
                        <div className="flex items-start gap-2">
                          <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{event.title}</p>
                            <p className="text-xs opacity-70">
                              {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                            </p>
                            {event.location && (
                              <p className="text-xs opacity-50 truncate">{event.location}</p>
                            )}
                          </div>
                          <div className={`w-2 h-2 rounded-full ${statusColors[event.status]}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Cron Jobs */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Cron Jobs</h3>
              <button
                onClick={() => setShowCronDetails(!showCronDetails)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                {showCronDetails ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="space-y-2">
              {cronJobs.slice(0, showCronDetails ? undefined : 3).map((job) => (
                <div key={job.id} className="p-2 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${job.status === 'active' ? 'bg-green-500' : job.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                      <span className="text-sm text-gray-200">{job.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleCronJob(job.id)}
                        className="p-1 hover:bg-gray-700 rounded"
                        title={job.status === 'active' ? 'Pause' : 'Resume'}
                      >
                        {job.status === 'active' ? <Pause className="w-3 h-3 text-gray-400" /> : <Play className="w-3 h-3 text-gray-400" />}
                      </button>
                      <button
                        onClick={() => runCronJobNow(job.id)}
                        className="p-1 hover:bg-gray-700 rounded"
                        title="Run now"
                      >
                        <RotateCcw className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{job.schedule}</p>
                  {showCronDetails && (
                    <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-500 space-y-1">
                      <p>Next run: {format(job.nextRun, 'MMM d, h:mm a')}</p>
                      {job.lastRun && <p>Last run: {format(job.lastRun, 'MMM d, h:mm a')}</p>}
                      <p>Runs: {job.runCount} | Fails: {job.failCount}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Legend</h3>
            <div className="space-y-2">
              {(Object.keys(typeColors) as Array<keyof typeof typeColors>).map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${typeColors[type].split(' ')[1].replace('/10', '')}`} />
                  <span className="text-sm text-gray-400 capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        event={editingEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={editingEvent?.source !== 'google' ? handleDeleteEvent : undefined}
        selectedDate={selectedDate || new Date()}
      />
    </div>
  );
}
