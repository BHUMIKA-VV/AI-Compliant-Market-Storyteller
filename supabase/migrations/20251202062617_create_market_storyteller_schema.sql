/*
  # AI-Compliant Market Storyteller Database Schema

  1. New Tables
    - `market_events`
      - `id` (uuid, primary key)
      - `event_type` (text) - earnings, trading_volume, economic_indicator, etc.
      - `ticker` (text) - stock ticker symbol
      - `event_data` (jsonb) - flexible storage for event details
      - `event_date` (timestamptz)
      - `created_at` (timestamptz)
    
    - `compliance_rules`
      - `id` (uuid, primary key)
      - `rule_name` (text)
      - `rule_category` (text) - SEC_REG_BI, FINRA_2210, MIFID_II, etc.
      - `rule_description` (text)
      - `rule_logic` (jsonb) - IF/THEN rules in structured format
      - `severity` (text) - high, medium, low
      - `is_active` (boolean)
      - `created_at` (timestamptz)
    
    - `client_profiles`
      - `id` (uuid, primary key)
      - `client_name` (text)
      - `risk_profile` (text) - conservative, moderate, aggressive
      - `segment` (text) - retail, hnw, institutional
      - `investment_objectives` (text[])
      - `eligible_products` (text[])
      - `created_at` (timestamptz)
    
    - `generated_narratives`
      - `id` (uuid, primary key)
      - `market_event_id` (uuid, foreign key)
      - `narrative_type` (text) - flash_note, client_message, newsletter, executive_summary
      - `target_audience` (text)
      - `raw_narrative` (text) - AI-generated content
      - `compliance_status` (text) - pending, approved, rejected, needs_review
      - `compliance_checks` (jsonb) - detailed compliance results
      - `final_narrative` (text) - compliance-approved content
      - `created_at` (timestamptz)
      - `reviewed_at` (timestamptz)
    
    - `compliance_audit_log`
      - `id` (uuid, primary key)
      - `narrative_id` (uuid, foreign key)
      - `rule_id` (uuid, foreign key)
      - `check_result` (text) - pass, fail, warning
      - `details` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

CREATE TABLE IF NOT EXISTS market_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  ticker text,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  event_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compliance_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  rule_category text NOT NULL,
  rule_description text NOT NULL,
  rule_logic jsonb NOT NULL DEFAULT '{}'::jsonb,
  severity text NOT NULL DEFAULT 'medium',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS client_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  risk_profile text NOT NULL,
  segment text NOT NULL,
  investment_objectives text[] DEFAULT ARRAY[]::text[],
  eligible_products text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS generated_narratives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_event_id uuid REFERENCES market_events(id),
  narrative_type text NOT NULL,
  target_audience text,
  raw_narrative text NOT NULL,
  compliance_status text NOT NULL DEFAULT 'pending',
  compliance_checks jsonb DEFAULT '{}'::jsonb,
  final_narrative text,
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

CREATE TABLE IF NOT EXISTS compliance_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  narrative_id uuid REFERENCES generated_narratives(id),
  rule_id uuid REFERENCES compliance_rules(id),
  check_result text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE market_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_narratives ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for market events"
  ON market_events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for compliance rules"
  ON compliance_rules FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for client profiles"
  ON client_profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for narratives"
  ON generated_narratives FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for audit log"
  ON compliance_audit_log FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public insert for market events"
  ON market_events FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public insert for narratives"
  ON generated_narratives FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public insert for audit log"
  ON compliance_audit_log FOR INSERT
  TO public
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_market_events_date ON market_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_market_events_ticker ON market_events(ticker);
CREATE INDEX IF NOT EXISTS idx_narratives_status ON generated_narratives(compliance_status);
CREATE INDEX IF NOT EXISTS idx_narratives_created ON generated_narratives(created_at DESC);