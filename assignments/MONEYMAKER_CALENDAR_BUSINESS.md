# Money Maker Assignment: Calendar & Business
## Operations & Business Intelligence

**Agent:** Money Maker (Sub-Agent)  
**Model:** Claude Sonnet 4.6  
**Timeline:** 2-3 days  
**Priority:** MEDIUM

---

## 🎯 OBJECTIVE

Make Calendar fully functional with real events from Google Calendar and cron jobs. Add Business tab for revenue tracking and business metrics.

---

## 📋 DELIVERABLES

### 1. Live Calendar Integration

**File:** `~/workspace/mission-control/components/CalendarLive.tsx`

**Features:**
- [ ] Google Calendar API integration
  - OAuth2 authentication
  - Read events from calendar
  - Create new events
  - Edit existing events
  
- [ ] Cron job visualization
  - Show cron jobs as events
  - Visual indicator for job type
  - Last run / next run times
  - Success/failure status
  
- [ ] Mission Control events
  - Agent spawn completions
  - Task deadlines
  - Project milestones
  - Meeting reminders
  
- [ ] Event management
  - Create events
  - Edit events
  - Delete events
  - Set reminders

**Google Calendar Integration:**
```typescript
const calendarAPI = {
  async authenticate(): Promise<string> {
    // OAuth2 flow
    const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
    // ... OAuth implementation
    return accessToken
  },
  
  async listEvents(calendarId: string = 'primary'): Promise<Event[]> {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )
    return response.json()
  },
  
  async createEvent(event: EventInput): Promise<Event> {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      }
    )
    return response.json()
  }
}
```

**Cron Job Events:**
```typescript
const getCronEvents = async (): Promise<CalendarEvent[]> => {
  const jobs = await fetch('/api/v1/cron/jobs').then(r => r.json())
  
  return jobs.map(job => ({
    id: `cron-${job.id}`,
    title: job.name,
    type: 'cron',
    start: job.next_run,
    end: new Date(job.next_run.getTime() + 60000),
    status: job.status,
    lastRun: job.last_run,
    recurrence: job.schedule
  }))
}
```

---

### 2. Business Dashboard (New Tab)

**File:** `~/workspace/mission-control/components/BusinessView.tsx`

**New Tab:** "Business" between Calendar and Memory

**Features:**
- [ ] Revenue tracking
  - Monthly recurring revenue (MRR)
  - Revenue by project
  - Revenue by customer
  - Growth trends
  
- [ ] Project profitability
  - Cost per project
  - Time tracking
  - Resource costs
  - Profit margins
  
- [ ] Agent utilization
  - Hours per agent
  - Cost per agent
  - Revenue per agent
  - Efficiency metrics
  
- [ ] Financial forecasts
  - Burn rate
  - Runway projection
  - Break-even analysis
  - Cash flow

**Business Metrics:**
```typescript
interface BusinessMetrics {
  revenue: {
    mrr: number
    arr: number
    byProject: Record<string, number>
    byCustomer: Record<string, number>
    growth: number // percentage
  }
  costs: {
    infrastructure: number
    agents: number
    time: number
    total: number
  }
  profit: {
    gross: number
    margin: number
    perProject: Record<string, number>
  }
  forecast: {
    runway: number // months
    breakEven: Date
    cashFlow: Array<{ month: string, in: number, out: number }>
  }
}
```

---

### 3. Time Tracking Integration

**File:** `~/workspace/mission-control/components/TimeTracker.tsx`

**Features:**
- [ ] Start/stop timer per task
- [ ] Automatic time logging
- [ ] Weekly time reports
- [ ] Billable vs non-billable
- [ ] Export to invoice

---

### 4. Invoice Generation

**File:** `~/workspace/mission-control/components/InvoiceGenerator.tsx`

**Features:**
- [ ] Create invoices from time tracking
- [ ] Customer management
- [ ] Line items (time, expenses)
- [ ] PDF generation
- [ ] Send via email
- [ ] Payment tracking

---

## 🔌 API ENDPOINTS NEEDED

```
# Google Calendar API (via backend proxy)
GET  /api/v1/calendar/auth
GET  /api/v1/calendar/events
POST /api/v1/calendar/events
PUT  /api/v1/calendar/events/:id
DELETE /api/v1/calendar/events/:id

# Business API
GET  /api/v1/business/metrics
GET  /api/v1/business/revenue
GET  /api/v1/business/costs
GET  /api/v1/business/forecast

# Time Tracking API
GET  /api/v1/time/entries
POST /api/v1/time/start
POST /api/v1/time/stop
GET  /api/v1/time/reports

# Invoicing API
GET  /api/v1/invoices
POST /api/v1/invoices
GET  /api/v1/invoices/:id/pdf
POST /api/v1/invoices/:id/send
GET  /api/v1/customers
```

---

## 🎨 UI REQUIREMENTS

### Calendar
- Google Calendar-style grid
- Month/week/day views
- Color-coded events (meetings, cron, deadlines)
- Create event modal
- Drag-to-resize
- Click for details

### Business Dashboard
- KPI cards (MRR, costs, profit, runway)
- Revenue chart (line graph)
- Project profitability table
- Cash flow projection
- Alerts (low runway, high costs)

### Time Tracking
- Timer widget (always visible)
- Project/task selector
- Weekly timesheet
- Reports by project/date

### Invoicing
- Invoice list
- Status badges (draft, sent, paid, overdue)
- Quick actions (send, download, mark paid)
- Customer directory

---

## ✅ ACCEPTANCE CRITERIA

**Calendar:**
- [ ] Shows real Google Calendar events
- [ ] Cron jobs displayed as events
- [ ] Can create new events
- [ ] Can edit/delete events
- [ ] Mission Control events appear
- [ ] Syncs bidirectionally

**Business:**
- [ ] Real revenue tracking
- [ ] Cost calculations accurate
- [ ] Profit margins calculated
- [ ] Forecasts update automatically
- [ ] Runway calculation works
- [ ] Alerts for issues

**Time Tracking:**
- [ ] Timer starts/stops
- [ ] Time logged to projects
- [ ] Reports generated
- [ ] Can export data

**Invoicing:**
- [ ] Can create invoices
- [ ] PDF generation works
- [ ] Email sending works
- [ ] Payment tracking

---

## 📝 NOTES

**Google Calendar Setup:**
1. Create Google Cloud project
2. Enable Calendar API
3. Create OAuth2 credentials
4. Add redirect URI
5. Store credentials securely

**Data Sources:**
- Google Calendar (events)
- OpenClaw (time tracking, agent costs)
- Manual entry (revenue, expenses)
- Stripe (payments, if integrated)

---

**Start implementation when ready.** 🚀
