# Mission Control Performance Optimization Plan

## Current Performance Issues
- Main bundle: 463KB (too large)
- First load: 256KB + 86.9KB shared
- All components load upfront
- No caching strategy
- Large component files (20KB+ each)

---

## OPTIMIZATION STRATEGIES

### 1. Code Splitting & Lazy Loading (HIGH IMPACT)

**Implement dynamic imports for tabs:**
```typescript
// Instead of static imports
import DashboardLive from './DashboardLive';

// Use dynamic imports
const DashboardLive = dynamic(() => import('./DashboardLive'), {
  loading: () => <Skeleton height="400px" />,
  ssr: false
});
```

**Apply to all tab components:**
- DashboardLive
- TasksBoardLive
- ModelSwitcherLive
- ProjectsLive
- ContentPipelineLive
- InfrastructureView
- MemoryViewerLive
- ChatSystem
- OfficeLive
- CalendarLive
- BusinessView

**Expected Impact:** -40% initial bundle size

---

### 2. API Response Caching (HIGH IMPACT)

**Add SWR for data fetching:**
```typescript
import useSWR from 'swr';

// Cache system metrics for 30 seconds
const { data: metrics } = useSWR(
  '/api/system/resources',
  fetcher,
  { refreshInterval: 30000, dedupingInterval: 5000 }
);
```

**Cache durations:**
- System metrics: 30s
- Agent status: 10s
- Tasks: 60s
- Memory entries: 120s
- Docker containers: 30s
- Business metrics: 300s

**Expected Impact:** -60% API calls, faster UI updates

---

### 3. Memoization & Optimization (MEDIUM IMPACT)

**Use React.memo for list components:**
```typescript
const AgentCard = React.memo(({ agent }) => {
  // Component logic
}, (prev, next) => {
  // Custom comparison
  return prev.agent.id === next.agent.id && 
         prev.agent.status === next.agent.status;
});
```

**Use useMemo for expensive calculations:**
```typescript
const filteredTasks = useMemo(() => {
  return tasks.filter(t => t.status === filter);
}, [tasks, filter]);
```

**Use useCallback for event handlers:**
```typescript
const handleTaskMove = useCallback((taskId, newStatus) => {
  updateTask(taskId, newStatus);
}, [updateTask]);
```

**Expected Impact:** -50% unnecessary re-renders

---

### 4. Bundle Size Reduction (HIGH IMPACT)

**Remove unused dependencies:**
```bash
# Check bundle analyzer
npm install --save-dev @next/bundle-analyzer
```

**Tree-shake Lucide icons:**
```typescript
// Instead of importing all
import { Icons } from 'lucide-react';

// Import only needed
import { Server, Activity, Database } from 'lucide-react';
```

**Replace heavy libraries:**
- Monaco Editor → CodeMirror (lighter)
- Moment.js → date-fns (tree-shakable)
- Lodash → native ES6

**Expected Impact:** -30% bundle size

---

### 5. Image & Asset Optimization (MEDIUM IMPACT)

**Use Next.js Image component:**
```typescript
import Image from 'next/image';

<Image
  src="/avatar.png"
  width={40}
  height={40}
  loading="lazy"
  placeholder="blur"
/>
```

**Optimize fonts:**
- Use `next/font` for automatic optimization
- Preload critical fonts

**Expected Impact:** -20% load time

---

### 6. Server-Side Rendering (SSR) Optimization (MEDIUM IMPACT)

**Enable ISR for static data:**
```typescript
export async function getStaticProps() {
  const agents = await fetchAgents();
  return {
    props: { agents },
    revalidate: 60 // Regenerate every 60s
  };
}
```

**Use Streaming SSR:**
```typescript
export const config = {
  runtime: 'nodejs',
  dynamic: 'force-dynamic'
};
```

**Expected Impact:** Faster initial paint

---

### 7. Database/Storage Optimization (MEDIUM IMPACT)

**Add pagination:**
```typescript
// Instead of loading all tasks
const [page, setPage] = useState(1);
const { data } = useSWR(`/api/tasks?page=${page}&limit=20`);
```

**Implement virtual scrolling for long lists:**
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={tasks.length}
  itemSize={60}
>
  {TaskRow}
</FixedSizeList>
```

**Expected Impact:** -70% memory usage for large lists

---

### 8. WebSocket Optimization (LOW-MEDIUM IMPACT)

**Batch WebSocket messages:**
```typescript
// Buffer updates and send every 100ms
const buffer = [];
setInterval(() => {
  if (buffer.length > 0) {
    ws.send(JSON.stringify({ batch: buffer }));
    buffer.length = 0;
  }
}, 100);
```

**Compress WebSocket messages:**
```typescript
// Use per-message deflate
const ws = new WebSocket(url, {
  perMessageDeflate: true
});
```

**Expected Impact:** -50% WebSocket bandwidth

---

### 9. Preloading & Prefetching (MEDIUM IMPACT)

**Prefetch critical data:**
```typescript
import { useEffect } from 'react';

useEffect(() => {
  // Prefetch on mount
  prefetch('/api/agents');
  prefetch('/api/tasks');
}, []);
```

**Preload next likely tab:**
```typescript
const handleTabHover = (tab) => {
  const Component = tabComponents[tab];
  Component.preload?.();
};
```

**Expected Impact:** Faster tab switching

---

### 10. Production Build Optimization (HIGH IMPACT)

**Enable compression:**
```javascript
// next.config.js
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  webpack: (config) => {
    config.plugins.push(
      new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
      })
    );
    return config;
  }
};
```

**Enable Brotli compression on server**

**Expected Impact:** -60% transfer size

---

## IMPLEMENTATION PRIORITY

### Phase 1: Quick Wins (1-2 hours)
1. ✅ Add SWR for caching
2. ✅ Implement dynamic imports for tabs
3. ✅ Add React.memo to list components
4. ✅ Remove unused imports

**Expected: 50% speed improvement**

### Phase 2: Bundle Optimization (2-3 hours)
5. Analyze bundle with @next/bundle-analyzer
6. Replace heavy libraries
7. Tree-shake icons
8. Add compression

**Expected: Additional 30% improvement**

### Phase 3: Advanced Optimizations (1 day)
9. Implement pagination
10. Add virtual scrolling
11. Optimize WebSocket
12. Add ISR

**Expected: Additional 20% improvement**

---

## TARGET METRICS

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| First Load | 256KB | 150KB | -41% |
| Time to Interactive | ~3s | <1.5s | -50% |
| API Response | Variable | <200ms | Consistent |
| Re-renders | High | Minimal | -70% |
| Tab Switch | ~500ms | <200ms | -60% |

---

## FILES TO MODIFY

```
components/
  ├── DashboardLive.tsx      + memo, useSWR
  ├── TasksBoardLive.tsx     + pagination, virtual scroll
  ├── ModelSwitcherLive.tsx  + dynamic import
  ├── ProjectsLive.tsx       + lazy load, memo
  ├── InfrastructureView.tsx + SWR caching
  ├── MemoryViewerLive.tsx   + virtual scroll
  ├── ChatSystem.tsx         + WebSocket batch
  └── OfficeLive.tsx         + memo

pages/
  ├── index.tsx              + dynamic imports
  └── _app.tsx               + SWR config

lib/
  ├── fetcher.ts             + SWR setup
  └── cache.ts               + cache strategies

next.config.js               + compression, optimization
```

---

**Ready to implement optimizations?**
