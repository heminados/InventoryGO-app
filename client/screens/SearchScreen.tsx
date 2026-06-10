import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import styles from "../styles/SearchScreenStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { forceLogout } from "../utils/auth";

type Item = {
  id: number;
  sku: string;
  name: string;
  description?: string | null;
  price: string;
  qty: number;
  is_ordered: boolean;
};

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        it.sku.toLowerCase().includes(q)
    );
  }, [query, items]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");

        const res = await fetch("http://localhost:5001/items/getAll", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (res.status === 401 || res.status === 403) {
          const errData = await res.json().catch(() => ({}));
          forceLogout(errData.message);
          return;
        }
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Failed to fetch items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <View style={styles.root}>
      <FlatList
        data={results}
        keyExtractor={(it) => String(it.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 90 + keyboardHeight },
        ]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() =>
              navigation.getParent()?.navigate("ItemManage", { item })
            }
          >
            <Text style={styles.rowText}>{item.name}</Text>
            <Text style={styles.rowSub}>
              {item.sku}{"  ·  "}Qty: {item.qty}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No results</Text>
          </View>
        }
      />

      <View style={[styles.searchBar, { bottom: keyboardHeight }]}>
        <TextInput
          placeholder="Search by name or SKU..."
          value={query}
          onChangeText={setQuery}
          placeholderTextColor="#777"
          style={styles.input}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}
