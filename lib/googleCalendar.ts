// lib/googleCalendar.ts
import { CalendarEvent } from '../types';

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken?: string;
  refreshToken?: string;
}

export class GoogleCalendarAPI {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(config?: Partial<GoogleCalendarConfig>) {
    this.accessToken = config?.accessToken || null;
    this.refreshToken = config?.refreshToken || null;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  setRefreshToken(token: string) {
    this.refreshToken = token;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAuthUrl(clientId: string, redirectUri: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string, clientId: string, clientSecret: string, redirectUri: string): Promise<{ access_token: string; refresh_token?: string }> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    return response.json();
  }

  async refreshAccessToken(clientId: string, clientSecret: string): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: this.refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    return data.access_token;
  }

  async listEvents(calendarId: string = 'primary', timeMin?: Date, timeMax?: Date): Promise<CalendarEvent[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const params = new URLSearchParams({
      calendarId,
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    if (timeMin) {
      params.set('timeMin', timeMin.toISOString());
    }
    if (timeMax) {
      params.set('timeMax', timeMax.toISOString());
    }

    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }

    const data = await response.json();
    
    return (data.items || []).map((item: any) => this.convertGoogleEvent(item));
  }

  async createEvent(event: Partial<CalendarEvent>, calendarId: string = 'primary'): Promise<CalendarEvent> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const googleEvent = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.start?.toISOString(),
      },
      end: {
        dateTime: event.end?.toISOString(),
      },
      attendees: event.attendees?.map(email => ({ email })),
    };

    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create event');
    }

    const data = await response.json();
    return this.convertGoogleEvent(data);
  }

  async updateEvent(eventId: string, event: Partial<CalendarEvent>, calendarId: string = 'primary'): Promise<CalendarEvent> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const googleEvent = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: event.start ? { dateTime: event.start.toISOString() } : undefined,
      end: event.end ? { dateTime: event.end.toISOString() } : undefined,
      attendees: event.attendees?.map(email => ({ email })),
    };

    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update event');
    }

    const data = await response.json();
    return this.convertGoogleEvent(data);
  }

  async deleteEvent(eventId: string, calendarId: string = 'primary'): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
  }

  private convertGoogleEvent(item: any): CalendarEvent {
    const start = item.start?.dateTime || item.start?.date;
    const end = item.end?.dateTime || item.end?.date;

    return {
      id: item.id,
      title: item.summary || 'Untitled',
      description: item.description,
      start: new Date(start),
      end: new Date(end),
      type: 'google',
      status: item.status === 'confirmed' ? 'completed' : 'pending',
      location: item.location,
      attendees: item.attendees?.map((a: any) => a.email),
      recurrence: item.recurrence?.[0],
      source: 'google',
      metadata: {
        htmlLink: item.htmlLink,
        creator: item.creator,
        created: item.created,
        updated: item.updated,
      },
    };
  }
}

// Singleton instance
export const googleCalendarAPI = new GoogleCalendarAPI();
