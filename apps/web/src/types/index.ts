export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  default_currency: string;
  created_at: string;
  supabase_configured: boolean;
}

export interface UpcomingCharge {
  stream_id: string;
  merchant_name: string;
  category: string;
  amount_display: number;
  currency_code: string;
  due_date: string;
  days_until_due: number;
  frequency: string;
  user_status: string;
}

export interface CategorySpend {
  category: string;
  monthly_spend: number;
  annual_spend: number;
  count: number;
}

export interface DashboardSummary {
  currency_code: string;
  total_monthly_spend: number;
  total_annual_spend: number;
  total_recurring_count: number;
  potential_annual_savings: number;
  review_queue_count: number;
  upcoming_charges: UpcomingCharge[];
  category_breakdown: CategorySpend[];
  ai_summary?: string;
}

export interface StreamTransactionEvidence {
  id: string;
  transaction_date: string;
  amount_display: number;
  raw_description: string;
  currency_code: string;
}

export interface RecurringStream {
  id: string;
  user_id: string;
  merchant_name: string;
  merchant_key: string;
  category: string;
  stream_type: string;
  frequency: string;
  expected_interval_days: number;
  amount_minor: number;
  amount_display: number;
  min_amount_display: number;
  max_amount_display: number;
  currency_code: string;
  first_seen_at: string;
  last_seen_at: string;
  predicted_next_charge_at: string;
  occurrence_count: number;
  confidence_score: number;
  leak_score: number;
  annualized_cost_minor: number;
  annualized_cost_display: number;
  user_status: 'detected' | 'keep' | 'review' | 'cancel' | 'not_subscription' | 'remind_later' | 'cancelled';
  detection_reason: string;
  evidence: {
    cadence_label?: string;
    intervals_days?: number[];
    median_interval_days?: number;
    amount_spread_pct?: number;
    scoring_breakdown?: {
      occurrences: number;
      interval_score: number;
      amount_consistency: number;
      merchant_confidence: number;
      recency: number;
    };
  };
  reminder_date?: string;
  cancellation_notes?: string;
  created_at: string;
  updated_at: string;
  transactions?: StreamTransactionEvidence[];
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id?: string;
  import_id?: string;
  transaction_date: string;
  amount_minor: number;
  amount_display: number;
  currency_code: string;
  direction: 'debit' | 'credit';
  raw_description: string;
  normalized_description: string;
  merchant_name: string;
  merchant_key: string;
  category: string;
  payment_rail?: string;
  is_duplicate: boolean;
  created_at: string;
}

export interface CancellationMethod {
  channel: string;
  title: string;
  official_url?: string;
  steps: string[];
}

export interface CancellationGuide {
  merchant_key: string;
  merchant_name: string;
  category: string;
  official_url?: string;
  methods: CancellationMethod[];
  verification_tip: string;
  email_support_available: boolean;
  support_email?: string;
}

export interface EmailDraft {
  subject: string;
  body_text: string;
}
