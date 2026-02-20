# OneClaw Assignment: Dashboard, Tasks & Models
## Core Operations + Model Management

**Agent:** OneClaw (Primary)  
**Model:** Kimi K2.5  
**Timeline:** 4-5 days  
**Priority:** CRITICAL

---

## 🎯 OBJECTIVE

Transform Dashboard, Tasks, and Models from static mock data to fully live, connected interfaces with real-time OpenClaw API integration.

**Note:** Taking over Models tab from BossClaw (who is busy on other projects).

---

## 📋 DELIVERABLES

### 1. OpenClaw API Client

Create `~/workspace/mission-control/lib/openclaw.ts`:

```typescript
interface OpenClawAPI {
  // Status & Metrics
  getStatus(): Promise<SystemStatus>
  getMetrics(): Promise<Metrics>
  
  // Agents
  getAgents(): Promise<Agent[]>
  getAgentStatus(agentId: string): Promise<AgentStatus>
  
  // Tasks
  getTasks(): Promise<Task[]>
  updateTask(taskId: string, updates: Partial<Task>): Promise<Task>
  
  // Memory
  getMemoryEntries(): Promise<MemoryEntry[]>
  searchMemory(query: string): Promise<MemoryEntry[]>
  
  // Cron
  getCronJobs(): Promise<CronJob[]>
  
  // Models (from BossClaw's assignment)
  getModels(): Promise<Model[]>
  switchModel(modelId: string, agentId?: string): Promise<void>
  getModelStatus(modelId: string): Promise<ModelStatus>
  getModelMetrics(modelId: string): Promise<ModelMetrics>
}
```

**Requirements:**
- REST API wrapper with error handling
- Automatic retry on failure
- Request/response logging
- Token-based authentication

---

### 2. Live Dashboard

**File:** `~/workspace/mission-control/components/DashboardLive.tsx`

**Features:**
- [ ] Real-time stats from OpenClaw API
  - Active sessions (live count)
  - Tasks completed today (actual)
  - Memory entries (count from files)
  - Cron jobs running (actual from system)
  
- [ ] Live agent status grid
  - Online/offline indicators (ping every 30s)
  - Current task per agent
  - Model being used
  - Last active timestamp
  
- [ ] Activity feed
  - Real session events
  - File changes
  - Agent spawns/completions
  - WebSocket integration for instant updates

- [ ] Auto-refresh
  - Poll every 30 seconds
  - WebSocket for instant updates
  - Background refresh (no UI blocking)

---

### 3. Live Tasks Board

**File:** `~/workspace/mission-control/components/TasksBoardLive.tsx`

**Features:**
- [ ] Read tasks from actual sources:
  - `~/workspace/memory/YYYY-MM-DD.md` files
  - OpenClaw session history
  - GitHub issues (if connected)
  - Cron job outputs
  
- [ ] Real-time task updates
  - Auto-refresh when files change
  - WebSocket updates from OpenClaw
  - Live status changes

- [ ] Task actions (actually work):
  - Move task → updates file/source
  - Create task → writes to memory
  - Assign agent → spawns sub-agent
  - Complete task → updates memory + notifies

---

### 4. Live Model Switching (From BossClaw's Assignment)

**File:** `~/workspace/mission-control/components/ModelSwitcherLive.tsx`

**Features:**
- [ ] Real model switching via OpenClaw API
  - POST to `/api/v1/models/switch`
  - Updates OpenClaw config
  - May require gateway restart
  
- [ ] Live model status
  - Ping each model endpoint
  - Show available/down status
  - Response time metrics
  
- [ ] Cost tracking
  - Track requests per model
  - Calculate estimated cost
  - Show cost per request
  
- [ ] Performance metrics
  - Average response time
  - Success rate
  - Error rate
  - Tokens used

- [ ] Model comparison
  - Side-by-side metrics
  - Price vs performance
  - Recommendation engine

**Note:** MiniMax M2.5 local integration will be added later when BossClaw provides server IP.

---

### 5. WebSocket Integration

**File:** `~/workspace/mission-control/lib/websocket.ts`

**Features:**
- [ ] Connect to OpenClaw WebSocket
- [ ] Subscribe to events:
  - `agent.status_changed`
  - `task.updated`
  - `memory.added`
  - `session.started/completed`
  - `cron.triggered`
  - `model.switched`
  
- [ ] Real-time UI updates
- [ ] Reconnection logic
- [ ] Error handling

---

## 🔌 API ENDPOINTS NEEDED

### Dashboard & Tasks:
```
GET  /api/v1/status
GET  /api/v1/agents
GET  /api/v1/agents/:id/status
GET  /api/v1/tasks
POST /api/v1/tasks/:id/update
GET  /api/v1/memory/entries
GET  /api/v1/cron/jobs
```

### Models (from BossClaw's assignment):
```
GET  /api/v1/models
POST /api/v1/models/switch
GET  /api/v1/models/:id/ping
GET  /api/v1/models/:id/metrics
GET  /api/v1/models/:id/costs
```

---

## 🎨 UI REQUIREMENTS

### Dashboard
- Skeleton loaders while fetching
- Spinners for actions
- Progress indicators for long operations
- "Live" badge when connected
- Last updated timestamp
- Connection status indicator

### Tasks
- Drag-and-drop between columns
- Task creation modal
- Assignment dropdown (agents)
- Priority indicators
- Due date badges

### Models
- Model cards with status badges
- "Switch to this model" button (actually works)
- Response time sparklines
- Cost per request display
- Performance comparison table

---

## 📁 FILE STRUCTURE

```
mission-control/
├── lib/
│   ├── openclaw.ts        # API client
│   ├── websocket.ts       # WebSocket connection
│   └── filesystem.ts      # File watching
├── components/
│   ├── DashboardLive.tsx  # Live dashboard
│   ├── TasksBoardLive.tsx # Live tasks
│   └── ModelSwitcherLive.tsx # Live models (NEW)
└── hooks/
    ├── useOpenClaw.ts     # API hooks
    ├── useWebSocket.ts    # WebSocket hook
    └── useFileWatch.ts    # File system hook
```

---

## ✅ ACCEPTANCE CRITERIA

**Dashboard:**
- [ ] Stats update automatically every 30s
- [ ] Agent status shows real online/offline
- [ ] Activity feed shows actual events
- [ ] No mock data - all real
- [ ] Works offline (cached)

**Tasks:**
- [ ] Tasks load from actual files
- [ ] Moving tasks updates source
- [ ] Creating tasks writes to memory
- [ ] Real-time updates when files change
- [ ] All actions actually work

**Models (NEW):**
- [ ] Switching models actually changes OpenClaw config
- [ ] Status shows real availability
- [ ] Response times are live
- [ ] Cost tracking is accurate
- [ ] Model comparison works

---

**Start implementation when ready.** 🚀

*Note: Taking over Models tab from BossClaw who is busy on other projects.*
