export function nowMs() {
  return Date.now();
}

export function minutesBetween(aMs: number, bMs: number) {
  return Math.max(0, Math.floor(Math.abs(aMs - bMs) / 60_000));
}

