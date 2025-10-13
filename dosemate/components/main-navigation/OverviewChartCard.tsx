import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "./Card";

interface DayData {
  day: string;
  score: number;
}

interface OverviewChartCardProps {
  data: DayData[];
  timeRange: 'week' | 'month';
  showDetailsButton?: boolean;
  showIcon?: boolean;
  onViewDetails?: () => void;
}

export default function OverviewChartCard({ 
  data, 
  timeRange, 
  showDetailsButton = true,
  showIcon = true,
  onViewDetails 
}: OverviewChartCardProps) {
  const getColor = (score: number) => {
    if (score === 100) return "#27AE60";
    if (score >= 50) return "#F39C12";
    return "#E74C3C";
  };

  const getTitle = () => {
    return timeRange === 'week' ? 'Weekly Overview' : 'Monthly Overview';
  };

  return (
    <Card>
      <View style={styles.header}>
        { showIcon && (<Ionicons name="bar-chart" size={20} color="#3498DB" />) }
        <Text style={styles.title}>{getTitle()}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.chart}>
          {data.map((item) => (
            <View key={item.day} style={styles.chartDay}>
              <Text style={styles.dayLabel}>{item.day}</Text>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${item.score}%`,
                      backgroundColor: getColor(item.score),
                    },
                  ]}
                />
              </View>
              <Text style={styles.dayScore}>{item.score}%</Text>
            </View>
          ))}
        </View>
        {showDetailsButton && (
          <TouchableOpacity style={styles.button} onPress={onViewDetails}>
            <Text style={styles.buttonText}>View Detailed Analytics</Text>
          </TouchableOpacity>
        )}
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
    color: "#2C2C2C",
  },
  content: {
    gap: 16,
  },
  chart: {
    flexDirection: "row",
    gap: 8,
  },
  chartDay: {
    flex: 1,
    alignItems: "center",
  },
  dayLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  barContainer: {
    width: "100%",
    height: 48,
    backgroundColor: "#E5E5E5",
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
  },
  dayScore: {
    fontSize: 12,
    color: "#444",
    marginTop: 4,
  },
  button: {
    borderWidth: 1,
    borderColor: "#D5D8DC",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});