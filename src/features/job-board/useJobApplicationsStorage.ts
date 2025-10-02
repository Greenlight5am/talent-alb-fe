import { useEffect, useState } from "react";

export type JobApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  message?: string;
  createdAt: string;
};

export const JOB_APPLICATIONS_STORAGE_KEY = "talentalb:applications";

export function useJobApplicationsStorage() {
  return useLocalStorageState<JobApplication[]>(JOB_APPLICATIONS_STORAGE_KEY, []);
}

export function formatJobApplicationDate(isoDate: string, locale: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function useLocalStorageState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = window.localStorage.getItem(key);
      if (!stored) return defaultValue;
      return JSON.parse(stored) as T;
    } catch (err) {
      console.warn("Unable to read from storage", err);
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.warn("Unable to write to storage", err);
    }
  }, [key, state]);

  return [state, setState] as const;
}
