import React, { useState, useEffect, createContext, useContext, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { 
  LayoutDashboard, 
  Calendar, 
  Brain, 
  Users, 
  CheckSquare, 
  Film,
  Home,
  Bell,
  Search,
  FolderKanban,
  Cpu,
  Plus,
  Bot,
  MessageSquare,
  Server,
  DollarSign,
} from 'lucide-react';
import { SWRConfig } from 'swr';
import { fetcher, swrConfig } from '../lib/swr';

// Eager load critical components
import ProjectsView, { Project } from '../components/ProjectsView';

// Dynamic imports for tab components (lazy loading)
const DashboardLive = dynamic(() => import('../components/DashboardLive'), {
  loading: () => <TabSkeleton />,
  ssr: false
});

const TasksBoardLive = dynamic(() => import('../components/TasksBoardLive'), {
  loading: () => <TabSkeleton />,
  ssr: false
});

const ModelSwitcherLive = dynamic(() => import('../components/ModelSwitcherLive'), {
  loading: () => <TabSkeleton />,
  ssr: false
});

const ProjectsLive = dynamic(() => import('../components/ProjectsLive'), {
  loading: () => <TabSkeleton />,
  ssr: false
});

const ContentPipelineLive = dynamic(() => import('../components/ContentPipelineLive'), {
  loading: () => <TabSkeleton />,
  ssr: false
});

const InfrastructureView = dynamic(() => import('../components/InfrastructureView'), {
  loading: () => <TabSkeleton />,
  ssr: false
});

const MemoryViewerLive = dynamic(() => import('../components/MemoryViewerLive'), {
  loading: () => <TabSkeleton />,
  ssr: false
});

const OfficeLive = dynamic(() => import('../components/OfficeLive'), {
  loading: () => <TabSkeleton />,
  ssr: false
});

const CalendarLive = dynamic(() => import('../components/CalendarLive'), {
  loading: () => <TabSkeleton />,
  ssr: false
});

const BusinessView = dynamic(() => import('../components/BusinessView'), {
  loading: () => <TabSkeleton />,
  ssr: false
});

const AgentManager = dynamic(() => import('../components/AgentManager'), {
  loading: () => <TabSkeleton />,
  ssr: false
});

const AgentSpawner = dynamic(() => import('../components/AgentSpawner'), {
  loading: () => <TabSkeleton />,
  ssr: false
});

const ChatSystem = dynamic(() => import('../components/ChatSystem'), {
  loading: () => <TabSkeleton />,
  ssr: false
});

const TeamView = dynamic(() => import('../components/TeamView'), {
  loading: () => <TabSkeleton />,
  ssr: false
});

// Loading skeleton for tabs
function TabSkeleton() {
  return (
    <div className="p-8 animate-pulse">
      <div className="h-8 bg-gray-800 rounded w-1/4 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-gray-800 rounded-lg" />
        ))}
      </div>
      <div className="h-96 bg-gray-800 rounded-lg" />
    </div>
  );
}

// Context for shared state
interface MissionControlContext {
  currentProject: Project | null;
  setCurrentProject: (p: Project | null) => void;
  currentModel: string;
  setCurrentModel: (m: string) => void;
  agentMode: 'normal' | 'heretic';
  setAgentMode: (m: 'normal' | 'heretic') => void;
}

const MissionControlCtx = createContext<MissionControlContext>({
  currentProject: null,
  setCurrentProject: () => {},
  currentModel: 'moonshot/kimi-k2.5',
  setCurrentModel: () => {},
  agentMode: 'normal',
  setAgentMode: () => {},
});

