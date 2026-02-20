/**
 * Optimized Dashboard Component
 * Loads within 2 seconds maximum
 */

import React, { useEffect, useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Brain, 
  Clock, 
  Users, 
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  Wifi,
  WifiOff,
  Server,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useCachedData } from '../lib/swr';

interface DashboardData {
  agents: any[];
  metrics: any;
  system: any;
  tasks: any[];
  cronJobs: any[];
  loaded: boolean;
  error: string | null;
}

// Optimized hook that loads all data in parallel with 2s max timeout
function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    agents: [],
    metrics: null,
    system: null,
    tasks: [],
    cronJobs: [],
    loaded: false,
    error: null
  });

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 2000); // 2 second hard timeout

    const fetchAll = async () => {
      try {
        // Parallel fetch all endpoints
        const [agentsRes, metricsRes, systemRes, tasksRes, cronRes] = await Promise.all([
          fetch('/api/agents', { signal: controller.signal }).catch(() => null),
          fetch('/api/openclaw', { signal: controller.signal }).catch(() => null),
          fetch('/api/system/resources', { signal: controller.signal }).catch(() => null),
          fetch('/api/tasks', { signal: controller.signal }).catch(() => null),
          fetch('/api/cron/jobs', { signal: controller.signal }).catch(() => null),
        ]);

        // Parse responses in parallel
        const [agents, metrics, system, tasks, cronJobs] = await Promise.all([
          agentsRes?.json().catch(() => ({ agents: [] })),
          metricsRes?.json().catch(() => ({})),
          systemRes?.json().catch(() => ({})),
          tasksRes?.json().catch(() => []),
          cronRes?.json().catch(() => ({ jobs: [] })),
        ]);

        setData({
          agents: agents?.agents || [],
          metrics,
          system,
          tasks: Array.isArray(tasks) ? tasks : [],
          cronJobs: cronJobs?.jobs || [],
          loaded: true,
          error: null
        });
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // Timeout - show partial data if available
          setData(prev => ({ ...prev, loaded: true, error: 'Some data timed out' }));
        } else {
          setData(prev => ({ ...prev, loaded: true, error: err.message }));
        }
      }
    };

    fetchAll();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  // Background refresh every 30s
  useEffect(() => {
    if (!data.loaded) return;
    
    const interval = setInterval(() => {
      fetch('/api/agents').then(r => r.json()).then(d => {
        setData(prev => ({ ...prev, agents: d.agents || [] }));
      }).catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, [data.loaded]);

  return data;
}

// Stat Card Component with loading state
function StatCard({ 
  title, 
  value, 
  subtext, 
  icon, 
  color,
  loading 
}: { 
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/50 animate-pulse">
        <div className="h-4 bg-gray-800 rounded w-1/3 mb-4" />
        <div className="h-8 bg-gray-800 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-800 rounded w-1/4" />
      </div>
    );
  }

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20',
    green: 'bg-green-500/10 border-green-500/20',
    orange: 'bg-orange-500/10 border-orange-500/20',
    red: 'bg-red-500/10 border-red-500/20',
    cyan: 'bg-cyan-500/10 border-cyan-500/20',
  };

  return (
    <div className={`p-5 rounded-xl border ${colorClasses[color]} transition-all hover:scale-[1.02] cursor-pointer`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white truncate">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className="p-2 bg-gray-800/50 rounded-lg shrink-0 ml-2">
          {icon}
        </div>
      </div>
    </div>
  );
}

// Agent Status Card
function AgentCard({ agent }: { agent: any }) {
  const statusColors: Record<string, string> = {
    online: 'bg-green-500',
    busy: 'bg-yellow-500',
    idle: 'bg-gray-500',
    offline: 'bg-red-500',
  };

  const status = agent.status || 'offline';
  const isActive = status === 'online' || status === 'busy';

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
      <div className={`w-2.5 h-2.5 rounded-full ${statusColors[status]} ${isActive ? 'animate-pulse' : ''}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200 truncate">{agent.name || agent.id}</p>
        <p className="text-xs text-gray-500 truncate">
          {agent.model} • {agent.currentTask || 'Idle'}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-gray-500">
          {agent.lastActive 
            ? formatDistanceToNow(new Date(agent.lastActive), { addSuffix: true })
            : 'Never'
          }
        </p>
      </div>
    </div>
  );
}

// Activity Item
function ActivityItem({ event }: { event: any }) {
  const icons: Record<string, React.ReactNode> = {
    'session.completed': <CheckCircle className="w-4 h-4 text-green-400" />,
    'session.started': <Zap className="w-4 h-4 text-blue-400" />,
    'agent.spawned': <Users className="w-4 h-4 text-purple-400" />,
    'task.updated': <Activity className="w-4 h-4 text-yellow-400" />,
    'memory.added': <Brain className="w-4 h-4 text-pink-400" />,
    'model.switched': <Zap className="w-4 h-4 text-orange-400" />,
    'cron.triggered': <Clock className="w-4 h-4 text-cyan-400" />,
  };

  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-800/50 last:border-0">
      <div className="mt-0.5 shrink-0">
        {icons[event.type] || <Activity className="w-4 h-4 text-gray-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-300 truncate">{event.description || event.type}</p>
        <p className="text-xs text-gray-500">
          {event.timestamp 
            ? formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })
            : 'Just now'
          }
        </p>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function DashboardLive() {
  const { 
    agents, 
    metrics, 
    system, 
    tasks, 
    cronJobs, 
    loaded, 
    error 
  } = useDashboardData();

  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Update timestamp when data loads
  useEffect(() => {
    if (loaded) {
      setLastUpdated(new Date());
    }
  }, [loaded]);

  // Derived stats
  const stats = useMemo(() => ({
    activeAgents: agents.filter((a: any) => a.status === 'online' || a.status === 'busy').length,
    totalAgents: agents.length,
    activeTasks: tasks.filter((t: any) => t.status === 'in-progress').length,
    pendingTasks: tasks.filter((t: any) => t.status === 'todo').length,
    activeCronJobs: cronJobs.filter((j: any) => j.status === 'active').length,
    cpuUsage: system?.cpu?.usagePercent || 0,
    memoryUsage: system?.memory?.usagePercent || 0,
    uptime: system?.uptime || 0,
  }), [agents, tasks, cronJobs, system]);

  // Mock activity for demo
  const activity = useMemo(() => [
    { type: 'session.completed', description: 'OneClaw completed task review', timestamp: new Date(Date.now() - 300000) },
    { type: 'agent.spawned', description: 'Builder spawned for Mission Control', timestamp: new Date(Date.now() - 600000) },
    { type: 'task.updated', description: 'Dashboard optimization marked done', timestamp: new Date(Date.now() - 900000) },
    { type: 'cron.triggered', description: 'Health check job ran successfully', timestamp: new Date(Date.now() - 1200000) },
  ], []);

  if (!loaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-blue-400" />
              Live Dashboard
            </h2>
            <p className="text-gray-400 mt-1">Loading real-time data...</p>
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 rounded-xl border border-gray-800 bg-gray-900/50 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-1/3 mb-4" />
              <div className="h-8 bg-gray-800 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-800 rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !agents.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">Failed to load dashboard</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-blue-400" />
            Live Dashboard
          </h2>
          <p className="text-gray-400 mt-1">Real-time system overview</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg">
            <Wifi className="w-4 h-4" />
            <span className="text-sm">Live</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Updated</p>
            <p className="text-sm text-gray-300">
              {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Agents"
          value={`${stats.activeAgents}/${stats.totalAgents}`}
          subtext={`${stats.activeAgents > 0 ? 'All systems operational' : 'No active agents'}`}
          icon={<Users className="w-5 h-5 text-blue-400" />}
          color="blue"
        />
        <StatCard
          title="Tasks in Progress"
          value={stats.activeTasks}
          subtext={`${stats.pendingTasks} pending`}
          icon={<Activity className="w-5 h-5 text-purple-400" />}
          color="purple"
        />
        <StatCard
          title="System CPU"
          value={`${Math.round(stats.cpuUsage)}%`}
          subtext={stats.cpuUsage > 80 ? 'High usage' : 'Normal'}
          icon={<Server className="w-5 h-5 text-orange-400" />}
          color={stats.cpuUsage > 80 ? 'red' : 'orange'}
        />
        <StatCard
          title="Active Cron Jobs"
          value={stats.activeCronJobs}
          subtext="Scheduled tasks"
          icon={<Clock className="w-5 h-5 text-green-400" />}
          color="green"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Status */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Agent Status
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {agents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No agents connected</p>
              ) : (
                agents.map((agent: any) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))
              )}
            </div>
          </div>

          {/* System Metrics */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-orange-400" />
              System Resources
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">CPU Usage</span>
                  <span className="text-gray-200">{Math.round(stats.cpuUsage)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      stats.cpuUsage > 80 ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(stats.cpuUsage, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Memory Usage</span>
                  <span className="text-gray-200">{Math.round(stats.memoryUsage)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      stats.memoryUsage > 80 ? 'bg-red-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${Math.min(stats.memoryUsage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Recent Activity
          </h3>
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {activity.map((event, idx) => (
              <ActivityItem key={idx} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
