import React, { useCallback, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { forceLogout } from "../utils/auth";
import style from "../styles/DashboardScreenStyle";
import { API_URL } from "../config/api";
import { apiClient } from "../services/apiClient";

const API = API_URL;

type Stats = {
  totalStock: number;
  openOrders: number;
  pendingOrders: number;
  lowStockAlerts: number;
  requiredToCheck: number;
  tasks: number;
};

const DashboardScreen = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await apiClient(`${API}/dashboard/stats`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (res.status === 401 || res.status === 403) {
        const errData = await res.json().catch(() => ({}));
        forceLogout(errData.message);
        return; 
      }
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch every time the screen comes into focus, so the stats stay fresh
  // when the user returns to this tab.
  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

  const tiles = [
    { id: "stock",     icon: "📦", title: "Total Stock",       value: stats?.totalStock },
    { id: "orders",    icon: "🛒", title: "Open Orders",       value: stats?.openOrders },
    { id: "pending",   icon: "⏳", title: "Pending Orders",    value: stats?.pendingOrders },
    { id: "lowStockAlerts",    icon: "⚠️", title: "Low Stock Alerts",  value: stats?.lowStockAlerts },
    { id: "needCheck", icon: "🚨", title: "Requires Check", value: stats?.requiredToCheck },
    { id: "tasks",     icon: "📝", title: "My Tasks",          value: stats?.tasks },
  ];

  if (loading) {
    return (
      <SafeAreaView style={style.inner} edges={["bottom"]}>
        <View style={[style.container, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator color="#F5F5F5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={style.inner} edges={["bottom"]}>
      <View style={style.container}>
        <View style={style.infoView}>
          {tiles.map((tile) => (
            <View key={tile.id} style={style.infoViewCube}>
              <Text style={style.cubeIcon}>{tile.icon}</Text>
              <Text style={style.cubeTitle}>{tile.title}</Text>
              <Text style={style.cubeValue}>{tile.value ?? "--"}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;
