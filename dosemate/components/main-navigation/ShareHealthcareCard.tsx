import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "./Card";

interface ShareHealthcareCardProps {
  onWeeklyReport?: () => void;
  onMonthlyReport?: () => void;
  onGenerateShare?: () => void;
}

export default function ShareHealthcareCard({
  onWeeklyReport,
  onMonthlyReport,
  onGenerateShare,
}: ShareHealthcareCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <Ionicons name="share-social" size={20} color="#3498DB" />
        <Text style={styles.title}>Share with Healthcare Team</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.description}>
          Share your adherence report with your doctor or caregiver to help with
          your treatment plan.
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={onWeeklyReport}
          >
            <Ionicons name="calendar-outline" size={16} color="#333" />
            <Text style={styles.outlineButtonText}>Weekly Report</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={onMonthlyReport}
          >
            <Ionicons name="bar-chart-outline" size={16} color="#333" />
            <Text style={styles.outlineButtonText}>Monthly Report</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onGenerateShare}
        >
          <Text style={styles.primaryButtonText}>Generate & Share Report</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    gap: 16,
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  outlineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#D5D8DC",
    borderRadius: 8,
    paddingVertical: 12,
  },
  outlineButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: "#3498DB",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
