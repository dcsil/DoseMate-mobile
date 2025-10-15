import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "./Card";
import ProgressBar from "./ProgressBar";

interface AdherenceData {
  label: string;
  percentage: number;
  subtitle: string;
}

interface AdherenceProgressCardProps {
  todayData: AdherenceData;
  weekData: AdherenceData;
  monthData: AdherenceData;
}

export default function AdherenceProgressCard({
  todayData,
  weekData,
  monthData,
}: AdherenceProgressCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <Ionicons name="fitness" size={20} color="#3498DB" />
        <Text style={styles.title}>Adherence Progress</Text>
      </View>
      <View style={styles.content}>
        <ProgressBar
          label={todayData.label}
          percentage={todayData.percentage}
          subtitle={todayData.subtitle}
        />
        <ProgressBar
          label={weekData.label}
          percentage={weekData.percentage}
          subtitle={weekData.subtitle}
        />
        <ProgressBar
          label={monthData.label}
          percentage={monthData.percentage}
          subtitle={monthData.subtitle}
        />
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
});
