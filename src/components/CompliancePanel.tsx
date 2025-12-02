import { ComplianceCheckResult, getComplianceStatusColor, getComplianceStatusIcon } from '../services/complianceEngine';
import { Shield, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface CompliancePanelProps {
  checkResult: ComplianceCheckResult | null;
  narrative: string;
  finalNarrative: string;
}

export function CompliancePanel({ checkResult, narrative, finalNarrative }: CompliancePanelProps) {
  if (!checkResult) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Generate a narrative to see compliance check results</p>
      </div>
    );
  }

  const statusColor = getComplianceStatusColor(checkResult.status);
  const statusIcon = getComplianceStatusIcon(checkResult.status);

  return (
    <div className="space-y-4">
      <div className={`border rounded-lg p-4 ${statusColor}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{statusIcon}</span>
          <div>
            <h3 className="font-semibold text-lg capitalize">{checkResult.status.replace('_', ' ')}</h3>
            <p className="text-sm">
              {checkResult.passed
                ? 'All compliance checks passed'
                : `${checkResult.violations.length} violation(s) found`}
            </p>
          </div>
        </div>
      </div>

      {checkResult.violations.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-3">
            <XCircle className="w-5 h-5 text-red-700 mt-0.5" />
            <h4 className="font-semibold text-red-900">Compliance Violations</h4>
          </div>
          <div className="space-y-2">
            {checkResult.violations.map((violation, idx) => (
              <div key={idx} className="bg-white rounded p-3 border border-red-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    violation.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {violation.severity}
                  </span>
                  <span className="text-xs text-gray-600">{violation.category}</span>
                </div>
                <p className="font-medium text-sm text-gray-900">{violation.ruleName}</p>
                <p className="text-sm text-gray-700 mt-1">{violation.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {checkResult.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-700 mt-0.5" />
            <h4 className="font-semibold text-yellow-900">Warnings</h4>
          </div>
          <div className="space-y-2">
            {checkResult.warnings.map((warning, idx) => (
              <div key={idx} className="bg-white rounded p-3 border border-yellow-100">
                <p className="font-medium text-sm text-gray-900">{warning.ruleName}</p>
                <p className="text-sm text-gray-700 mt-1">{warning.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {checkResult.autoCorrections.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-blue-700 mt-0.5" />
            <h4 className="font-semibold text-blue-900">Auto-Corrections Applied</h4>
          </div>
          <ul className="space-y-1">
            {checkResult.autoCorrections.map((correction, idx) => (
              <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{correction}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {checkResult.requiredDisclaimers.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-3">
            <Info className="w-5 h-5 text-gray-700 mt-0.5" />
            <h4 className="font-semibold text-gray-900">Required Disclaimers</h4>
          </div>
          <div className="space-y-2">
            {checkResult.requiredDisclaimers.map((disclaimer, idx) => (
              <p key={idx} className="text-sm text-gray-700 bg-white rounded p-2 border border-gray-200">
                {disclaimer}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Original Narrative</h4>
          <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
            {narrative}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">
            Compliance-Approved Narrative
          </h4>
          <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
            {finalNarrative || narrative}
          </div>
        </div>
      </div>
    </div>
  );
}
