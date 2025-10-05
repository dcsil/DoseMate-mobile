import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TodaysMedsCardProps {
  taken: number;
  total: number;
}

export default function TodaysMedsCard({ taken, total }: TodaysMedsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Ionicons name="medical" size={20} color="#ffffff" />
        </View>
        <View>
          <Text style={styles.label}>Today's Meds</Text>
          <Text style={styles.value}>{taken} of {total}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#EBF5FB",
    borderColor: "#AED6F1",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3498DB",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
});
