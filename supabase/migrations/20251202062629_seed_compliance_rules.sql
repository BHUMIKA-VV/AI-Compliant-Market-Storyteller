/*
  # Seed Compliance Rules
  
  Populate the compliance_rules table with key regulatory requirements
  from SEC Reg BI, FINRA 2210, and MiFID II
*/

INSERT INTO compliance_rules (rule_name, rule_category, rule_description, rule_logic, severity, is_active)
VALUES
  (
    'Anti-Misrepresentation',
    'SEC_REG_BI',
    'Prohibits false or misleading statements about investment performance, risks, or recommendations',
    '{"triggers": ["guarantee", "risk-free", "cannot lose", "will definitely"], "action": "reject", "message": "Contains prohibited guarantee language"}'::jsonb,
    'high',
    true
  ),
  (
    'Balanced Presentation',
    'FINRA_2210',
    'Requires balanced disclosure of risks and benefits',
    '{"requires": ["risk disclosure"], "action": "require_disclaimer", "disclaimer": "Past performance does not guarantee future results. All investments carry risk."}'::jsonb,
    'high',
    true
  ),
  (
    'Performance Claims',
    'FINRA_2210',
    'Performance projections must be based on factual data and include appropriate disclaimers',
    '{"triggers": ["projected return", "expected gain", "anticipated growth"], "action": "require_disclaimer", "disclaimer": "Projections are hypothetical and not guaranteed."}'::jsonb,
    'high',
    true
  ),
  (
    'Suitability Check',
    'SEC_REG_BI',
    'Recommendations must be suitable for client risk profile and objectives',
    '{"requires": ["client_risk_profile", "product_risk_level"], "action": "validate_match"}'::jsonb,
    'high',
    true
  ),
  (
    'Omitting Material Facts',
    'SEC_REG_BI',
    'Material information cannot be omitted from communications',
    '{"requires": ["fee_disclosure", "conflict_disclosure"], "action": "require_disclaimer"}'::jsonb,
    'high',
    true
  ),
  (
    'Promotional Language',
    'FINRA_2210',
    'Prohibits exaggerated or unwarranted claims',
    '{"triggers": ["best investment", "cant miss", "once in a lifetime", "guaranteed profits"], "action": "reject"}'::jsonb,
    'medium',
    true
  ),
  (
    'Source Attribution',
    'FINRA_2210',
    'All factual claims must include proper source attribution',
    '{"requires": ["data_source"], "action": "require_citation"}'::jsonb,
    'medium',
    true
  ),
  (
    'Product Segmentation',
    'MIFID_II',
    'Complex products must only be marketed to eligible investor classes',
    '{"requires": ["client_segment", "product_complexity"], "action": "validate_eligibility"}'::jsonb,
    'high',
    true
  )
ON CONFLICT DO NOTHING;