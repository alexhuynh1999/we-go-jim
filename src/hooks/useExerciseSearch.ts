import { useEffect, useRef, useState } from 'react';
import {
  searchExercises,
  isExerciseApiConfigured,
  type ApiExercise,
} from '@/services/exerciseApi';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

interface UseExerciseSearchResult {
  results: ApiExercise[];
  loading: boolean;
  error: string | null;
}

/**
 * Debounced exercise search hook.
 *
 * Waits 300ms after the last keystroke before firing an API request.
 * Cancels in-flight requests when the query changes (AbortController).
 * Returns empty results when the query is under 2 characters or the API key
 * is missing.
 */
export const useExerciseSearch = (query: string): UseExerciseSearchResult => {
  const [results, setResults] = useState<ApiExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    // Reset immediately when query is too short or API is not configured
    if (trimmed.length < MIN_QUERY_LENGTH || !isExerciseApiConfigured) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    const timer = setTimeout(() => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      searchExercises(trimmed, controller.signal).then((result) => {
        // Only update state if this request wasn't aborted
        if (!controller.signal.aborted) {
          setResults(result.exercises);
          setError(result.error ?? null);
          setLoading(false);
        }
      });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query]);

  return { results, loading, error };
};
