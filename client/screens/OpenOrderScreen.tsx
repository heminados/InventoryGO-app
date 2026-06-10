import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { forceLogout } from "../utils/auth";
import style from "../styles/OpenOrderScreenStyle";

const API_BASE = "http://localhost:5001";

type Item = {
  id: number;
  sku: string;
  name: string;
  qty: number;
  price: string;
};

type OrderLine = {
  item: Item;
  quantity: number;
};

export default function OpenOrderScreen() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [allItems, setAllItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingItem, setPendingItem] = useState<Item | null>(null);
  const [pendingQty, setPendingQty] = useState("1");

  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);

  const [loadingItems, setLoadingItems] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await fetch(`${API_BASE}/items/getAll`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        if (res.status === 401 || res.status === 403) {
          const errData = await res.json().catch(() => ({}));
          forceLogout(errData.message);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setAllItems(data);
        }
      } catch (err) {
        console.error("Failed to fetch items:", err);
      } finally {
        setLoadingItems(false);
      }
    };
    fetchItems();
  }, []);

  // Same filter logic as SearchScreen
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return allItems
      .filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.sku.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [allItems, searchQuery]);

  const selectItemFromSearch = useCallback((item: Item) => {
    setPendingItem(item);
    setPendingQty("1");
    setSearchQuery("");
  }, []);

  const addPendingItemToOrder = useCallback(() => {
    if (!pendingItem) return;
    const qty = parseInt(pendingQty, 10);
    if (!qty || qty < 1) {
      Alert.alert("Invalid quantity", "Quantity must be at least 1.");
      return;
    }
    setOrderLines((prev) => {
      const exists = prev.find((l) => l.item.id === pendingItem.id);
      if (exists) {
        return prev.map((l) =>
          l.item.id === pendingItem.id ? { ...l, quantity: l.quantity + qty } : l
        );
      }
      return [...prev, { item: pendingItem, quantity: qty }];
    });
    setPendingItem(null);
    setPendingQty("1");
  }, [pendingItem, pendingQty]);

  const removeOrderLine = useCallback((itemId: number) => {
    setOrderLines((prev) => prev.filter((l) => l.item.id !== itemId));
  }, []);

  const changeLineQty = useCallback((itemId: number, delta: number) => {
    setOrderLines((prev) =>
      prev.map((l) =>
        l.item.id === itemId
          ? { ...l, quantity: Math.max(1, l.quantity + delta) }
          : l
      )
    );
  }, []);

  const totalUnits = useMemo(
    () => orderLines.reduce((sum, l) => sum + l.quantity, 0),
    [orderLines]
  );

  const totalPrice = useMemo(
    () =>
      orderLines.reduce(
        (sum, l) => sum + parseFloat(l.item.price) * l.quantity,
        0
      ),
    [orderLines]
  );

  const submitOrder = useCallback(async () => {
    if (!customerName.trim()) {
      Alert.alert("Missing field", "Please enter the customer name.");
      return;
    }
    if (!customerPhone.trim()) {
      Alert.alert("Missing field", "Please enter the customer phone number.");
      return;
    }
    if (orderLines.length === 0) {
      Alert.alert("No items", "Add at least one product to the order.");
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE}/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          items: orderLines.map((l) => ({
            item_id: l.item.id,
            quantity: l.quantity,
          })),
        }),
      });

      if (res.status === 401 || res.status === 403) {
        const errData = await res.json().catch(() => ({}));
        forceLogout(errData.message);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed to create order.");
        return;
      }

      Alert.alert(
        data.status === "APPROVED" ? "Order Approved" : "Order Pending",
        data.message,
        [
          {
            text: "OK",
            onPress: () => {
              setCustomerName("");
              setCustomerPhone("");
              setOrderLines([]);
            },
          },
        ]
      );
    } catch {
      Alert.alert("Error", "Could not connect to the server.");
    } finally {
      setSubmitting(false);
    }
  }, [customerName, customerPhone, orderLines]);

  if (loadingItems) {
    return (
      <View style={[style.safe, style.centered]}>
        <ActivityIndicator color="#F5F5F5" />
      </View>
    );
  }

  return (
    <View style={style.safe}>
      <KeyboardAvoidingView
        style={style.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={style.flex}
          contentContainerStyle={style.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Customer details */}
          <View style={style.section}>
            <View style={style.sectionHeader}>
              <Text style={style.sectionHeaderText}>Customer</Text>
            </View>
            <View style={style.sectionBody}>
              <View style={style.field}>
                <Text style={style.label}>Name</Text>
                <TextInput
                  style={style.input}
                  placeholder="Customer full name"
                  placeholderTextColor="#6B7280"
                  value={customerName}
                  onChangeText={setCustomerName}
                  autoCapitalize="words"
                />
              </View>
              <View style={style.field}>
                <Text style={style.label}>Phone number</Text>
                <TextInput
                  style={style.input}
                  placeholder="e.g. +972-50-0000000"
                  placeholderTextColor="#6B7280"
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          {/* Product search */}
          <View style={style.section}>
            <View style={style.sectionHeader}>
              <Text style={style.sectionHeaderText}>Add product</Text>
            </View>
            <View style={style.sectionBody}>

              {pendingItem ? (
                /* Confirm selected product */
                <View style={style.pendingCard}>
                  <View>
                    <Text style={style.pendingItemName}>{pendingItem.name}</Text>
                    <Text style={style.pendingItemMeta}>
                      {pendingItem.sku} · Stock: {pendingItem.qty}
                    </Text>
                  </View>
                  <View style={style.field}>
                    <Text style={style.label}>Quantity</Text>
                    <TextInput
                      style={[style.input, style.qtyInput]}
                      value={pendingQty}
                      onChangeText={(t) =>
                        setPendingQty(t.replace(/[^0-9]/g, ""))
                      }
                      keyboardType="number-pad"
                      autoFocus
                    />
                  </View>
                  <View style={style.pendingActions}>
                    <TouchableOpacity
                      style={style.addToOrderBtn}
                      onPress={addPendingItemToOrder}
                      activeOpacity={0.8}
                    >
                      <Text style={style.addToOrderBtnText}>Add to order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={style.cancelBtn}
                      onPress={() => { setPendingItem(null); setPendingQty("1"); }}
                      activeOpacity={0.7}
                    >
                      <Text style={style.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* Search input + dropdown */
                <View>
                  <TextInput
                    style={style.input}
                    placeholder="Search by name or SKU..."
                    placeholderTextColor="#6B7280"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                  />
                  {searchResults.length > 0 && (
                    <View style={style.dropdown}>
                      {searchResults.map((item, index) => (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            style.dropdownItem,
                            index < searchResults.length - 1 &&
                              style.dropdownItemDivider,
                          ]}
                          onPress={() => selectItemFromSearch(item)}
                          activeOpacity={0.7}
                        >
                          <Text style={style.dropdownItemName}>{item.name}</Text>
                          <Text style={style.dropdownItemMeta}>
                            {item.sku} · Stock: {item.qty} · ${parseFloat(item.price).toFixed(2)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  {searchQuery.trim().length > 0 &&
                    searchResults.length === 0 && (
                      <Text style={style.noResultsText}>No products found</Text>
                    )}
                </View>
              )}
            </View>
          </View>

          {/* Order summary */}
          {orderLines.length > 0 && (
            <View style={style.section}>
              <View style={style.sectionHeader}>
                <Text style={style.sectionHeaderText}>
                  Order summary · {orderLines.length}{" "}
                  {orderLines.length === 1 ? "product" : "products"}
                </Text>
              </View>
              <View style={style.sectionBody}>
                {orderLines.map((line, index) => (
                  <View
                    key={line.item.id}
                    style={[
                      style.summaryRow,
                      index < orderLines.length - 1 && style.summaryRowDivider,
                    ]}
                  >
                    <View style={style.summaryRowTop}>
                      <Text style={style.summaryItemName}>{line.item.name}</Text>
                      <TouchableOpacity
                        onPress={() => removeOrderLine(line.item.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={style.removeText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={style.summaryItemMeta}>{line.item.sku}</Text>
                    <View style={style.summaryRowBottom}>
                      <View style={style.qtyControls}>
                        <TouchableOpacity
                          style={style.qtyBtn}
                          onPress={() => changeLineQty(line.item.id, -1)}
                          activeOpacity={0.7}
                        >
                          <Text style={style.qtyBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={style.qtyValue}>{line.quantity}</Text>
                        <TouchableOpacity
                          style={style.qtyBtn}
                          onPress={() => changeLineQty(line.item.id, 1)}
                          activeOpacity={0.7}
                        >
                          <Text style={style.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={style.lineTotal}>
                        ${parseFloat(line.item.price).toFixed(2)} ×{" "}
                        {line.quantity} ={" "}
                        <Text style={style.lineTotalBold}>
                          ${(parseFloat(line.item.price) * line.quantity).toFixed(2)}
                        </Text>
                      </Text>
                    </View>
                  </View>
                ))}

                <View style={style.totalsRow}>
                  <Text style={style.totalsText}>
                    {totalUnits} {totalUnits === 1 ? "unit" : "units"}
                  </Text>
                  <Text style={style.totalsPrice}>${totalPrice.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[style.launchBtn, submitting && style.launchBtnDisabled]}
            onPress={submitOrder}
            disabled={submitting}
            activeOpacity={0.8}
          >
            <Text style={style.launchBtnText}>
              {submitting ? "Submitting..." : "Launch order"}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
