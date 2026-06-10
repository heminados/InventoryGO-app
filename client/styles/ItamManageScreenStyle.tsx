import { StyleSheet } from "react-native";

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },

  // ── Cards ─────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3A3A3A",
    padding: 16,
  },
  sectionLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 14,
  },

  // ── Detail rows ───────────────────────────────────────────────────────────
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  detailLabel: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  detailValue: {
    color: "#F5F5F5",
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#3A3A3A",
  },

  // ── Status badge ──────────────────────────────────────────────────────────
  badge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeInStock: {
    backgroundColor: "#14532D",
  },
  badgeOrdered: {
    backgroundColor: "#1E3A5F",
  },
  badgeText: {
    color: "#F5F5F5",
    fontSize: 12,
    fontWeight: "600",
  },

  // ── Description ───────────────────────────────────────────────────────────
  description: {
    color: "#F5F5F5",
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },

  // ── Quantity controls ─────────────────────────────────────────────────────
  qtyLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 16,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
  },
  qtyBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#3A3A3A",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    color: "#F5F5F5",
    fontSize: 24,
    lineHeight: 28,
  },
  qtyValue: {
    color: "#F5F5F5",
    fontSize: 36,
    fontWeight: "700",
    minWidth: 64,
    textAlign: "center",
  },
  warningText: {
    color: "#F87171",
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
  },

  // ── Loading ───────────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 10,
  },

  // ── Reserved note (below stepper) ─────────────────────────────────────────
  reservedNote: {
    color: "#F87171",
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
  },

  // ── Save button ───────────────────────────────────────────────────────────
  saveBtn: {
    backgroundColor: "#1E40AF",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
