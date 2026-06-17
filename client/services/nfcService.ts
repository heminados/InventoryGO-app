import NfcManager, { NfcTech, Ndef } from "react-native-nfc-manager";

// Thin wrapper around react-native-nfc-manager that triggers a real NFC scan.
// This file only handles the hardware scan + reading the tag — it intentionally
// contains NO authentication / user-matching / API logic.

export type NfcScanResult = {
  tagId: string | null;   // unique id of the scanned tag, if available
  text: string | null;    // first NDEF text record, if the tag has one
};

// NfcManager.start() only needs to run once for the app's lifetime
let started = false;

async function ensureStarted(): Promise<void> {
  if (started) return;
  await NfcManager.start();
  started = true;
}

// Triggers a real NFC scan using the device hardware.
// Resolves with the scanned tag data, or throws if NFC is unavailable
// or the scan is cancelled / fails.
export async function startNfcScan(): Promise<NfcScanResult> {
  const supported = await NfcManager.isSupported();
  if (!supported) {
    throw new Error("NFC is not supported on this device.");
  }

  await ensureStarted();

  try {
    // Ask the OS to scan for an NDEF tag (shows the native NFC prompt on iOS)
    await NfcManager.requestTechnology(NfcTech.Ndef);
    const tag = await NfcManager.getTag();

    // Decode the first NDEF text record if the tag carries one
    let text: string | null = null;
    const record = tag?.ndefMessage?.[0];
    if (record?.payload) {
      try {
        text = Ndef.text.decodePayload(Uint8Array.from(record.payload));
      } catch {
        text = null;
      }
    }

    return { tagId: tag?.id ?? null, text };
  } finally {
    // Always release the NFC technology request, even on error / cancel
    await NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}
