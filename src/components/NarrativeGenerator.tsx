import { useState } from 'react';
import { MarketEvent, ClientProfile } from '../lib/supabase';
import { generateMarketNarrative, GenerationOptions } from '../services/narrativeGenerator';
import { FileText, Users, Mail, BarChart } from 'lucide-react';

interface NarrativeGeneratorProps {
  event: MarketEvent;
  clientProfiles: ClientProfile[];
  onGenerate: (narrative: string, options: GenerationOptions) => void;
}

export function NarrativeGenerator({ event, clientProfiles, onGenerate }: NarrativeGeneratorProps) {
  const [narrativeType, setNarrativeType] = useState<GenerationOptions['narrativeType']>('flash_note');
  const [selectedClient, setSelectedClient] = useState<string>('');

  const handleGenerate = () => {
    const options: GenerationOptions = {
      narrativeType,
      clientProfile: clientProfiles.find((c) => c.id === selectedClient),
    };

    const narrative = generateMarketNarrative(event, options);
    onGenerate(narrative, options);
  };

  const narrativeTypes = [
    { value: 'flash_note', label: 'Flash Note', icon: FileText, description: 'Institutional research brief' },
    { value: 'client_message', label: 'Client Message', icon: Mail, description: 'Personalized communication' },
    { value: 'newsletter', label: 'Newsletter', icon: Users, description: 'Segmented marketing content' },
    { value: 'executive_summary', label: 'Executive Summary', icon: BarChart, description: 'Internal stakeholder update' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Narrative</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {narrativeTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setNarrativeType(type.value as GenerationOptions['narrativeType'])}
                className={`p-4 border rounded-lg text-left transition-all ${
                  narrativeType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 ${narrativeType === type.value ? 'text-blue-700' : 'text-gray-600'}`} />
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{type.label}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{type.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {narrativeType === 'client_message' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Client Profile
          </label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select client profile...</option>
            {clientProfiles.map((client) => (
              <option key={client.id} value={client.id}>
                {client.client_name} ({client.risk_profile} - {client.segment})
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={narrativeType === 'client_message' && !selectedClient}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Generate Narrative
      </button>
    </div>
  );
}
