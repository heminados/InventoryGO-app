import { StyleSheet } from "react-native";

export default StyleSheet.create({
  headerStyle: {
    backgroundColor: "#1E1E1E",
  },
  headerTitleStyle: {
    color: "#F5F5F5",
  },
  // Background behind each screen — matches the header so there is no seam/gap
  sceneStyle: {
    backgroundColor: "#1E1E1E",
  },
  drawerStyle: {
    backgroundColor: "#2a2a2a",
    width: 270,
  },
  logoutButton: {
    width: 100,
    marginRight: 16,
    backgroundColor: "#1E40AF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#F5F5F5",
    fontWeight: "bold",
    fontSize: 16,
  },
});