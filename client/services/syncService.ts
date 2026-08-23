import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getOutbox, removeFromOutbox } from "../db/database";

// Replays writes queued in the outbox once the device is back online.
// Started once from App.tsx.

let syncing = false;

export function startSyncListener() {
  NetInfo.addEventListener((state) => {
    if (state.isConnected) processOutbox();
  });
}

async function processOutbox() {
  if (syncing) return; // avoid overlapping runs
  syncing = true;
  try {
    const pending = await getOutbox();
    for (const req of pending) {
      // Re-attach the current token — it may have changed since the request was queued
      const token = await AsyncStorage.getItem("token");
      try {
        const res = await fetch(req.endpoint, {
          method: req.method,
          headers: {
            ...(req.body ? { "Content-Type": "application/json" } : {}),
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: req.body ?? undefined,
        });
        if (res.ok || (res.status >= 400 && res.status < 500)) {
          // Sent, or permanently rejected by the server — stop retrying either way
          await removeFromOutbox(req.id);
        } else {
          break; // server error — keep the queue order and retry on the next sync
        }
      } catch {
        break; // still offline — retry on the next sync
      }
    }
  } finally {
    syncing = false;
  }
}
