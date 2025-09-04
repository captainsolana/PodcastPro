// Local revision history (per project + episode) for script versions.
export interface RevisionEntry {
  id: string;
  projectId: string;
  episode: number | 'single';
  createdAt: number;
  summary: string;
  length: number;
  dataHash: string;
  content?: string; // full content added in v2
}

const KEY = 'pp_script_revisions_v2';
const LEGACY_KEYS = ['pp_script_revisions_v1'];

function load(): RevisionEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
    // attempt legacy migration
    for (const k of LEGACY_KEYS) {
      const legacy = localStorage.getItem(k);
      if (legacy) {
        const parsed: RevisionEntry[] = JSON.parse(legacy);
        // write to new key
        localStorage.setItem(KEY, JSON.stringify(parsed));
        return parsed;
      }
    }
    return [];
  } catch { return []; }
}
function save(list: RevisionEntry[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(-200))); } catch {}
}

let cache = load();

export function addRevision(projectId: string, episode: number | 'single', content: string) {
  const hash = btoa(unescape(encodeURIComponent(content))).slice(0, 32);
  if (cache.some(r => r.projectId === projectId && r.episode === episode && r.dataHash === hash)) return; // skip duplicate
  cache.push({
    id: crypto.randomUUID(),
    projectId,
    episode,
    createdAt: Date.now(),
    summary: content.slice(0, 140),
    length: content.length,
  dataHash: hash,
  content
  });
  save(cache);
}

export function listRevisions(projectId: string, episode: number | 'single'): RevisionEntry[] {
  return cache.filter(r => r.projectId === projectId && r.episode === episode).sort((a,b) => b.createdAt - a.createdAt);
}

export function getRevision(id: string): RevisionEntry | undefined {
  return cache.find(r => r.id === id);
}