export const useMissionControl = () => useContext(MissionControlCtx);

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'spawner', label: 'Spawner', icon: Plus },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'models', label: 'Models', icon: Cpu },
  { id: 'content', label: 'Content', icon: Film },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'business', label: 'Business', icon: DollarSign },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'infrastructure', label: 'Infrastructure', icon: Server },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'office', label: 'Office', icon: Home },
];

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentModel, setCurrentModel] = useState('moonshot/kimi-k2.5');
  const [agentMode, setAgentMode] = useState<'normal' | 'heretic'>('normal');
  const [showProjectSwitcher, setShowProjectSwitcher] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Update model when project changes
  useEffect(() => {
    if (currentProject?.defaultModel) {
      setCurrentModel(currentProject.defaultModel);
    }
  }, [currentProject]);

  const contextValue: MissionControlContext = {
    currentProject,
    setCurrentProject,
    currentModel,
    setCurrentModel,
    agentMode,
    setAgentMode,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'projects':
        return <ProjectsLive />;
      case 'tasks':
        return <TasksBoardLive projectId={currentProject?.id} />;
      case 'agents':
        return <AgentManager />;
      case 'spawner':
        return <AgentSpawner />;
      case 'chat':
        return <ChatSystem />;
      case 'models':
        return <ModelSwitcherLive />;
      case 'content':
        return <ContentPipelineLive />;
      case 'calendar':
        return <CalendarLive />;
      case 'business':
        return <BusinessView />;
      case 'memory':
        return <MemoryViewerLive />;
      case 'infrastructure':
        return <InfrastructureView />;
      case 'team':
        return <TeamView />;
      case 'office':
        return <OfficeLive />;
      default:
        return <DashboardLive />;
    }
  };

  return (
    <SWRConfig value={swrConfig}>
      <MissionControlCtx.Provider value={contextValue}>
        <div className="min-h-screen bg-gray-950 text-gray-100">
          <Head>
            <title>Mission Control | BossClaw</title>
            <meta name="description" content="BossClaw Mission Control Dashboard" />
          </Head>

          {/* Header */}
          <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Mission Control</h1>
                  <p className="text-xs text-gray-400">BossClaw Operations Center</p>
                </div>
                
                {/* Project Switcher */}
                <div className="h-8 w-px bg-gray-700 mx-2" />
                
                <div className="relative">
                  <button
                    onClick={() => setShowProjectSwitcher(!showProjectSwitcher)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FolderKanban className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-200">
                      {currentProject ? currentProject.name : 'No Project Selected'}
                    </span>
                    {currentProject && (
                      <span className={`w-2 h-2 rounded-full ${
                        currentProject.priority === 'critical' ? 'bg-red-500' :
                        currentProject.priority === 'high' ? 'bg-orange-500' :
                        currentProject.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} />
                    )}
                  </button>
                  
                  {showProjectSwitcher && (
                    <ProjectSwitcherDropdown 
                      currentProject={currentProject}
                      onSelect={(p) => {
                        setCurrentProject(p);
                        setShowProjectSwitcher(false);
                      }}
                      onClose={() => setShowProjectSwitcher(false)}
                    />
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors w-64"
                  />
                </div>
                
                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-200 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                
                {/* Time */}
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-200">
                    {currentTime.toLocaleTimeString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentTime.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="flex h-[calc(100vh-73px)]">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto">
              <nav className="p-4 space-y-1">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
              
              {/* Mode Toggle */}
              <div className="p-4 border-t border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Agent Mode</span>
                </div>
                <button
                  onClick={() => setAgentMode(agentMode === 'normal' ? 'heretic' : 'normal')}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                    agentMode === 'heretic'
                      ? 'bg-red-900/50 text-red-400 border border-red-800'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}
                >
                  <span className="font-medium capitalize">{agentMode}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    agentMode === 'heretic' ? 'bg-red-500' : 'bg-green-500'
                  }`} />
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-950">
              <Suspense fallback={<TabSkeleton />}>
                {renderContent()}
              </Suspense>
            </main>
          </div>
        </div>
      </MissionControlCtx.Provider>
    </SWRConfig>
  );
}

// Project Switcher Dropdown Component
function ProjectSwitcherDropdown({ 
  currentProject, 
  onSelect, 
  onClose 
}: { 
  currentProject: Project | null;
  onSelect: (p: Project) => void;
  onClose: () => void;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/github?action=repos')
      .then(res => res.json())
      .then(data => {
        const repos = data.repos || [];
        const mapped: Project[] = repos.map((r: any) => ({
          id: r.id?.toString() || r.name,
          name: r.name,
          description: r.description || '',
          status: 'active',
          priority: 'medium',
          progress: 0,
          defaultModel: 'moonshot/kimi-k2.5',
          lastUpdated: r.updated_at || new Date().toISOString(),
        }));
        setProjects(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="absolute top-full left-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
      <div className="p-3 border-b border-gray-700">
        <span className="text-sm font-medium text-gray-300">Select Project</span>
      </div>
      <div className="max-h-64 overflow-y-auto py-1">
        {loading ? (
          <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">No projects found</div>
        ) : (
          projects.map(project => (
            <button
              key={project.id}
              onClick={() => onSelect(project)}
              className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors ${
                currentProject?.id === project.id ? 'bg-blue-900/30' : ''
              }`}
            >
              <FolderKanban className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-200">{project.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
