import { StyleSheet } from "react-native";

const style = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    color: "#F5F5F5",
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 4,
    marginBottom: 14,
  },
  listContent: {
    paddingBottom: 24,
    gap: 10,
  },
  taskRow: {
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3A3A3A",
    paddingVertical: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#6B7280",
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleDone: {
    borderColor: "#9CA3AF",
    backgroundColor: "#3A3A3A",
  },
  checkMark: {
    color: "#F5F5F5",
    fontSize: 12,
    fontWeight: "700",
  },
  taskText: {
    flex: 1,
    color: "#F5F5F5",
    fontSize: 17,
    fontWeight: "700",
  },
  taskTextDone: {
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  emptyWrap: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
});

export default style;