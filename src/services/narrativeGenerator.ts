import { MarketEvent, ClientProfile } from '../lib/supabase';

export interface GenerationOptions {
  narrativeType: 'flash_note' | 'client_message' | 'newsletter' | 'executive_summary';
  targetAudience?: string;
  clientProfile?: ClientProfile;
}

export function generateMarketNarrative(
  event: MarketEvent,
  options: GenerationOptions
): string {
  const { event_type, ticker, event_data } = event;

  switch (event_type) {
    case 'earnings_release':
      return generateEarningsNarrative(ticker, event_data, options);
    case 'economic_indicator':
      return generateEconomicNarrative(event_data, options);
    case 'market_volatility':
      return generateVolatilityNarrative(event_data, options);
    default:
      return generateGenericNarrative(event, options);
  }
}

function generateEarningsNarrative(
  ticker: string | null,
  data: Record<string, unknown>,
  options: GenerationOptions
): string {
  const company = data.company as string;
  const quarter = data.quarter as string;
  const eps = data.eps as number;
  const epsEstimate = data.eps_estimate as number;
  const revenue = data.revenue as string;
  const beatEstimate = data.beat_estimate as boolean;
  const highlights = data.key_highlights as string[];

  const performance = beatEstimate ? 'exceeded' : 'missed';
  const sentiment = beatEstimate ? 'strong' : 'mixed';

  if (options.narrativeType === 'flash_note') {
    return `FLASH NOTE: ${company} (${ticker}) ${quarter} Earnings

${company} reported ${quarter} results that ${performance} analyst expectations. The company posted earnings per share of $${eps} versus estimates of $${epsEstimate}, with revenue reaching ${revenue}.

Key Highlights:
${highlights.map(h => `• ${h}`).join('\n')}

Market Reaction: The results reflect ${sentiment} operational performance in the current market environment.

This analysis is based on publicly available earnings data. Past performance does not guarantee future results. All investments carry risk.`;
  }

  if (options.narrativeType === 'client_message') {
    const clientName = options.clientProfile?.client_name || 'Valued Client';
    return `Dear ${clientName},

We wanted to update you on recent developments with ${company} (${ticker}), which reported ${quarter} earnings earlier today.

The company ${performance} expectations with earnings of $${eps} per share. Revenue came in at ${revenue}. Notable highlights include ${highlights.slice(0, 2).join(' and ')}.

${options.clientProfile?.risk_profile === 'conservative'
  ? 'Given your conservative investment strategy, we continue to monitor the stability and dividend safety of portfolio holdings.'
  : 'We will continue to evaluate how this development aligns with your investment objectives.'}

As always, we are here to discuss any questions you may have about your portfolio.

This communication is for informational purposes only and does not constitute investment advice. Past performance does not guarantee future results.`;
  }

  return `${company} ${quarter} Earnings: ${performance === 'exceeded' ? 'Beat' : 'Miss'}

${company} reported ${quarter} earnings with EPS of $${eps} (est. $${epsEstimate}) and revenue of ${revenue}. Key developments include ${highlights.join(', ')}.`;
}

function generateEconomicNarrative(
  data: Record<string, unknown>,
  options: GenerationOptions
): string {
  const indicator = data.indicator as string;
  const value = data.value as number;
  const previous = data.previous as number;
  const expected = data.expected as number;
  const direction = data.direction as string;
  const impact = data.impact as string;
  const description = data.description as string;

  const trend = direction === 'down' ? 'declined' : 'increased';
  const compared = value < expected ? 'below' : 'above';

  if (options.narrativeType === 'executive_summary') {
    return `ECONOMIC UPDATE: ${indicator}

The latest ${indicator} reading came in at ${value}%, ${trend} from ${previous}% and ${compared} the expected ${expected}%. ${description}

Market Impact: This data is viewed as ${impact} for equity markets, suggesting ${direction === 'down' ? 'easing inflationary pressures' : 'continued economic strength'}.

Strategic Implications: ${direction === 'down' ? 'May support more accommodative monetary policy.' : 'Could influence central bank policy decisions.'}

Data source: Bureau of Labor Statistics. Economic indicators are subject to revision.`;
  }

  return `${indicator} Update: ${description}

The ${indicator} ${trend} to ${value}% from ${previous}%, coming in ${compared} expectations of ${expected}%. This development is generally viewed as ${impact} for markets.

Economic data is subject to revision and should be considered as one of many factors in investment decisions.`;
}

function generateVolatilityNarrative(
  data: Record<string, unknown>,
  options: GenerationOptions
): string {
  const current = data.current as number;
  const previous = data.previous_close as number;
  const changePercent = data.change_percent as number;
  const trigger = data.trigger as string;
  const sentiment = data.market_sentiment as string;

  return `Market Volatility Update

Market volatility has increased, with the VIX rising ${changePercent.toFixed(1)}% to ${current}, triggered by ${trigger}. Current market sentiment is ${sentiment}.

Context: Elevated volatility is a normal part of market cycles and can present both risks and opportunities depending on individual circumstances and time horizons.

Investors should maintain a long-term perspective and avoid making emotional decisions during periods of increased volatility. This is not a recommendation to buy or sell any security.`;
}

function generateGenericNarrative(
  event: MarketEvent,
  options: GenerationOptions
): string {
  return `Market Update: ${event.event_type}

Recent market activity related to ${event.ticker || 'broader markets'} on ${new Date(event.event_date).toLocaleDateString()}.

This information is provided for educational purposes only and does not constitute investment advice. All investments carry risk.`;
}
