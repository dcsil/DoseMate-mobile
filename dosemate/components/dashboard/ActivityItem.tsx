import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ActivityItemProps {
  medicationName: string;
  time: string;
  status: "taken" | "upcoming" | "overdue";
}

export default function ActivityItem({ medicationName, time, status }: ActivityItemProps) {
  const statusConfig = {
    taken: {
      bg: "#D5F4E6",
      iconBg: "#27AE60",
      badge: "Taken",
      badgeBg: "#A9DFBF",
      badgeText: "#145A32",
    },
    upcoming: {
      bg: "#FCF3CF",
      iconBg: "#F39C12",
      badge: "Upcoming",
      badgeBg: "#F9E79F",
      badgeText: "#7D6608",
    },
    overdue: {
      bg: "#FADBD8",
      iconBg: "#E74C3C",
      badge: "Overdue",
      badgeBg: "#F5B7B1",
      badgeText: "#922B21",
    },
  };

  const config = statusConfig[status];

  return (
    <View style={[styles.activityItem, { backgroundColor: config.bg }]}>
      <View style={styles.activityContent}>
        <View style={[styles.activityIcon, { backgroundColor: config.iconBg }]}>
          <Ionicons name="medical" size={16} color="#fff" />
        </View>
        <View style={styles.activityText}>
          <Text style={styles.activityName}>{medicationName}</Text>
          <Text style={styles.activityTime}>{time}</Text>
        </View>
      </View>
      <View style={[styles.activityBadge, { backgroundColor: config.badgeBg }]}>
        <Text style={[styles.activityBadgeText, { color: config.badgeText }]}>
          {config.badge}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
  },
  activityContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  activityText: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 14,
    color: "#666",
  },
  activityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activityBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});