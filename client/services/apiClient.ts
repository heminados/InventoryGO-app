import { addToOutbox, getCached, setCached } from "../db/database";
import { forceLogout } from "../utils/auth";
import { API_URL } from "../config/api";

// Drop-in replacement for fetch() that adds offline support:
// - GET:    on success caches the response; on network failure serves the cache
// - writes: on network failure queues the request in the outbox (syncService sends it later)
// Screens keep using res.ok / res.status / res.json() exactly like with fetch.
//
// Two system-wide rules come from the server's Back Office settings:
// - offline mode disabled -> behaves like plain fetch (no caching, no queueing)
// - system disabled -> the server answers 503 and the user is logged out

type ApiResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<any>;
};

const OFFLINE_QUEUED_MESSAGE =
  "No connection — saved on this device and will be sent automatically when you're back online.";

const SYSTEM_DISABLED_MESSAGE =
  "The system is temporarily disabled. Please try again later.";

// Applied from the server's offline_mode_enabled setting on login
let offlineModeEnabled = true;

// Fetches /settings and applies the offline switch. Goes through apiClient itself,
// so the flags are also cached and survive offline app starts. Called after login.
export async function refreshSystemSettings(token: string) {
  try {
    const res = await apiClient(`${API_URL}/settings`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    const settings = await res.json();
    if (typeof settings.offline_mode_enabled === "boolean") {
      offlineModeEnabled = settings.offline_mode_enabled;
    }
  } catch {
    // Offline with no cached settings — keep the current value
  }
}

function makeResponse(ok: boolean, status: number, data: any): ApiResponse {
  return {
    ok,
    status,
    // Mimic fetch: json() rejects when there is no body to parse
    json: async () => {
      if (data === null) throw new Error("No JSON body");
      return data;
    },
  };
}

export async function apiClient(url: string, options: RequestInit = {}): Promise<ApiResponse> {
  const method = (options.method ?? "GET").toUpperCase();

  if (method === "GET") {
    try {
      const res = await fetch(url, options);
      const data = await res.json().catch(() => null);
      if (res.status === 503) {
        // System switched off in the Back Office — disconnect and go to Login
        forceLogout(data?.message || SYSTEM_DISABLED_MESSAGE);
        return makeResponse(false, 503, data);
      }
      if (res.ok && data !== null && offlineModeEnabled) await setCached(url, data);
      return makeResponse(res.ok, res.status, data);
    } catch {
      if (!offlineModeEnabled) throw new Error("Network request failed");
      // Network failed — fall back to the last cached copy of this endpoint
      const cached = await getCached(url);
      if (cached !== null) return makeResponse(true, 200, cached);
      throw new Error(`Offline and no cached data for ${url}`);
    }
  }

  // POST / PUT / PATCH / DELETE
  try {
    const res = await fetch(url, options);
    if (res.status === 503) {
      // System switched off in the Back Office — disconnect and go to Login
      const data = await res.json().catch(() => null);
      forceLogout(data?.message || SYSTEM_DISABLED_MESSAGE);
      return makeResponse(false, 503, data);
    }
    return res;
  } catch {
    if (!offlineModeEnabled) throw new Error("Network request failed");
    // Network failed — queue the write and report success so the UI can continue
    await addToOutbox(method, url, typeof options.body === "string" ? options.body : null);
    return makeResponse(true, 202, { queued: true, message: OFFLINE_QUEUED_MESSAGE });
  }
}
