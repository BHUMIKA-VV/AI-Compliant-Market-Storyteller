/*
  # Seed Sample Data
  
  Add sample market events and client profiles for demonstration
*/

  (
    'earnings_release',
    'MSFT',
    '{"company": "Microsoft Corp.", "quarter": "Q4 2024", "eps": 3.45, "eps_estimate": 3.30, "revenue": "62.1B", "revenue_estimate": "60.8B", "beat_estimate": true, "key_highlights": ["Azure growth accelerates", "Office subscription uptake", "Strong enterprise demand"]}'::jsonb,
    now() - interval '6 hours'
  ),
  (
    'earnings_release',
    'NFLX',
    '{"company": "Netflix, Inc.", "quarter": "Q4 2024", "eps": 1.12, "eps_estimate": 1.05, "revenue": "8.9B", "revenue_estimate": "8.7B", "beat_estimate": true, "key_highlights": ["Subscriber additions beat estimates", "Ad-tier growth continues"]}'::jsonb,
    now() - interval '8 hours'
  ),
  (
    'economic_indicator',
    null,
    '{"indicator": "Unemployment Rate", "value": 4.1, "previous": 4.2, "expected": 4.1, "direction": "down", "impact": "mixed", "description": "Labor market remains tight but cooling slightly"}'::jsonb,
    now() - interval '12 hours'
  ),
  (
    'corporate_action',
    'ORCL',
    '{"company": "Oracle Corp.", "action": "acquisition", "target": "Smaller Analytics Co", "details": "Announced acquisition to strengthen cloud analytics offerings"}'::jsonb,
    now() - interval '18 hours'
  )
INSERT INTO market_events (event_type, ticker, event_data, event_date)
VALUES
  (
    'earnings_release',
    'AAPL',
    '{"company": "Apple Inc.", "quarter": "Q4 2024", "eps": 2.18, "eps_estimate": 2.10, "revenue": "124.3B", "revenue_estimate": "122.5B", "beat_estimate": true, "key_highlights": ["iPhone sales up 8%", "Services revenue record high", "Strong guidance for Q1 2025"]}'::jsonb,
    now() - interval '2 hours'
  ),
  (
    'economic_indicator',
    'SPY',
    '{"indicator": "CPI", "value": 3.2, "previous": 3.4, "expected": 3.3, "direction": "down", "impact": "positive", "description": "Inflation continues to moderate"}'::jsonb,
    now() - interval '1 day'
  ),
  (
    'market_volatility',
    'VIX',
    '{"previous_close": 14.2, "current": 16.8, "change_percent": 18.3, "trigger": "Fed commentary", "market_sentiment": "cautious"}'::jsonb,
    now() - interval '3 hours'
  ),
  (
    'earnings_release',
    'TSLA',
    '{"company": "Tesla Inc.", "quarter": "Q4 2024", "eps": 0.85, "eps_estimate": 0.95, "revenue": "25.2B", "revenue_estimate": "26.1B", "beat_estimate": false, "key_highlights": ["Cybertruck production ramping", "Energy storage revenue up 40%", "Margin pressure from price cuts"]}'::jsonb,
    now() - interval '5 hours'
  )
ON CONFLICT DO NOTHING;

INSERT INTO client_profiles (client_name, risk_profile, segment, investment_objectives, eligible_products)
VALUES
  (
    'Conservative Retail Client',
    'conservative',
    'retail',
    ARRAY['capital preservation', 'income generation'],
    ARRAY['bonds', 'dividend stocks', 'money market', 'conservative ETFs']
  ),
  (
    'Moderate HNW Client',
    'moderate',
    'hnw',
    ARRAY['balanced growth', 'tax efficiency', 'diversification'],
    ARRAY['stocks', 'bonds', 'ETFs', 'mutual funds', 'REITs', 'alternative investments']
  ),
  (
    'Aggressive Institutional Client',
    'aggressive',
    'institutional',
    ARRAY['maximum growth', 'alpha generation', 'risk tolerance'],
    ARRAY['stocks', 'options', 'futures', 'private equity', 'hedge funds', 'derivatives']
  )
ON CONFLICT DO NOTHING;