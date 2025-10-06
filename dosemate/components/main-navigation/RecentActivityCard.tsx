import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "./Card";
import ActivityItem from "./ActivityItem";

interface Activity {
  id: string;
  name: string;
  strength: string;
  lastTaken: string;
  time: string;
  status: "taken" | "upcoming" | "overdue";
}

interface RecentActivityCardProps {
  activities: Activity[];
}

export default function RecentActivityCard({ activities }: RecentActivityCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <Ionicons name="time" size={20} color="#3498DB" />
        <Text style={styles.title}>Recent Activity</Text>
      </View>
      <View style={styles.content}>
        {activities.map((activity, index) => (
          <ActivityItem
            key={index}
            name={activity.name}
            strength={activity.strength}
            time={activity.time}
            status={activity.status}
          />
        ))}
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
    gap: 12,
  },
});
