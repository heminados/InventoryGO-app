import { StyleSheet } from "react-native";

const style = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  flex: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },

  // Section card
  section: {
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3A3A3A",
    overflow: "hidden",
    backgroundColor: "#252525",
  },
  sectionHeader: {
    backgroundColor: "#2A2A2A",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A3A",
  },
  sectionHeaderText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  sectionBody: {
    padding: 14,
    gap: 12,
  },

  // Form fields
  field: {
    gap: 6,
  },
  label: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#3A3A3A",
    backgroundColor: "#1E1E1E",
    color: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
  },
  qtyInput: {
    textAlign: "center",
    maxWidth: 100,
  },

  // Search dropdown
  dropdown: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#3A3A3A",
    borderRadius: 8,
    backgroundColor: "#2A2A2A",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  dropdownItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A3A",
  },
  dropdownItemName: {
    color: "#F5F5F5",
    fontSize: 14,
    fontWeight: "600",
  },
  dropdownItemMeta: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 3,
  },
  noResultsText: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },

  // Pending item confirmation card
  pendingCard: {
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 8,
    backgroundColor: "#0F1E36",
    padding: 14,
    gap: 12,
  },
  pendingItemName: {
    color: "#F5F5F5",
    fontSize: 15,
    fontWeight: "700",
  },
  pendingItemMeta: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 2,
  },
  pendingActions: {
    flexDirection: "row",
    gap: 10,
  },
  addToOrderBtn: {
    flex: 1,
    backgroundColor: "#1E40AF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2563EB",
  },
  addToOrderBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3A3A3A",
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "600",
  },

  // Order summary rows
  summaryRow: {
    paddingVertical: 12,
    gap: 6,
  },
  summaryRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A3A",
    marginBottom: 2,
  },
  summaryRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryItemName: {
    color: "#F5F5F5",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  summaryItemMeta: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  summaryRowBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  removeText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "600",
  },

  // Quantity controls inside summary
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#3A3A3A",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    color: "#F5F5F5",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 18,
  },
  qtyValue: {
    color: "#F5F5F5",
    fontSize: 15,
    fontWeight: "700",
    minWidth: 24,
    textAlign: "center",
  },

  // Line price
  lineTotal: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  lineTotalBold: {
    color: "#F5F5F5",
    fontWeight: "700",
  },

  // Totals footer
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#3A3A3A",
    paddingTop: 12,
    marginTop: 4,
  },
  totalsText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  totalsPrice: {
    color: "#F5F5F5",
    fontSize: 18,
    fontWeight: "700",
  },

  // Submit button
  launchBtn: {
    backgroundColor: "#1E40AF",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#2563EB",
  },
  launchBtnDisabled: {
    opacity: 0.6,
  },
  launchBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});

export default style;
