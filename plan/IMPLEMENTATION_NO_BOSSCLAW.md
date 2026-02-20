# Mission Control - Full Implementation Plan (REVISED)
## Agent Assignment Without BossClaw

**Note:** BossClaw is busy on other projects. Redistributing his assignments (Models, Infrastructure) to other agents.

---

## 👥 REVISED AGENT ASSIGNMENTS

### ☁️ **OneClaw (Primary Agent)** - Core Operations + Models
**Tabs:** Dashboard, Tasks, Models  
**Model:** Kimi K2.5 (fast, efficient for operations)  
**Priority:** CRITICAL

**Assigned Work:**
1. **Dashboard** - LIVE metrics, real-time stats from OpenClaw API
2. **Tasks** - Connected to actual task system (memory files)
3. **Models** - Real model switching via API (taken from BossClaw)
   - Model status monitoring
   - Cost tracking per model
   - Response time metrics
   - MiniMax M2.5 integration (when BossClaw is free to provide IP)

**Rationale:** OneClaw as primary agent should handle core agent operations including model management. All are API-heavy operations work.

---

### 🏗️ **Builder (Sub-Agent)** - Projects + Infrastructure
**Tabs:** Projects, Content, Infrastructure  
**Model:** Claude Sonnet 4.6 (balanced)  
**Priority:** HIGH

**Assigned Work:**
1. **Projects** - Full CRUD with Git integration
2. **Content** - Live content pipeline  
3. **Infrastructure** - System monitoring (taken from BossClaw)
   - Docker container monitoring
   - Service health checks
   - System metrics display
   - Resource usage (CPU, memory, disk)

**Rationale:** Infrastructure is technical/systems work that fits Builder's engineering focus. Can reuse technical patterns from Projects work.

---

### ⚙️ **Operator (Sub-Agent)** - Memory + Office
**Tabs:** Memory, Office  
**Model:** Kimi K2.5  
**Priority:** HIGH

**Assigned Work:**
1. **Memory** - File system integration, search, CRUD
2. **Office** - Real agent workspace with chat
   - Working chat windows (WebSocket)
   - Real agent spawning
   - Process monitoring

**Unchanged from original plan**

---

### 💰 **Money Maker (Sub-Agent)** - Calendar + Business
**Tabs:** Calendar, Business  
**Model:** Claude Sonnet 4.6  
**Priority:** MEDIUM

**Assigned Work:**
1. **Calendar** - Real events, Google Calendar API
2. **Business** - Revenue tracking, metrics, invoicing

**Unchanged from original plan**

---

## 📊 REDISTRIBUTION SUMMARY

| Agent | Original Tabs | New Tabs | Added Work |
|-------|--------------|----------|------------|
| **OneClaw** | Dashboard, Tasks | Dashboard, Tasks, **Models** | Model switching, API integration |
| **Builder** | Projects, Content | Projects, Content, **Infrastructure** | Docker monitoring, system metrics |
| **Operator** | Memory, Office | Memory, Office | *(unchanged)* |
| **Money Maker** | Calendar, Business | Calendar, Business | *(unchanged)* |
| **BossClaw** | Models, Infrastructure | — | *(busy on other projects)* |

---

## 🎯 UPDATED DELIVERABLES

### OneClaw (Additional to original)
**Models Tab:**
- Real model switching via OpenClaw API
- Model status monitoring (available/down)
- Response time tracking
- Cost per request calculation
- MiniMax M2.5 integration (placeholder for when BossClaw provides IP)
- API key management interface

**File:** `~/workspace/mission-control/assignments/ONECLAW_MODELS_ADDITION.md`

---

### Builder (Additional to original)
**Infrastructure Tab (New):**
- Docker container monitoring
  - List running containers
  - Start/stop/restart controls
  - Resource usage per container
- Service health dashboard
  - OpenClaw gateway status
  - Database connection status
  - Redis connection status
- System metrics
  - CPU usage chart
  - Memory usage chart
  - Disk usage
  - Network I/O
- Alert notifications

**File:** `~/workspace/mission-control/assignments/BUILDER_INFRASTRUCTURE_ADDITION.md`

---

## 🔌 UPDATED API REQUIREMENTS

### OneClaw Needs Additional:
```
GET  /api/v1/models
POST /api/v1/models/switch
GET  /api/v1/models/:id/ping
GET  /api/v1/models/:id/metrics
```

### Builder Needs Additional:
```
GET  /api/v1/docker/containers
POST /api/v1/docker/containers/:id/:action
GET  /api/v1/system/metrics
GET  /api/v1/services/health
```

---

## 📅 UPDATED TIMELINE

### Week 1: Foundation (OneClaw focus)
- [ ] OneClaw: OpenClaw API client
- [ ] OneClaw: Dashboard live data
- [ ] OneClaw: Tasks file system
- [ ] OneClaw: Model switching (NEW)

### Week 2: Projects & Infrastructure (Builder focus)
- [ ] Builder: Git integration
- [ ] Builder: Projects working
- [ ] Builder: Infrastructure monitoring (NEW)

### Week 3: Operations (Operator + Money Maker)
- [ ] Operator: Memory system
- [ ] Operator: Chat WebSocket
- [ ] Operator: Agent spawning
- [ ] Money Maker: Calendar + Business

### Week 4: Integration
- [ ] All agents: Testing
- [ ] Cross-tab integration
- [ ] Performance optimization
- [ ] Production deployment

**Total Timeline:** Still 4 weeks (no change)

---

## 💡 KEY CHANGES

### What OneClaw Now Handles:
- ✅ Dashboard (real-time stats)
- ✅ Tasks (file system)
- **+ Models (model switching, status)**

### What Builder Now Handles:
- ✅ Projects (Git integration)
- ✅ Content (workflow)
- **+ Infrastructure (Docker, metrics)**

### What BossClaw Will Provide Later:
- MiniMax M2.5 server IP (when available)
- Local GPU monitoring (optional future)

---

## ✅ ACCEPTANCE CRITERIA (Unchanged)

**Every UI Element Must:**
- [ ] Connect to real data source
- [ ] Respond to user actions
- [ ] Update in real-time (or near real-time)
- [ ] Have error handling
- [ ] Show loading states
- [ ] Work end-to-end

**No Mock Data**

---

## 📁 UPDATED FILE STRUCTURE

```
mission-control/assignments/
├── ONECLAW_DASHBOARD_TASKS_MODELS.md      (merged spec)
├── BUILDER_PROJECTS_CONTENT_INFRASTRUCTURE.md (merged spec)
├── OPERATOR_MEMORY_OFFICE.md               (unchanged)
└── MONEYMAKER_CALENDAR_BUSINESS.md         (unchanged)
```

---

## 🚀 NEXT STEPS

1. **Update assignment documents** with redistributed work
2. **Spawn agents** with revised assignments
3. **OneClaw starts** with API client (others depend on it)
4. **Builder starts** on Git integration
5. **Daily coordination** via main session

---

**Ready to spawn agents with revised assignments?** 🎯

*Note: BossClaw remains available for consultation on MiniMax integration when ready, but is not assigned implementation work on this project.*
