import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "jobs.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readJobs() {
  ensureDir();
  if (!fs.existsSync(FILE)) return { printed: {}, failed: [] };
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return { printed: {}, failed: [] };
  }
}

export function writeJobs(next) {
  ensureDir();
  fs.writeFileSync(FILE, JSON.stringify(next, null, 2), "utf8");
}

export function wasPrinted(jobKey) {
  const s = readJobs();
  return Boolean(s.printed[jobKey]);
}

export function markPrinted(jobKey, payload) {
  const s = readJobs();
  s.printed[jobKey] = { at: Date.now(), payload };
  writeJobs(s);
}

export function markFailed(jobKey, error, payload) {
  const s = readJobs();
  s.failed.unshift({ jobKey, at: Date.now(), error: String(error), payload });
  s.failed = s.failed.slice(0, 200);
  writeJobs(s);
}

