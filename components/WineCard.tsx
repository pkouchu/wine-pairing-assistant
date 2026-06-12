// components/WineCard.tsx
import type { PairingResult } from '@/types/wine';

type Props = { result: PairingResult };

const CONFIDENCE_LABELS = {
  high: '★★★ High confidence',
  medium: '★★☆ Good match',
  low: '★☆☆ Worth considering',
} as const;

export function WineCard({ result }: Props) {
  const { wine, rationale, confidence } = result;
  const vintage = wine.vintage !== null ? wine.vintage : 'N.V.';
  const price = wine.price !== null ? `$${wine.price.toFixed(2)}` : null;

  return (
    <div data-testid="wine-card" className="wine-card">
      <div className="wine-card-header">
        <h3 className="wine-name">
          {vintage} {wine.name}
        </h3>
        <span className="confidence-badge" data-confidence={confidence}>
          {CONFIDENCE_LABELS[confidence]}
        </span>
      </div>
      <p className="wine-meta">
        {wine.varietal}
        {wine.location ? ` · ${wine.location}` : ''}
        {price ? ` · ${price}` : ''}
        {` · ${wine.quantity} bottle${wine.quantity !== 1 ? 's' : ''}`}
      </p>
      <p className="wine-rationale">{rationale}</p>
    </div>
  );
}
