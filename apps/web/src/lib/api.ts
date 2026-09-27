import {
  DashboardSummary,
  RecurringStream,
  Transaction,
  CancellationGuide,
  EmailDraft,
  UserProfile
} from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private token: string | null = null;
  private demoUserId: string = 'usr_demo_portfolio_user';
  private demoUserName: string = 'Parthasarathi';

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('spendleak_auth_token');
      this.demoUserId = localStorage.getItem('spendleak_demo_user_id') || 'usr_demo_portfolio_user';
      this.demoUserName = localStorage.getItem('spendleak_demo_user_name') || 'Parthasarathi';
    }
  }

  setAuthToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('spendleak_auth_token', token);
      } else {
        localStorage.removeItem('spendleak_auth_token');
      }
    }
  }

  getAuthToken() {
    return this.token;
  }

  setDemoUserId(userId: string, userName?: string) {
    this.demoUserId = userId;
    if (typeof window !== 'undefined') {
      localStorage.setItem('spendleak_demo_user_id', userId);
      if (userName) {
        this.demoUserName = userName;
        localStorage.setItem('spendleak_demo_user_name', userName);
      }
    }
  }

  getDemoUserId() {
    return this.demoUserId;
  }

  getDemoUserName() {
    return this.demoUserName;
  }

  private getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      ...extraHeaders,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    } else {
      headers['X-Demo-User-Id'] = this.demoUserId;
    }

    return headers;
  }

  async getMe(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return res.json();
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/api/v1/dashboard/summary`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    return res.json();
  }

  async getRecurringStreams(status?: string, category?: string): Promise<RecurringStream[]> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (category && category !== 'All') params.append('category', category);

    const url = `${API_BASE}/api/v1/recurring-streams${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch recurring streams');
    return res.json();
  }

  async getRecurringStream(streamId: string): Promise<RecurringStream> {
    const res = await fetch(`${API_BASE}/api/v1/recurring-streams/${streamId}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch stream details');
    return res.json();
  }

  async submitStreamDecision(
    streamId: string,
    action: 'keep' | 'review' | 'cancel' | 'not_subscription' | 'remind_later',
    notes?: string,
    reminderDate?: string
  ): Promise<RecurringStream> {
    const res = await fetch(`${API_BASE}/api/v1/recurring-streams/${streamId}/decision`, {
      method: 'POST',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ action, notes, reminder_date: reminderDate }),
    });
    if (!res.ok) throw new Error('Failed to update subscription decision');
    return res.json();
  }

  async getAIExplanation(streamId: string): Promise<{ explanation: string }> {
    const res = await fetch(`${API_BASE}/api/v1/recurring-streams/${streamId}/ai-explanation`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to generate AI explanation');
    return res.json();
  }

  async getCancellationGuide(streamId: string): Promise<CancellationGuide> {
    const res = await fetch(`${API_BASE}/api/v1/cancellation/guide/${streamId}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch cancellation guide');
    return res.json();
  }

  async recordCancellationCase(
    streamId: string,
    channel: string,
    notes?: string,
    reminderDate?: string
  ) {
    const res = await fetch(`${API_BASE}/api/v1/cancellation/case/${streamId}`, {
      method: 'POST',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ channel, notes, reminder_date: reminderDate }),
    });
    if (!res.ok) throw new Error('Failed to record cancellation case');
    return res.json();
  }

  async draftCancellationEmail(
    streamId: string,
    name: string,
    emailOrId: string,
    reason: string
  ): Promise<EmailDraft> {
    const res = await fetch(`${API_BASE}/api/v1/cancellation/draft-email/${streamId}`, {
      method: 'POST',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        account_holder_name: name,
        account_email_or_id: emailOrId,
        reason,
      }),
    });
    if (!res.ok) throw new Error('Failed to draft cancellation email');
    return res.json();
  }

  async uploadCSV(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/v1/imports/csv`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Failed to upload CSV');
    }
    return res.json();
  }

  async loadDemoData() {
    const res = await fetch(`${API_BASE}/api/v1/imports/load-demo`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load demo data');
    return res.json();
  }

  async resetData() {
    const res = await fetch(`${API_BASE}/api/v1/imports/reset`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to reset data');
    return res.json();
  }

  async getTransactions(
    page: number = 1,
    limit: number = 50,
    search?: string,
    category?: string,
    direction?: string
  ): Promise<Transaction[]> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (category && category !== 'All') params.append('category', category);
    if (direction) params.append('direction', direction);

    const res = await fetch(`${API_BASE}/api/v1/transactions?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  }

  async createManualTransaction(data: {
    transaction_date: string;
    amount: number;
    raw_description: string;
    category?: string;
    direction?: 'debit' | 'credit';
  }): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/api/v1/transactions/manual`, {
      method: 'POST',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create transaction');
    return res.json();
  }

  async deleteTransaction(transactionId: string) {
    const res = await fetch(`${API_BASE}/api/v1/transactions/${transactionId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete transaction');
    return res.json();
  }
}

export const api = new ApiClient();
