import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#1E1E1E",
    padding: 20,
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#F5F5F5",
  },
  input: {
    borderWidth: 1,
    borderColor: "#3A3A3A",
    backgroundColor: "#2A2A2A",
    color: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#1E40AF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Secondary (outlined) button so it reads as a separate, lower-emphasis action
  nfcButton: {
    marginTop: 12,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E40AF",
    backgroundColor: "transparent",
  },
  nfcButtonText: {
    color: "#F5F5F5",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "#F87171",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
});

export default styles;