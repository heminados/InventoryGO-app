import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: "#1E1E1E",
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 28,
    },
    pageTitle: {
      color: "#F5F5F5",
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 16,
      letterSpacing: 0.3,
    },
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
      gap: 14,
    },
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
    lineItemBlock: {
      gap: 8,
      marginBottom: 16,
      paddingBottom: 16,
    },
    lineItemBlockDivider: {
      borderBottomWidth: 1,
      borderBottomColor: "#3A3A3A",
    },
    lineItemFooter: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 12,
      marginTop: 4,
    },
    qtyWrap: {
      flex: 1,
      maxWidth: 120,
      gap: 6,
    },
    qtyInput: {
      textAlign: "center",
    },
    removeLine: {
      paddingVertical: 10,
      paddingHorizontal: 8,
      justifyContent: "center",
    },
    removeLineSpacer: {
      width: 74,
    },
    removeLineText: {
      color: "#EF4444",
      fontSize: 13,
      fontWeight: "600",
    },
    addLineBtn: {
      alignSelf: "flex-start",
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    addLineText: {
      color: "#3B82F6",
      fontSize: 14,
      fontWeight: "600",
    },
    launchBtn: {
      backgroundColor: "#1E40AF",
      paddingVertical: 16,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 8,
      borderWidth: 1,
      borderColor: "#2563EB",
    },
    launchBtnText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 16,
      letterSpacing: 0.3,
    },
  });

  export default styles;