import React, { useState } from 'react';
import { 
  Server, 
  Activity, 
  Database, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Play,
  Square,
  RefreshCw,
  Terminal,
  Cpu,
  HardDrive,
  Wifi,
  Clock,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { useDocker } from '../hooks/useDocker';
import { useSystemMetrics, useHealthStatus } from '../hooks/useSystemMetrics';

interface LogModalProps {
  containerId: string;
  containerName: string;
  onClose: () => void;
}

function LogModal({ containerId, containerName, onClose }: LogModalProps) {
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);
  const { getLogs } = useDocker();

  React.useEffect(() => {
    getLogs(containerId, 200).then(logData => {
      setLogs(logData);
      setLoading(false);
    });
  }, [containerId, getLogs]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Container Logs: {containerName}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : (
            <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">{logs || 'No logs available'}</pre>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InfrastructureView() {
  const { 
    containers, 
    loading: dockerLoading, 
    error: dockerError, 
    isMock,
    startContainer, 
    stopContainer, 
    restartContainer,
    refresh: refreshDocker
  } = useDocker();
  
  const { 
    metrics, 
    history, 
    loading: metricsLoading, 
    isMock: metricsMock,
    formatBytes,
    formatUptime
  } = useSystemMetrics();
  
  const { 
    status: healthStatus, 
    loading: healthLoading 
  } = useHealthStatus();

  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState<{id: string, name: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'containers' | 'services'>('overview');

  const handleControl = async (id: string, action: 'start' | 'stop' | 'restart') => {
    switch (action) {
      case 'start': await startContainer(id); break;
      case 'stop': await stopContainer(id); break;
      case 'restart': await restartContainer(id); break;
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'running': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'exited':
      case 'dead': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'running': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'paused': return <Activity className="w-4 h-4 text-yellow-400" />;
      case 'exited':
      case 'dead': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Server className="w-6 h-6 text-blue-400" />
            Infrastructure
          </h2>
          <p className="text-gray-400">Monitor Docker containers, system metrics, and service health</p>
        </div>
        <div className="flex items-center gap-3">
          {(isMock || metricsMock) && (
            <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-lg text-sm">
              Demo Mode
            </span>
          )}
          <button 
            onClick={refreshDocker}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        {(['overview', 'containers', 'services'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${
              activeTab === tab
                ? 'text-blue-400 border-blue-400'
                : 'text-gray-400 border-transparent hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Metrics Cards */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard
              title="CPU Usage"
              value={`${metrics?.cpu.usage_percent || 0}%`}
              icon={Cpu}
              color="blue"
              detail={`${metrics?.cpu.cores || 0} cores`}
            />
            <MetricCard
              title="Memory"
              value={`${metrics?.memory.percent || 0}%`}
              icon={Database}
              color="purple"
              detail={metrics ? formatBytes(metrics.memory.used) : '0 B'}
            />
            <MetricCard
              title="Disk"
              value={`${metrics?.disk.percent || 0}%`}
              icon={HardDrive}
              color="orange"
              detail={metrics ? formatBytes(metrics.disk.used) : '0 B'}
            />
            <MetricCard
              title="Uptime"
              value={metrics ? formatUptime(metrics.uptime) : '0m'}
              icon={Clock}
              color="green"
              detail={metrics?.hostname || 'Unknown'}
            />
          </div>

          {/* Resource Charts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">CPU & Memory History</h3>
              <div className="h-48 flex items-end gap-1">
                {history.map((point, i) => (
                  <div key={i} className="flex-1 flex flex-col gap-1">
                    <div 
                      className="bg-blue-500/50 rounded-t"
                      style={{ height: `${point.cpu}%`, maxHeight: '100%' }}
                    />
                    <div 
                      className="bg-purple-500/50 rounded-t"
                      style={{ height: `${point.memory}%`, maxHeight: '100%' }}
                    />
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    Collecting data...
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500/50 rounded" />
                  <span className="text-gray-400">CPU</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500/50 rounded" />
                  <span className="text-gray-400">Memory</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Running Containers</h3>
              <div className="space-y-3">
                {containers.slice(0, 5).map((container) => (
                  <div key={container.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getStateColor(container.state)}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-200">{container.name}</p>
                        <p className="text-xs text-gray-500">{container.image}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">{container.cpu || '-'}</p>
                      <p className="text-xs text-gray-500">{container.memory || '-'}</p>
                    </div>
                  </div>
                ))}
                {containers.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No containers found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'containers' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Image</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Ports</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">CPU / Memory</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {containers.map((container) => (
                <tr key={container.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getStateIcon(container.state)}
                      <span className={`text-sm capitalize ${
                        container.state === 'running' ? 'text-green-400' :
                        container.state === 'paused' ? 'text-yellow-400' :
                        container.state === 'exited' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {container.state}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium text-gray-200">{container.name}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-400">{container.image}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {container.ports.slice(0, 2).map((port, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded">
                          {port.host}:{port.container}
                        </span>
                      ))}
                      {container.ports.length > 2 && (
                        <span className="text-xs text-gray-500">+{container.ports.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <p className="text-gray-300">{container.cpu || '-'}</p>
                      <p className="text-gray-500">{container.memory || '-'}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {container.state === 'running' ? (
                        <>
                          <button
                            onClick={() => handleControl(container.id, 'stop')}
                            className="p-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
                            title="Stop"
                          >
                            <Square className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleControl(container.id, 'restart')}
                            className="p-1.5 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded transition-colors"
                            title="Restart"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleControl(container.id, 'start')}
                          className="p-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded transition-colors"
                          title="Start"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setShowLogs({ id: container.id, name: container.name })}
                        className="p-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                        title="Logs"
                      >
                        <Terminal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {containers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    {dockerLoading ? 'Loading containers...' : 'No containers found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="grid grid-cols-2 gap-4">
          {healthStatus?.services.map((service) => (
            <div 
              key={service.name}
              className={`p-4 rounded-xl border ${
                service.status === 'healthy' 
                  ? 'bg-green-900/20 border-green-800' 
                  : 'bg-red-900/20 border-red-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {service.status === 'healthy' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <div>
                    <h3 className="font-medium text-white">{service.name}</h3>
                    <p className="text-sm text-gray-400">{service.message}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  service.status === 'healthy'
                    ? 'bg-green-600/20 text-green-400'
                    : 'bg-red-600/20 text-red-400'
                }`}>
                  {service.latency}ms
                </span>
              </div>
            </div>
          ))}
          {(!healthStatus || healthStatus.services.length === 0) && (
            <div className="col-span-2 py-8 text-center text-gray-500">
              {healthLoading ? 'Checking service health...' : 'No health data available'}
            </div>
          )}
        </div>
      )}

      {showLogs && (
        <LogModal
          containerId={showLogs.id}
          containerName={showLogs.name}
          onClose={() => setShowLogs(null)}
        />
      )}
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, detail }: { 
  title: string; 
  value: string; 
  icon: any; 
  color: string;
  detail?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20',
    orange: 'bg-orange-500/10 border-orange-500/20',
    green: 'bg-green-500/10 border-green-500/20',
  };

  const iconColors: Record<string, string> = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    green: 'text-green-400',
  };

  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-6 h-6 ${iconColors[color]}`} />
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <p className="text-sm text-gray-400">{title}</p>
      {detail && <p className="text-xs text-gray-500 mt-1">{detail}</p>}
    </div>
  );
}