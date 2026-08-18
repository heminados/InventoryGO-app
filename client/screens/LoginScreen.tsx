import React, { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { API_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../styles/LoginScreenStyles";
import { startNfcScan } from "../services/nfcService";

const API = `${API_URL}/auth/login`;
const NFC_API = `${API_URL}/auth/nfc-login`;

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Show a message when redirected here after a forced logout (e.g. account deactivated mid-session)
  React.useEffect(() => {
    if (route.params?.errorMessage) {
      setError(route.params.errorMessage);
    }
  }, [route.params?.errorMessage]);

  const handleLogin = async () => {
    setError("");
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Login failed. Please try again.");
        return;
      }
      await AsyncStorage.setItem("token", data.token);
      navigation.reset({ index: 0, routes: [{ name: "MainDrawer" }] });
    } catch {
      setError("Could not connect to the server. Please try again.");
    }
  };

  // Scans an NFC tag and logs in with its unique id (matched against users.nfc_token on the server)
  const handleScanNfc = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setError("");
    try {
      const { tagId } = await startNfcScan();
      if (!tagId) {
        setError("Could not read this NFC tag. Please try again.");
        return;
      }
      const response = await fetch(NFC_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nfcToken: tagId }),
      });
      const data = await response.json();
      if (!response.ok) {
        // Show the scanned tag id so it can be registered to a user
        // (paste it into the user's "NFC Tag ID" field in the admin panel).
        setError(`${data.message || "NFC login failed."}\nTag ID: ${tagId}`);
        return; 
      }
      await AsyncStorage.setItem("token", data.token);
      navigation.reset({ index: 0, routes: [{ name: "MainDrawer" }] });
    } catch {
      // Covers scan cancel / NFC unavailable / network errors
      setError("NFC login failed. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={(v) => { setEmail(v); setError(""); }}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={(v) => { setPassword(v); setError(""); }}
          style={styles.input}
          secureTextEntry
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        {/* Secondary action: trigger a device NFC scan */}
        <TouchableOpacity style={styles.nfcButton} onPress={handleScanNfc} disabled={isScanning}>
          <Text style={styles.nfcButtonText}>{isScanning ? "Scanning..." : "Scan NFC"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
