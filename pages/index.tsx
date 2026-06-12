// pages/index.tsx
import { useState } from 'react';
import type { PairingResult, ApiError } from '@/types/wine';
import { WineCard } from '@/components/WineCard';
import { MealInput } from '@/components/MealInput';
import { ErrorMessage } from '@/components/ErrorMessage';
import Head from 'next/head';

type AppState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'results'; results: PairingResult[] }
  | { status: 'error'; error: ApiError['error'] };

export default function Home() {
  const [state, setState] = useState<AppState>({ status: 'idle' });

  async function handleSubmit(meal: string) {
    setState({ status: 'loading' });
    try {
      const res = await fetch('/api/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal }),
      });
      const body = await res.json();
      if (!res.ok) {
        setState({ status: 'error', error: (body as ApiError).error });
        return;
      }
      setState({ status: 'results', results: body as PairingResult[] });
    } catch {
      setState({ status: 'error', error: 'pairing_unavailable' });
    }
  }

  async function handleRefresh() {
    setState({ status: 'loading' });
    try {
      const res = await fetch('/api/sync?bust=1');
      if (!res.ok) {
        setState({ status: 'error', error: 'cellartracker_unavailable' });
        return;
      }
      setState({ status: 'idle' });
    } catch {
      setState({ status: 'error', error: 'cellartracker_unavailable' });
    }
  }

  return (
    <>
      <Head>
        <title>Wine Pairing Assistant</title>
        <meta name="description" content="Find the right bottle from your cellar for tonight's meal" />
      </Head>
      <main className="container">
        <h1>Wine Pairing Assistant</h1>
        <p className="subtitle">Find the right bottle from your cellar for tonight&apos;s meal.</p>

        <MealInput
          onSubmit={handleSubmit}
          onRefresh={handleRefresh}
          isLoading={state.status === 'loading'}
        />

        {state.status === 'loading' && (
          <div data-testid="loading-skeleton" aria-busy="true">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        )}

        {state.status === 'error' && <ErrorMessage error={state.error} />}

        {state.status === 'results' && (
          <section aria-label="Pairing suggestions">
            {state.results.map((result, i) => (
              <WineCard key={`${result.wine.name}-${i}`} result={result} />
            ))}
          </section>
        )}
      </main>
    </>
  );
}
