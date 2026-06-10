import { StyleSheet } from "react-native";

const style = StyleSheet.create({
  inner: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  infoView: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  infoViewCube: {
    width: "48%",
    minHeight: 170,
    justifyContent: "center",
    alignItems: "flex-start",
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    marginBottom: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  cubeIcon: {
    fontSize: 30,
    marginBottom: 14,
  },
  cubeTitle: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 6,
  },
  cubeValue: {
    color: "#F5F5F5",
    fontSize: 28,
    fontWeight: "700",
  },
});

export default style;
