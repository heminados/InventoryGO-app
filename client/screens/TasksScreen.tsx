import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { forceLogout } from "../utils/auth";
import style from "../styles/TasksScreenStyle";
import { API_URL } from "../config/api";

const API = API_URL;

type Task = {
  id: number;
  title: string;
  description?: string;
  status: "OPEN" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  due_date?: string;
};

const TasksScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API}/tasks/my`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (res.status === 401 || res.status === 403) {
        const errData = await res.json().catch(() => ({}));
        forceLogout(errData.message);
        return;
      }
      const data = await res.json();
      if (res.ok) setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => Number(a.status === "DONE") - Number(b.status === "DONE")),
    [tasks]
  );

  const pendingCount = useMemo(
    () => tasks.filter((t) => t.status !== "DONE" && t.status !== "CANCELLED").length,
    [tasks]
  );

  const handleComplete = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API}/tasks/${id}/complete`, {
        method: "PATCH",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (res.status === 401 || res.status === 403) {
        const errData = await res.json().catch(() => ({}));
        forceLogout(errData.message);
        return;
      }
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: "DONE" } : t))
        );
      }
    } catch (err) {
      console.error("Failed to complete task:", err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={style.safeArea} edges={["bottom"]}>
        <View style={[style.container, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator color="#F5F5F5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={style.safeArea} edges={["bottom"]}>
      <View style={style.container}>
        <View style={style.header}>
          <Text style={style.title}>Tasks</Text>
          <Text style={style.subtitle}>
            {pendingCount} pending {pendingCount === 1 ? "task" : "tasks"}
          </Text>
        </View>

        <FlatList
          data={sortedTasks}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={style.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const done = item.status === "DONE";
            return (
              <Pressable
                style={style.taskRow}
                onPress={() => !done && handleComplete(item.id)}
                disabled={done}
              >
                <View style={[style.checkCircle, done && style.checkCircleDone]}>
                  {done ? <Text style={style.checkMark}>✓</Text> : null}
                </View>
                <Text style={[style.taskText, done && style.taskTextDone]}>{item.title}</Text>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={style.emptyWrap}>
              <Text style={style.emptyText}>No tasks yet</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default TasksScreen;
