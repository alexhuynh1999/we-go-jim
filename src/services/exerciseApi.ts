import type { ExerciseType } from '@/types/workout';

export interface ApiExercise {
  name: string;
  type: string;
  muscle: string;
  difficulty: string;
  instructions: string;
  equipments: string[];
  safety_info: string;
}

const API_BASE = 'https://api.api-ninjas.com/v1';
const apiKey = import.meta.env.VITE_API_NINJAS_KEY as string | undefined;

export const isExerciseApiConfigured = !!apiKey;

/**
 * Infer the app's ExerciseType from the API's equipments array.
 *
 * Mapping:
 *  - "barbell", "ez curl bar", "olympic barbell" → 'barbell'
 *  - "dumbbell" → 'dumbbell'
 *  - "body only" or empty → 'bodyweight'
 *  - everything else (cable, machine, smith machine, …) → 'machine'
 */
export const inferExerciseType = (equipments: string[]): ExerciseType => {
  const joined = equipments.join(' ').toLowerCase();

  if (
    joined.includes('barbell') ||
    joined.includes('ez curl bar') ||
    joined.includes('olympic barbell')
  ) {
    return 'barbell';
  }

  if (joined.includes('dumbbell')) {
    return 'dumbbell';
  }

  if (joined.includes('body only') || equipments.length === 0) {
    return 'bodyweight';
  }

  return 'machine';
};

// ---------------------------------------------------------------------------
// API search with in-memory cache
// ---------------------------------------------------------------------------

/** In-memory, session-scoped cache keyed by normalised query string. */
const cache = new Map<string, ApiExercise[]>();

/**
 * Search exercises by name via the API Ninjas Exercises API.
 * Returns up to 5 results per the free-tier limit.
 *
 * API results are cached in memory for the duration of the session so repeated
 * or incremental searches don't trigger extra network requests.
 *
 * Returns an empty array when the API key is missing or on network errors.
 */
export interface SearchResult {
  exercises: ApiExercise[];
  error?: string;
}

export const searchExercises = async (
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult> => {
  if (!apiKey) {
    console.warn(
      'API Ninjas key is not configured. Add VITE_API_NINJAS_KEY to your .env file.',
    );
    return { exercises: [] };
  }

  const trimmed = query.trim();
  if (!trimmed) return { exercises: [] };

  const key = trimmed.toLowerCase();
  const cached = cache.get(key);
  if (cached) return { exercises: cached };

  try {
    const url = `${API_BASE}/exercises?name=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url, {
      headers: { 'X-Api-Key': apiKey },
      signal,
    });

    if (!res.ok) {
      let errorMsg = `Exercise API returned ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson?.error) errorMsg = errJson.error;
      } catch {
        // Response wasn't JSON -- use the default message
      }

      console.warn(errorMsg);
      return { exercises: [], error: errorMsg };
    }

    const data: ApiExercise[] = await res.json();
    cache.set(key, data);
    return { exercises: data };
  } catch (err) {
    if ((err as Error).name === 'AbortError') return { exercises: [] };
    console.warn('Exercise API request failed:', err);
    return { exercises: [], error: 'Exercise search is temporarily unavailable.' };
  }
};
