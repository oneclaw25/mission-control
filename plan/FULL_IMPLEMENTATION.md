# Mission Control - Full Implementation Plan
## Agent Assignment & Functional Groups

**Goal:** Make every UI element live, connected, and functional

---

## 👥 AGENT ASSIGNMENTS

### ☁️ **OneClaw (Primary Agent)**
**Focus:** Core Operations & Real-Time Dashboard
**Model:** Kimi K2.5 (fast, efficient)

**Assigned Tabs:**
1. **Dashboard** - LIVE metrics, real-time stats
2. **Tasks** - Connected to actual task system

**Deliverables:**
- [ ] Real-time connection to OpenClaw API
- [ ] Live task counts from actual sessions
- [ ] Active agent status (heartbeats)
- [ ] Real cron job monitoring
- [ ] Live memory entry counts
- [ ] WebSocket integration for real-time updates

**Key Features:**
- Dashboard auto-refreshes every 30 seconds
- Live task board connected to filesystem (MEMORY.md, daily logs)
- Real agent status indicators (online/busy/idle)
- Working stats from actual OpenClaw state

---

### 🖥️ **BossClaw (Secondary Agent - Local)**
**Focus:** Model Management & Infrastructure
**Model:** MiniMax M2.5 (local workhorse)

**Assigned Tabs:**
1. **Models** - LIVE model switching, API integration
2. **Infrastructure** - System monitoring (new tab)

**Deliverables:**
- [ ] Real model switching via OpenClaw API
- [ ] Live model status (available/down)
- [ ] Cost tracking per model
- [ ] Response time metrics
- [ ] GPU/CPU utilization (BossClaw local)
- [ ] API key management
- [ ] Model performance comparison (real data)

**Key Features:**
- Switch models in UI → actually changes OpenClaw config
- Live API response times
- Cost tracking per request
- MiniMax M2.5 local server integration
- Connection status indicators

---

### 🏗️ **Builder Sub-Agent**
**Focus:** Project Management & Git Integration
**Model:** Claude Sonnet 4.6 (balanced)

**Assigned Tabs:**
1. **Projects** - Full CRUD with Git integration
2. **Content** - Live content pipeline

**Deliverables:**
- [ ] Git repository integration
- [ ] Project sync with actual repos
- [ ] Live commit history
- [ ] Branch management
- [ ] Content pipeline with actual workflow stages
- [ ] File system integration (read/write projects)
- [ ] GitHub Actions integration
- [ ] Live project status from Git

**Key Features:**
- Create project → creates Git repo
- Live commit history in UI
- Project files editable in browser
- Content stage transitions → Git commits
- Auto-sync with filesystem

---

### 💰 **Money Maker Sub-Agent**
**Focus:** Calendar & Business Operations
**Model:** Claude Sonnet 4.6 (analytical)

**Assigned Tabs:**
1. **Calendar** - Real events, cron jobs, meetings
2. **Business** - New tab for revenue/ops

**Deliverables:**
- [ ] Integration with Google Calendar API
- [ ] Cron job visualization
- [ ] Meeting scheduling
- [ ] Deadline tracking
- [ ] Revenue dashboard (new)
- [ ] Project profitability tracking
- [ ] Invoice generation
- [ ] Time tracking integration

**Key Features:**
- Real calendar events from Google Calendar
- Cron jobs shown as calendar events
- Click to schedule meetings
- Deadline reminders
- Business metrics (revenue, costs, profit)

---

### ⚙️ **Operator Sub-Agent**
**Focus:** Memory System & Agent Workspace
**Model:** Kimi K2.5 (fast operations)

**Assigned Tabs:**
1. **Memory** - Live memory search, file system
2. **Office** - Real agent workspace with chat

**Deliverables:**
- [ ] File system integration (read/write MEMORY.md)
- [ ] Live memory search (vector + text)
- [ ] Tag-based filtering (real tags)
- [ ] Memory entry creation/editing
- [ ] Working chat windows (WebSocket)
- [ ] Real agent status (process monitoring)
- [ ] Live workspace view
- [ ] Agent spawning UI (actually spawns agents)

**Key Features:**
- Search memory → searches actual files
- Edit memory → writes to filesystem
- Chat with agent → real WebSocket connection
- Spawn agent → actually spawns sub-agent
- Live process monitoring
- File browser integration

---

## 📋 IMPLEMENTATION PRIORITY

### Phase 1: Critical Infrastructure (Week 1)
**Agents:** OneClaw + BossClaw

1. **OpenClaw API Integration**
   - REST API client
   - WebSocket for real-time updates
   - Authentication handling

2. **Dashboard (OneClaw)**
   - Live stats from API
   - Real agent status
   - Working notifications

3. **Models (BossClaw)**
   - Real model switching
   - Live status indicators
   - API integration

### Phase 2: Project & Content (Week 2)
**Agents:** Builder

4. **Projects**
   - Git integration
   - File system sync
   - Live commit history

5. **Content**
   - Workflow automation
   - Git commit on stage change
   - File editing

### Phase 3: Operations (Week 3)
**Agents:** Operator + Money Maker

6. **Memory**
   - File system integration
   - Search implementation
   - CRUD operations

7. **Calendar**
   - Google Calendar API
   - Cron visualization
   - Event management

8. **Office**
   - Working chat (WebSocket)
   - Real agent spawning
   - Process monitoring

### Phase 4: Polish (Week 4)
**All Agents**

9. Testing & debugging
10. Performance optimization
11. Security hardening
12. Documentation

---

## 🔌 INTEGRATION POINTS

### OpenClaw API
```
GET  /api/v1/status           → Dashboard stats
GET  /api/v1/agents           → Agent list & status
POST /api/v1/agents/spawn     → Spawn sub-agent
GET  /api/v1/models           → Available models
POST /api/v1/models/switch    → Switch model
GET  /api/v1/tasks            → Task list
GET  /api/v1/memory           → Memory entries
POST /api/v1/memory/search    → Search memory
GET  /api/v1/cron             → Cron jobs
```

### File System
```
~/workspace/           → Project files
~/.openclaw/memory/    → Memory entries
~/.openclaw/agents/    → Agent configs
```

### Git
```
GitHub API            → Repos, commits, branches
Local Git             → File operations
GitHub Actions        → CI/CD status
```

### External APIs
```
Google Calendar       → Events, scheduling
OpenClaw Gateway      → Core functionality
MiniMax M2.5         → Local model (BossClaw)
```

---

## 🎯 SUCCESS CRITERIA

**Every element must:**
- [ ] Be connected to real data source
- [ ] Respond to user actions
- [ ] Update in real-time (or near real-time)
- [ ] Have error handling
- [ ] Show loading states
- [ ] Work end-to-end

**No mock data allowed in production view**

---

## 📊 CURRENT STATE vs TARGET

| Component | Current | Target | Owner |
|-----------|---------|--------|-------|
| Dashboard | Static mock | Live API data | OneClaw |
| Tasks | Local state | File system | OneClaw |
| Models | UI only | Real switching | BossClaw |
| Projects | Static | Git integration | Builder |
| Content | Static | Live workflow | Builder |
| Calendar | Static | Google Calendar | Money Maker |
| Memory | Static | File search | Operator |
| Office | Static chat | WebSocket | Operator |

---

## 🚀 DEPLOYMENT

**After completion:**
1. Full testing with real data
2. Performance optimization
3. Security audit
4. Production deployment
5. User documentation

**Timeline:** 4 weeks to full functionality

---

**Ready to spawn agents for implementation?** 🎯
