# Operator Assignment: Memory & Office
## Operations & Workspace - Full Implementation

**Agent:** Operator (Sub-Agent)  
**Model:** Kimi K2.5  
**Timeline:** 3-4 days  
**Priority:** HIGH

---

## 🎯 OBJECTIVE

Make Memory and Office tabs fully functional with real file system integration, live chat, and actual agent spawning.

---

## 📋 DELIVERABLES

### 1. Live Memory System

**File:** `~/workspace/mission-control/components/MemoryViewerLive.tsx`

**Features:**
- [ ] Real file system integration
  - Read from `~/.openclaw/memory/`
  - Read SOUL.md, MEMORY.md, daily logs
  - Parse markdown entries
  - Watch for file changes
  
- [ ] Live search
  - Full-text search across all memory files
  - Vector search (if embeddings available)
  - Filter by date, tags, source
  - Real-time results
  
- [ ] CRUD operations
  - Create new memory entry
  - Edit existing entries
  - Delete entries
  - Save back to files
  
- [ ] Memory entry details
  - Source file location
  - Line numbers
  - Git-style blame (who created)
  - Related entries

**File System Integration:**
```typescript
const memoryAPI = {
  async readMemoryFiles(): Promise<MemoryEntry[]> {
    const files = await fs.readdir('~/.openclaw/memory/')
    const entries: MemoryEntry[] = []
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const content = await fs.readFile(`~/.openclaw/memory/${file}`, 'utf-8')
        const parsed = parseMarkdown(content)
        entries.push(...parsed)
      }
    }
    
    return entries
  },
  
  async searchMemory(query: string): Promise<MemoryEntry[]> {
    const allEntries = await this.readMemoryFiles()
    
    // Full-text search
    return allEntries.filter(entry => 
      entry.title.toLowerCase().includes(query.toLowerCase()) ||
      entry.content.toLowerCase().includes(query.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )
  },
  
  async createMemoryEntry(entry: MemoryEntry): Promise<void> {
    const filename = `~/.openclaw/memory/${entry.date}.md`
    const markdown = formatAsMarkdown(entry)
    await fs.appendFile(filename, markdown)
  }
}
```

---

### 2. Working Chat System

**File:** `~/workspace/mission-control/components/ChatSystem.tsx`

**Features:**
- [ ] Real WebSocket connections
  - Connect to each agent
  - Persistent chat history
  - Real-time message delivery
  
- [ ] Agent chat windows
  - Floating chat panels
  - Minimize/maximize
  - Message history per agent
  - Typing indicators
  
- [ ] Message delivery
  - Send to agent via OpenClaw API
  - Receive responses via WebSocket
  - Show agent thinking state
  - Error handling for offline agents
  
- [ ] Multi-agent chat
  - Start group conversations
  - @mentions to specific agents
  - Broadcast to all agents

**WebSocket Implementation:**
```typescript
const useAgentChat = (agentId: string) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [ws, setWs] = useState<WebSocket | null>(null)
  
  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:8000/agents/${agentId}/chat`)
    
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      setMessages(prev => [...prev, message])
    }
    
    setWs(socket)
    
    return () => socket.close()
  }, [agentId])
  
  const sendMessage = (content: string) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'message',
        content,
        timestamp: new Date().toISOString()
      }))
    }
  }
  
  return { messages, sendMessage }
}
```

---

### 3. Real Agent Spawning

**File:** `~/workspace/mission-control/components/AgentSpawner.tsx`

**Features:**
- [ ] Spawn sub-agents from UI
  - Select agent type (Architect, Builder, etc.)
  - Choose model
  - Set task description
  - Click "Spawn" → actually spawns
  
- [ ] Live agent monitoring
  - Process ID tracking
  - Resource usage (CPU, memory)
  - Current task/status
  - Kill/terminate button
  
- [ ] Agent lifecycle
  - Spawn
  - Monitor
  - Communicate
  - Terminate
  - View results

**Agent Spawning API:**
```typescript
const spawnAgent = async (config: AgentConfig) => {
  const response = await fetch('/api/v1/agents/spawn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: config.type,  // 'architect', 'builder', etc.
      model: config.model,
      task: config.task,
      timeout: config.timeout || 3600
    })
  })
  
  const { agentId, sessionId } = await response.json()
  
  // Connect to agent via WebSocket
  connectToAgent(agentId, sessionId)
  
  return { agentId, sessionId }
}
```

---

### 4. Live Office View

**File:** `~/workspace/mission-control/components/OfficeLive.tsx`

**Features:**
- [ ] Real agent status
  - Process monitoring
  - CPU/memory per agent
  - Current task
  - Model in use
  
- [ ] Live workspace
  - Agent avatars with live status
  - Current activity
  - Chat buttons (open chat window)
  - Quick actions (spawn, kill, assign task)
  
- [ ] Task assignment
  - Drag task to agent
  - Agent accepts/declines
  - Progress tracking
  - Result delivery

---

## 🔌 API ENDPOINTS NEEDED

```
# Memory API
GET  /api/v1/memory/files
GET  /api/v1/memory/search?q=query
GET  /api/v1/memory/entry/:id
POST /api/v1/memory/entry
PUT  /api/v1/memory/entry/:id
DELETE /api/v1/memory/entry/:id

# Chat API (WebSocket)
WS   /ws/agents/:id/chat
POST /api/v1/agents/:id/message

# Agent Spawning
POST /api/v1/agents/spawn
GET  /api/v1/agents/:id/status
GET  /api/v1/agents/:id/metrics
POST /api/v1/agents/:id/kill
GET  /api/v1/agents/:id/logs

# Process Monitoring
GET  /api/v1/processes
GET  /api/v1/processes/:pid
GET  /api/v1/system/resources
```

---

## 🎨 UI REQUIREMENTS

### Memory Viewer
- File tree on left
- Search bar (prominent)
- Tag cloud
- Entry cards with source info
- Edit button (opens editor)
- Create new entry button

### Chat Windows
- Slack-style floating panels
- Draggable/minimizable
- Message history (scrollable)
- Input box with send button
- Typing indicators
- Connection status

### Agent Spawner
- Form: Agent type, Model, Task
- "Spawn" button
- Progress indicator
- Result display
- Spawned agents list
- Kill buttons

### Office
- Grid of agent workstations
- Live status indicators (pulsing)
- Drag-and-drop task assignment
- Quick action buttons
- Resource usage mini-charts

---

## ✅ ACCEPTANCE CRITERIA

**Memory:**
- [ ] Reads actual memory files
- [ ] Search works across all files
- [ ] Create/edit/delete entries
- [ ] Auto-refreshes when files change
- [ ] All changes saved to filesystem

**Chat:**
- [ ] WebSocket connections work
- [ ] Messages delivered in real-time
- [ ] Can chat with multiple agents
- [ ] Message history persists
- [ ] Typing indicators work

**Agent Spawning:**
- [ ] Spawn button creates real agent
- [ ] Can monitor spawned agents
- [ ] Can kill agents from UI
- [ ] Agent results displayed
- [ ] Resource tracking works

**Office:**
- [ ] Agent status is live
- [ ] Can assign tasks by drag-drop
- [ ] Chat opens working chat window
- [ ] Resource usage is real
- [ ] Quick actions work

---

**Start implementation when ready.** 🚀
