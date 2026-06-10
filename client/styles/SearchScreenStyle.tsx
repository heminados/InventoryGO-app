import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: "#1E1E1E",
      position: "relative",
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      gap: 12,
    },
    row: {
      backgroundColor: "#2a2a2a",
      borderRadius: 10,
      paddingVertical: 14,
      paddingHorizontal: 14,
    },
    rowText: {
      color: "#F5F5F5",
      fontSize: 16,
      fontWeight: "600",
    },
    rowSub: {
      color: "#9CA3AF",
      fontSize: 13,
      marginTop: 3,
    },
    empty: {
      marginTop: 40,
      alignItems: "center",
    },
    emptyText: {
      color: "#aaa",
    },
    searchBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 80,
      backgroundColor: "#1E1E1E",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: "#333",
      zIndex: 1,
    },
    input: {
      backgroundColor: "#2a2a2a",
      borderRadius: 10,
      paddingHorizontal: 14,
      height: 46,
      color: "#F5F5F5",
    },
  });

  export default styles;