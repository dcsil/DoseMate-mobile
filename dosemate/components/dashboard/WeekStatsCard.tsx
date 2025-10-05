import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface WeekStatsCardProps {
  percentage: number;
}

export default function WeekStatsCard({ percentage }: WeekStatsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Ionicons name="bar-chart" size={20} color="#ffffff" />
        </View>
        <View>
          <Text style={styles.label}>This Week</Text>
          <Text style={styles.value}>{percentage}%</Text>
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
    backgroundColor: "#D5F4E6",
    borderColor: "#A9DFBF",
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
    backgroundColor: "#27AE60",
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