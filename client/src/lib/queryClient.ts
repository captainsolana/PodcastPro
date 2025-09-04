import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  urlOrMethod: string,
  urlOrOptions?: string | RequestInit,
  data?: unknown | undefined,
): Promise<Response> {
  let method: string;
  let url: string;
  let options: RequestInit = {};

  // Handle both signatures: apiRequest(url) and apiRequest(method, url, data)
  if (typeof urlOrOptions === 'string') {
    // apiRequest(method, url, data) format
    method = urlOrMethod;
    url = urlOrOptions;
    options = {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    };
  } else {
    // apiRequest(url) format for queries
    url = urlOrMethod;
    options = {
      method: "GET",
      credentials: "include",
      ...urlOrOptions,
    };
  }

  const res = await fetch(url, options);
  await throwIfResNotOk(res);
  return res;
}

// Lightweight offline mutation queue (Phase 3 resilience)
// Only queues non-GET requests when navigator is offline.
interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  options: RequestInit & { queuedAt: number };
  attempt: number;
}

const OFFLINE_QUEUE_KEY = 'pp_offline_queue_v1';

function loadQueue(): QueuedRequest[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]'); } catch { return []; }
}
function saveQueue(q: QueuedRequest[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(q)); } catch {}
}

let queue: QueuedRequest[] = loadQueue();
let flushing = false;

function emitQueueEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pp:offline-queue-changed', { detail: { size: queue.length } }));
  }
}

async function flushQueue() {
  if (flushing) return; flushing = true;
  try {
    if (!navigator.onLine || queue.length === 0) return;
    const now = Date.now();
    const stillPending: QueuedRequest[] = [];
    for (const req of queue) {
      try {
        const res = await fetch(req.url, req.options);
        if (!res.ok) throw new Error('HTTP ' + res.status);
      } catch (e) {
        // exponential backoff (cap 60s)
        const delay = Math.min(60000, 1000 * Math.pow(2, req.attempt));
        if (now - req.options.queuedAt < delay) {
          stillPending.push(req); // retry later
        } else {
          stillPending.push({ ...req, attempt: req.attempt + 1 });
        }
      }
    }
    queue = stillPending;
    saveQueue(queue);
  emitQueueEvent();
  } finally {
    flushing = false;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => flushQueue());
  // periodic flush attempt
  setInterval(() => flushQueue(), 15000);
}

export async function resilientApiRequest(method: string, url: string, body?: any) {
  const isGet = method.toUpperCase() === 'GET';
  const options: RequestInit = {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include'
  };
  if (!isGet && typeof navigator !== 'undefined' && !navigator.onLine) {
    const queued: QueuedRequest = {
      id: crypto.randomUUID(),
      method,
      url,
      options: { ...options, queuedAt: Date.now() },
      attempt: 0
    };
    queue.push(queued);
    saveQueue(queue);
  emitQueueEvent();
    return new Response(JSON.stringify({ queued: true }), { status: 202 });
  }
  const res = await fetch(url, options);
  await throwIfResNotOk(res);
  return res;
}

export function getOfflineQueueSize() { return queue.length; }

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
