import { useState, useEffect } from 'react';
import { supabase, MarketEvent, ComplianceRule, ClientProfile } from '../lib/supabase';
import { MarketEventCard } from './MarketEventCard';
import { NarrativeGenerator } from './NarrativeGenerator';
import { CompliancePanel } from './CompliancePanel';
import { GenerationOptions } from '../services/narrativeGenerator';
import { runComplianceChecks, applyComplianceCorrections, ComplianceCheckResult } from '../services/complianceEngine';
import { Sparkles, Shield, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const [marketEvents, setMarketEvents] = useState<MarketEvent[]>([]);
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([]);
  const [clientProfiles, setClientProfiles] = useState<ClientProfile[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<MarketEvent | null>(null);
  const [generatedNarrative, setGeneratedNarrative] = useState<string>('');
  const [complianceResult, setComplianceResult] = useState<ComplianceCheckResult | null>(null);
  const [finalNarrative, setFinalNarrative] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [eventsRes, rulesRes, clientsRes] = await Promise.all([
        supabase.from('market_events').select('*').order('event_date', { ascending: false }),
        supabase.from('compliance_rules').select('*').eq('is_active', true),
        supabase.from('client_profiles').select('*'),
      ]);

      if (eventsRes.data) setMarketEvents(eventsRes.data);
      if (rulesRes.data) setComplianceRules(rulesRes.data);
      if (clientsRes.data) setClientProfiles(clientsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleGenerate = async (narrative: string, options: GenerationOptions) => {
    setGeneratedNarrative(narrative);

    const clientProfile = options.clientProfile;
    const result = runComplianceChecks(narrative, complianceRules, clientProfile);
    setComplianceResult(result);

    const correctedNarrative = applyComplianceCorrections(narrative, result);
    setFinalNarrative(correctedNarrative);

    if (selectedEvent) {
      await supabase.from('generated_narratives').insert({
        market_event_id: selectedEvent.id,
        narrative_type: options.narrativeType,
        target_audience: clientProfile?.client_name,
        raw_narrative: narrative,
        compliance_status: result.status,
        compliance_checks: {
          violations: result.violations,
          warnings: result.warnings,
          autoCorrections: result.autoCorrections,
        },
        final_narrative: correctedNarrative,
        reviewed_at: result.status === 'approved' ? new Date().toISOString() : null,
      });

      for (const violation of result.violations) {
        await supabase.from('compliance_audit_log').insert({
          narrative_id: selectedEvent.id,
          rule_id: violation.ruleId,
          check_result: 'fail',
          details: { message: violation.message, severity: violation.severity },
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI-Compliant Market Storyteller</h1>
              <p className="text-sm text-gray-600">Real-Time, Regulator-Ready Market Insights</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Market Events</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{marketEvents.length}</p>
            <p className="text-sm text-gray-600">Active events</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Compliance Rules</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{complianceRules.length}</p>
            <p className="text-sm text-gray-600">Active rules</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Review Time</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">5 min</p>
            <p className="text-sm text-gray-600">vs 360 min manual</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Market Events</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {marketEvents.map((event) => (
                  <MarketEventCard
                    key={event.id}
                    event={event}
                    onSelect={setSelectedEvent}
                    isSelected={selectedEvent?.id === event.id}
                  />
                ))}
              </div>
            </div>

            {selectedEvent && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <NarrativeGenerator
                  event={selectedEvent}
                  clientProfiles={clientProfiles}
                  onGenerate={handleGenerate}
                />
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance Review</h2>
            <CompliancePanel
              checkResult={complianceResult}
              narrative={generatedNarrative}
              finalNarrative={finalNarrative}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
