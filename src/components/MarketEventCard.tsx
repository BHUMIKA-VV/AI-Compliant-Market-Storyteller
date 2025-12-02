import { MarketEvent } from '../lib/supabase';
import { TrendingUp, DollarSign, AlertCircle, Activity } from 'lucide-react';

interface MarketEventCardProps {
  event: MarketEvent;
  onSelect: (event: MarketEvent) => void;
  isSelected: boolean;
}

export function MarketEventCard({ event, onSelect, isSelected }: MarketEventCardProps) {
  const getEventIcon = () => {
    switch (event.event_type) {
      case 'earnings_release':
        return <DollarSign className="w-5 h-5" />;
      case 'economic_indicator':
        return <TrendingUp className="w-5 h-5" />;
      case 'market_volatility':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getEventTitle = () => {
    const data = event.event_data;
    switch (event.event_type) {
      case 'earnings_release':
        return `${data.company} (${event.ticker}) - ${data.quarter} Earnings`;
      case 'economic_indicator':
        return `${data.indicator} Update - ${data.value}%`;
      case 'market_volatility':
        return `Market Volatility Alert - VIX ${data.current}`;
      default:
        return event.event_type;
    }
  };

  const getEventDescription = () => {
    const data = event.event_data;
    switch (event.event_type) {
      case 'earnings_release':
        return `EPS: $${data.eps} (Est. $${data.eps_estimate}) | Revenue: ${data.revenue}`;
      case 'economic_indicator':
        return `${data.description} (Prev: ${data.previous}%, Exp: ${data.expected}%)`;
      case 'market_volatility':
        return `${data.trigger} | Market sentiment: ${data.market_sentiment}`;
      default:
        return 'Market event';
    }
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <div
      onClick={() => onSelect(event)}
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
          {getEventIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">{getEventTitle()}</h3>
          <p className="text-xs text-gray-600 mb-2">{getEventDescription()}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{timeAgo(event.event_date)}</span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
              {event.event_type.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
