# Builder Assignment: Projects, Content & Infrastructure
## Project Management + System Infrastructure

**Agent:** Builder (Sub-Agent)  
**Model:** Claude Sonnet 4.6  
**Timeline:** 4-5 days  
**Priority:** HIGH

---

## 🎯 OBJECTIVE

Make Projects and Content fully functional with Git integration, file system sync, and live workflows. Add Infrastructure monitoring (taken from BossClaw's assignment).

---

## 📋 DELIVERABLES

### 1. Git-Integrated Projects

**File:** `~/workspace/mission-control/components/ProjectsLive.tsx`

**Features:**
- [ ] Real Git repository integration
  - List actual repos from GitHub
  - Clone repos locally
  - Show commit history
  - Display branches
  
- [ ] Project creation
  - Create GitHub repo
  - Initialize local project
  - Set up project structure
  - Add to Mission Control
  
- [ ] File browser
  - Browse project files
  - Edit files in browser
  - Syntax highlighting
  - Auto-save to Git
  
- [ ] Live commit history
  - Show recent commits
  - Commit details (author, message, date)
  - Diff viewer
  - Checkout branches

---

### 2. File System Integration

**File:** `~/workspace/mission-control/components/FileBrowser.tsx`

**Features:**
- [ ] Browse local project files
- [ ] Tree view with folders
- [ ] File editing (monaco editor or textarea)
- [ ] Save → git commit
- [ ] Create new files/folders
- [ ] Delete files
- [ ] Upload files

---

### 3. Live Content Pipeline

**File:** `~/workspace/mission-control/components/ContentPipelineLive.tsx`

**Features:**
- [ ] Actual workflow stages
  - Ideas → Script → Thumbnail → Filming → Editing → Published
  - Each stage has actions
  
- [ ] Stage transitions
  - Move content to next stage
  - Git commit on transition
  - Create branch for content
  - Merge when published
  
- [ ] Content types
  - Video
  - Article
  - Social post
  
- [ ] Collaboration
  - Assign to agent
  - Comments/notes
  - Due dates
  - Attachments

---

### 4. Infrastructure Monitoring (From BossClaw's Assignment)

**File:** `~/workspace/mission-control/components/InfrastructureView.tsx`

**New Tab:** "Infrastructure" between Content and Memory

**Features:**
- [ ] Docker container monitoring
  - List running containers
  - Show resource usage per container
  - Start/stop/restart controls
  - Container logs viewer
  
- [ ] Service health dashboard
  - OpenClaw gateway status
  - Database connection status
  - Redis connection status
  - API endpoints health (ping tests)
  
- [ ] System metrics
  - CPU usage (real-time chart)
  - Memory usage (real-time chart)
  - Disk usage
  - Network I/O
  
- [ ] Alert notifications
  - Service down alerts
  - High resource usage warnings
  - Failed health checks

**Docker Integration:**
```typescript
const dockerAPI = {
  async listContainers(): Promise<Container[]> {
    const response = await fetch('/api/v1/docker/containers')
    return response.json()
  },
  
  async controlContainer(id: string, action: 'start' | 'stop' | 'restart'): Promise<void> {
    await fetch(`/api/v1/docker/containers/${id}/${action}`, { method: 'POST' })
  },
  
  async getContainerLogs(id: string): Promise<string> {
    const response = await fetch(`/api/v1/docker/containers/${id}/logs`)
    return response.text()
  }
}
```

**System Metrics:**
```typescript
const systemAPI = {
  async getMetrics(): Promise<SystemMetrics> {
    const response = await fetch('/api/v1/system/metrics')
    return response.json()
  }
}

// Returns: { cpu_percent, memory_percent, disk_percent, network_in, network_out }
```

---

### 5. GitHub Actions Integration

**File:** `~/workspace/mission-control/components/GitHubActions.tsx`

**Features:**
- [ ] Show workflow runs
- [ ] Trigger workflows
- [ ] View logs
- [ ] Status badges
- [ ] Deploy to staging/production

---

## 🔌 API ENDPOINTS NEEDED

### Projects & Content:
```
GET  /api/v1/github/repos
GET  /api/v1/github/repos/:owner/:name/commits
GET  /api/v1/github/repos/:owner/:name/branches
POST /api/v1/github/repos
POST /api/v1/github/repos/:owner/:name/commits

GET  /api/v1/files/read?path=/absolute/path
POST /api/v1/files/write
GET  /api/v1/files/list?path=/absolute/path
DELETE /api/v1/files/delete

GET  /api/v1/content
POST /api/v1/content
PUT  /api/v1/content/:id/stage
POST /api/v1/content/:id/assign
```

### Infrastructure (from BossClaw's assignment):
```
GET  /api/v1/docker/containers
POST /api/v1/docker/containers/:id/:action
GET  /api/v1/docker/containers/:id/logs

GET  /api/v1/system/metrics
GET  /api/v1/services/health
GET  /api/v1/services/:name/status
```

---

## 🎨 UI REQUIREMENTS

### Projects View
- GitHub-style repo list
- Star/favorite projects
- Last commit info
- Branch selector
- "Open in editor" button

### File Browser
- VS Code-style tree view
- Tabs for open files
- Monaco Editor for code
- Auto-save indicator
- Git status in file tree

### Content Pipeline
- Kanban board (like tasks)
- Stage columns
- Content cards with metadata
- Drag-and-drop between stages
- Quick actions per card

### Infrastructure (NEW)
- Docker container list with controls
- Resource usage charts (real-time)
- Service health grid
- System metrics graphs
- Alert notifications panel

---

## 📁 FILE STRUCTURE

```
mission-control/
├── components/
│   ├── ProjectsLive.tsx      # Live projects
│   ├── FileBrowser.tsx       # File browser
│   ├── ContentPipelineLive.tsx # Content workflow
│   ├── GitHubActions.tsx     # CI/CD integration
│   └── InfrastructureView.tsx # Infrastructure (NEW)
├── lib/
│   ├── github.ts             # GitHub API
│   ├── docker.ts             # Docker API (NEW)
│   └── system.ts             # System metrics (NEW)
└── hooks/
    ├── useGitHub.ts
    ├── useDocker.ts          # (NEW)
    └── useSystemMetrics.ts   # (NEW)
```

---

## ✅ ACCEPTANCE CRITERIA

**Projects:**
- [ ] Shows real GitHub repos
- [ ] Can create new repos
- [ ] File browser works
- [ ] Edit → Save → Git commit
- [ ] Commit history is live

**Content:**
- [ ] Workflow stages work
- [ ] Moving stages triggers actions
- [ ] Git integration on transitions
- [ ] Agent assignment spawns agents
- [ ] All content tracked in Git

**Infrastructure (NEW):**
- [ ] Shows real Docker containers
- [ ] Can start/stop/restart containers
- [ ] System metrics are live
- [ ] Service health checks work
- [ ] Alerts display correctly

---

**Start implementation when ready.** 🚀

*Note: Taking over Infrastructure tab from BossClaw who is busy on other projects.*
