"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_JOB,
  DEFAULT_RATE_BOOK,
  RATE_BOOK_STORAGE_KEY,
  parseJob,
  parseRateBook,
  serializeRateBook,
  setRate,
  type JobState,
  type RateBook,
} from "@/lib/flexpack";

/* ------------------------------------------------------------ tiny LS store */

interface Store<T> {
  subscribe: (listener: () => void) => () => void;
  get: () => T;
  getServer: () => T;
  set: (next: T) => void;
}

function createStore<T>(key: string, fallback: T, parse: (raw: string | null) => T, serialize: (value: T) => string): Store<T> {
  let cache: T | null = null;
  const listeners = new Set<() => void>();
  const read = (): T => {
    try {
      return parse(window.localStorage.getItem(key));
    } catch {
      return fallback;
    }
  };
  return {
    subscribe(listener) {
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key !== key) return;
        cache = read();
        listener();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
    get() {
      if (cache === null) cache = read();
      return cache;
    },
    getServer: () => fallback,
    set(next) {
      cache = next;
      try {
        window.localStorage.setItem(key, serialize(next));
      } catch {
        // Private mode / storage full: the value still lives for this visit.
      }
      listeners.forEach((listener) => listener());
    },
  };
}

/* ---------------------------------------------------------------- rate book */

const rateBookStore = createStore<RateBook>(RATE_BOOK_STORAGE_KEY, DEFAULT_RATE_BOOK, parseRateBook, serializeRateBook);

export function useRateBook() {
  const book = useSyncExternalStore(rateBookStore.subscribe, rateBookStore.get, rateBookStore.getServer);
  const setBookRate = useCallback((key: string, value: number) => {
    rateBookStore.set({ ...setRate(rateBookStore.get(), key, value), savedAt: new Date().toISOString() });
  }, []);
  const resetBook = useCallback(() => rateBookStore.set(parseRateBook(null)), []);
  return { book, setBookRate, resetBook };
}

/* ---------------------------------------------------------------------- job */

// The job model, its sanitiser and the engine-input builders are pure and live
// in @/lib/flexpack/job. This file only persists them.
export const JOB_STORAGE_KEY = "printsahaj_flexpack_job_v1";

const jobStore = createStore<JobState>(JOB_STORAGE_KEY, DEFAULT_JOB, parseJob, JSON.stringify);

export function useJob() {
  const job = useSyncExternalStore(jobStore.subscribe, jobStore.get, jobStore.getServer);
  const patch = useCallback((changes: Partial<JobState>) => jobStore.set({ ...jobStore.get(), ...changes }), []);
  const resetJob = useCallback(() => jobStore.set(DEFAULT_JOB), []);
  return { job, patch, resetJob };
}
