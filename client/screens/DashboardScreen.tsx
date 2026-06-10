import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { forceLogout } from "../utils/auth";
import style from "../styles/DashboardScreenStyle";

const API_BASE = "http://localhost:5001";

type Stats = {
  totalStock: number;
  openOrders: number;
  pendingOrders: number;
  lowStock: number;
  requiresCheck: number;
  openTasks: number;
};

const DashboardScreen = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE}/dashboard/stats`, {
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

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const tiles = [
    { id: "stock",     icon: "📦", title: "Total Stock",       value: stats?.totalStock },
    { id: "orders",    icon: "🛒", title: "Open Orders",       value: stats?.openOrders },
    { id: "pending",   icon: "⏳", title: "Pending Orders",    value: stats?.pendingOrders },
    { id: "lowStockAlerts",    icon: "⚠️", title: "Low Stock Alerts",  value: stats?.lowStock },
    { id: "needCheck", icon: "🚨", title: "Required to Check", value: stats?.requiresCheck },
    { id: "tasks",     icon: "📝", title: "Tasks",             value: stats?.openTasks },
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
