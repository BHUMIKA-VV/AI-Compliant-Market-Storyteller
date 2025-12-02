import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If env vars are provided, use real Supabase client. Otherwise provide
// a lightweight in-memory mock so the app can run as a local POC.
let supabaseClient: any = null;

if (supabaseUrl && supabaseKey) {
  supabaseClient = createClient(supabaseUrl, supabaseKey);
} else {
  // Mock data reflecting seeded SQL (small subset)
  const mockMarketEvents = [
    {
      id: '1',
      event_type: 'earnings_release',
      ticker: 'AAPL',
      event_data: {
        company: 'Apple Inc.',
        quarter: 'Q4 2024',
        eps: 2.18,
        eps_estimate: 2.1,
        revenue: '124.3B',
        revenue_estimate: '122.5B',
        beat_estimate: true,
        key_highlights: ['iPhone sales up 8%', 'Services revenue record high', 'Strong guidance for Q1 2025'],
      },
      event_date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      event_type: 'earnings_release',
      ticker: 'MSFT',
      event_data: {
        company: 'Microsoft Corp.',
        quarter: 'Q4 2024',
        eps: 3.45,
        eps_estimate: 3.30,
        revenue: '62.1B',
        revenue_estimate: '60.8B',
        beat_estimate: true,
        key_highlights: ['Azure growth accelerates', 'Office subscription uptake', 'Strong enterprise demand'],
      },
      event_date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '5',
      event_type: 'earnings_release',
      ticker: 'NFLX',
      event_data: {
        company: 'Netflix, Inc.',
        quarter: 'Q4 2024',
        eps: 1.12,
        eps_estimate: 1.05,
        revenue: '8.9B',
        revenue_estimate: '8.7B',
        beat_estimate: true,
        key_highlights: ['Subscriber additions beat estimates', 'Ad-tier growth continues'],
      },
      event_date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '6',
      event_type: 'economic_indicator',
      ticker: null,
      event_data: {
        indicator: 'Unemployment Rate',
        value: 4.1,
        previous: 4.2,
        expected: 4.1,
        direction: 'down',
        impact: 'mixed',
        description: 'Labor market remains tight but cooling slightly',
      },
      event_date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '7',
      event_type: 'corporate_action',
      ticker: 'ORCL',
      event_data: {
        company: 'Oracle Corp.',
        action: 'acquisition',
        target: 'Smaller Analytics Co',
        details: 'Announced acquisition to strengthen cloud analytics offerings',
      },
      event_date: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      event_type: 'economic_indicator',
      ticker: 'SPY',
      event_data: {
        indicator: 'CPI',
        value: 3.2,
        previous: 3.4,
        expected: 3.3,
        direction: 'down',
        impact: 'positive',
        description: 'Inflation continues to moderate',
      },
      event_date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      event_type: 'market_volatility',
      ticker: 'VIX',
      event_data: {
        previous_close: 14.2,
        current: 16.8,
        change_percent: 18.3,
        trigger: 'Fed commentary',
        market_sentiment: 'cautious',
      },
      event_date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      created_at: new Date().toISOString(),
    },
  ];

  const mockComplianceRules = [
    {
      id: 'r1',
      rule_name: 'Anti-Misrepresentation',
      rule_category: 'SEC_REG_BI',
      rule_description: 'Prohibits false or misleading statements',
      rule_logic: { triggers: ['guarantee', 'risk-free', 'cannot lose', 'will definitely'], action: 'reject', message: 'Contains prohibited guarantee language' },
      severity: 'high',
      is_active: true,
    },
    {
      id: 'r2',
      rule_name: 'Balanced Presentation',
      rule_category: 'FINRA_2210',
      rule_description: 'Requires balanced disclosure of risks and benefits',
      rule_logic: { requires: ['risk disclosure'], action: 'require_disclaimer', disclaimer: 'Past performance does not guarantee future results. All investments carry risk.' },
      severity: 'high',
      is_active: true,
    },
  ];

  const mockClientProfiles = [
    { id: 'c1', client_name: 'Conservative Retail Client', risk_profile: 'conservative', segment: 'retail', investment_objectives: ['capital preservation', 'income generation'], eligible_products: ['bonds', 'dividend stocks'] },
    { id: 'c2', client_name: 'Moderate HNW Client', risk_profile: 'moderate', segment: 'hnw', investment_objectives: ['balanced growth'], eligible_products: ['stocks', 'bonds'] },
  ];

  const mockInsertLog: any[] = [];

  // Simple query builder supporting select/order/eq/insert chains used in Dashboard
  function from(table: string) {
    const state: any = { table, filters: {} };

    const builder: any = {
      select(_fields?: string) {
        state.select = _fields || '*';
        return builder;
      },
      order(_col: string, _opts?: any) {
        let data: any[] = [];
        if (state.table === 'market_events') data = [...mockMarketEvents];
        if (state.table === 'compliance_rules') data = [...mockComplianceRules];
        if (state.table === 'client_profiles') data = [...mockClientProfiles];

        // apply eq filter if present
        if (state.filters.eqKey) {
          data = data.filter((d) => d[state.filters.eqKey] === state.filters.eqVal);
        }

        // simple ordering: for market_events, sort by event_date desc
        if (state.table === 'market_events') {
          data.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
        }

        return Promise.resolve({ data });
      },
      eq(key: string, val: any) {
        state.filters.eqKey = key;
        state.filters.eqVal = val;
        // return builder so .select().order() chains still work
        return builder;
      },
      insert(payload: any) {
        // simulate insert into generated_narratives or compliance_audit_log
        const entry = Array.isArray(payload) ? payload[0] : payload;
        entry.id = `${Date.now()}`;
        mockInsertLog.push({ table: state.table, entry });
        // for convenience return the entry
        return Promise.resolve({ data: [entry] });
      },
      then(onFulfilled: any) {
        // allow awaiting builder directly if no order/eq called: return table data
        let data: any[] = [];
        if (state.table === 'market_events') data = [...mockMarketEvents];
        if (state.table === 'compliance_rules') data = [...mockComplianceRules];
        if (state.table === 'client_profiles') data = [...mockClientProfiles];
        if (state.filters.eqKey) {
          data = data.filter((d) => d[state.filters.eqKey] === state.filters.eqVal);
        }
        return Promise.resolve({ data }).then(onFulfilled);
      },
    };

    return builder;
  }

  supabaseClient = { from };
}

export const supabase = supabaseClient;

export interface MarketEvent {
  id: string;
  event_type: string;
  ticker: string | null;
  event_data: Record<string, unknown>;
  event_date: string;
  created_at: string;
}

export interface ComplianceRule {
  id: string;
  rule_name: string;
  rule_category: string;
  rule_description: string;
  rule_logic: Record<string, unknown>;
  severity: string;
  is_active: boolean;
}

export interface ClientProfile {
  id: string;
  client_name: string;
  risk_profile: string;
  segment: string;
  investment_objectives: string[];
  eligible_products: string[];
}

export interface GeneratedNarrative {
  id: string;
  market_event_id: string;
  narrative_type: string;
  target_audience: string | null;
  raw_narrative: string;
  compliance_status: string;
  compliance_checks: Record<string, unknown>;
  final_narrative: string | null;
  created_at: string;
  reviewed_at: string | null;
}
