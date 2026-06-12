// components/MealInput.tsx
import { useState, type FormEvent } from 'react';

type Props = {
  onSubmit: (meal: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
};

export function MealInput({ onSubmit, onRefresh, isLoading }: Props) {
  const [meal, setMeal] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (meal.trim()) onSubmit(meal.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="meal-form">
      <label htmlFor="meal-input" className="meal-label">
        What are you eating?
      </label>
      <textarea
        id="meal-input"
        aria-label="meal"
        value={meal}
        onChange={(e) => setMeal(e.target.value)}
        placeholder="e.g. braised short ribs with chimichurri"
        rows={3}
        className="meal-textarea"
        disabled={isLoading}
      />
      <div className="meal-actions">
        <button
          type="submit"
          disabled={isLoading || !meal.trim()}
          className="btn btn-primary"
        >
          {isLoading ? 'Finding pairings…' : 'Find a pairing'}
        </button>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="btn btn-secondary"
        >
          Refresh cellar
        </button>
      </div>
    </form>
  );
}
