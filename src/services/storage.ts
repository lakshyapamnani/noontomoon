type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

export function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function storageGet<T>(key: string): T | null {
  return safeParseJson<T>(localStorage.getItem(key));
}

export function storageSet<T extends Json>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function storageRemove(key: string) {
  localStorage.removeItem(key);
}

export function storageKey(parts: string[]) {
  return ["dinex", ...parts].join(":");
}

