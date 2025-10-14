import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ProgressBarProps {
  label: string;
  percentage: number;
  subtitle: string;
}

export default function ProgressBar({
  label,
  percentage,
  subtitle,
}: ProgressBarProps) {
  return (
    <View style={styles.progressItem}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressPercentage}>{percentage}%</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.progressSubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  progressItem: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 16,
    color: "#444",
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: "#E5E5E5",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#3498DB",
    borderRadius: 6,
  },
  progressSubtitle: {
    fontSize: 14,
    color: "#666",
  },
});
