import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../styles/ItamManageScreenStyle";

type ItemDetails = {
  id: number;
  sku: string;
  name: string;
  description?: string | null;
  price: string;
  qty: number;
  reserved_qty: number;
  available_qty: number;
  is_on_order: boolean;
};

export default function ItemManageScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { item } = route.params as { item: { id: number } };

  const [details, setDetails] = useState<ItemDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5001/items/details/${item.id}`,
          { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );

        if (!res.ok) throw new Error();

        const data: ItemDetails = await res.json();
        setDetails(data);
        setQty(data.qty);
      } catch {
        Alert.alert("Error", "Could not load item details.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [item.id]);

  const increase = () => setQty((q) => q + 1);
  const decrease = () => setQty((q) => Math.max(0, q - 1));

  const handleSave = async () => {
    if (!details) return;

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5001/items/update/${details.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            sku: details.sku,
            name: details.name,
            description: details.description,
            price: details.price,
            qty,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        Alert.alert("Update Failed", err.message || "Something went wrong.");
        return;
      }

      Alert.alert("Saved", "Quantity updated successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert("Error", "Could not connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !details) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F5F5F5" />
        <Text style={styles.loadingText}>Loading item...</Text>
      </View>
    );
  }

  const availableAfterEdit = Math.max(0, qty - details.reserved_qty);

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Item Details */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Item Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name</Text>
            <Text style={styles.detailValue}>{details.name}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>SKU</Text>
            <Text style={styles.detailValue}>{details.sku}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>
              ${parseFloat(details.price).toFixed(2)}
            </Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View
              style={[
                styles.badge,
                details.is_on_order ? styles.badgeOrdered : styles.badgeInStock,
              ]}
            >
              <Text style={styles.badgeText}>
                {details.is_on_order ? "On Order" : "In Stock"}
              </Text>
            </View>
          </View>

          {details.reserved_qty > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reserved</Text>
                <Text style={styles.detailValue}>{details.reserved_qty} units</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Available</Text>
                <Text style={styles.detailValue}>{details.available_qty} units</Text>
              </View>
            </>
          )}

          {details.description ? (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description</Text>
              </View>
              <Text style={styles.description}>{details.description}</Text>
            </>
          ) : null}
        </View>

        {/* Quantity Management */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Inventory</Text>
          <Text style={styles.qtyLabel}>Physical Stock</Text>

          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={decrease}
              activeOpacity={0.7}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qtyValue}>{qty}</Text>

            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={increase}
              activeOpacity={0.7}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {qty === 0 && (
            <Text style={styles.warningText}>⚠ Stock is at zero</Text>
          )}

          {details.reserved_qty > 0 && (
            <Text style={styles.reservedNote}>
              {details.reserved_qty} units reserved in open orders · {availableAfterEdit} available
            </Text>
          )}
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
