// components/ErrorMessage.tsx
import type { ApiError } from '@/types/wine';

const ERROR_MESSAGES: Record<ApiError['error'], string> = {
  cellartracker_unavailable:
    'Could not reach CellarTracker. Check your connection and try refreshing.',
  pairing_unavailable:
    'The pairing service is temporarily unavailable. Try again in a moment.',
  no_inventory:
    'No bottles found in your cellar. Try refreshing to sync the latest data.',
  parse_error:
    'There was a problem processing the response. Try again.',
};

type Props = { error: ApiError['error'] };

export function ErrorMessage({ error }: Props) {
  return (
    <p data-testid="error-message" className="error-message" role="alert">
      {ERROR_MESSAGES[error]}
    </p>
  );
}
