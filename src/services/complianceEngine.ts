import { ComplianceRule, ClientProfile } from '../lib/supabase';

export interface ComplianceCheckResult {
  passed: boolean;
  status: 'approved' | 'rejected' | 'needs_review';
  violations: ComplianceViolation[];
  warnings: ComplianceWarning[];
  requiredDisclaimers: string[];
  autoCorrections: string[];
}

export interface ComplianceViolation {
  ruleId: string;
  ruleName: string;
  severity: string;
  message: string;
  category: string;
}

export interface ComplianceWarning {
  ruleId: string;
  ruleName: string;
  message: string;
}

export function runComplianceChecks(
  narrative: string,
  rules: ComplianceRule[],
  clientProfile?: ClientProfile
): ComplianceCheckResult {
  const violations: ComplianceViolation[] = [];
  const warnings: ComplianceWarning[] = [];
  const requiredDisclaimers: string[] = [];
  const autoCorrections: string[] = [];

  const narrativeLower = narrative.toLowerCase();

  for (const rule of rules) {
    if (!rule.is_active) continue;

    const logic = rule.rule_logic as {
      triggers?: string[];
      requires?: string[];
      action?: string;
      message?: string;
      disclaimer?: string;
    };

    if (logic.triggers) {
      for (const trigger of logic.triggers) {
        if (narrativeLower.includes(trigger.toLowerCase())) {
          if (logic.action === 'reject') {
            violations.push({
              ruleId: rule.id,
              ruleName: rule.rule_name,
              severity: rule.severity,
              message: logic.message || `Contains prohibited language: "${trigger}"`,
              category: rule.rule_category,
            });
          } else if (logic.action === 'require_disclaimer' && logic.disclaimer) {
            requiredDisclaimers.push(logic.disclaimer);
            autoCorrections.push(`Added disclaimer for: ${rule.rule_name}`);
          }
        }
      }
    }

    if (logic.requires) {
      for (const requirement of logic.requires) {
        if (requirement === 'risk disclosure') {
          if (!narrativeLower.includes('risk') && !narrativeLower.includes('disclaimer')) {
            if (rule.severity === 'high') {
              violations.push({
                ruleId: rule.id,
                ruleName: rule.rule_name,
                severity: rule.severity,
                message: 'Missing required risk disclosure',
                category: rule.rule_category,
              });
            } else {
              warnings.push({
                ruleId: rule.id,
                ruleName: rule.rule_name,
                message: 'Consider adding risk disclosure',
              });
            }
          }
        }

        if (requirement === 'client_risk_profile' && clientProfile) {
          if (
            narrativeLower.includes('aggressive') &&
            clientProfile.risk_profile === 'conservative'
          ) {
            violations.push({
              ruleId: rule.id,
              ruleName: rule.rule_name,
              severity: 'high',
              message: 'Content not suitable for client risk profile',
              category: rule.rule_category,
            });
          }
        }
      }
    }
  }

  const hasHighSeverityViolations = violations.some((v) => v.severity === 'high');

  return {
    passed: violations.length === 0,
    status: hasHighSeverityViolations ? 'rejected' : violations.length > 0 ? 'needs_review' : 'approved',
    violations,
    warnings,
    requiredDisclaimers: [...new Set(requiredDisclaimers)],
    autoCorrections,
  };
}

export function applyComplianceCorrections(
  narrative: string,
  checkResult: ComplianceCheckResult
): string {
  let correctedNarrative = narrative;

  if (checkResult.requiredDisclaimers.length > 0) {
    const disclaimers = checkResult.requiredDisclaimers
      .map((d) => `\n\nDISCLAIMER: ${d}`)
      .join('');
    correctedNarrative += disclaimers;
  }

  return correctedNarrative;
}

export function getComplianceStatusColor(status: string): string {
  switch (status) {
    case 'approved':
      return 'text-green-700 bg-green-50 border-green-200';
    case 'rejected':
      return 'text-red-700 bg-red-50 border-red-200';
    case 'needs_review':
      return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
  }
}

export function getComplianceStatusIcon(status: string): string {
  switch (status) {
    case 'approved':
      return '✓';
    case 'rejected':
      return '✗';
    case 'needs_review':
      return '⚠';
    default:
      return '○';
  }
}
