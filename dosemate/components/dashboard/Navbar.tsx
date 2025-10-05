import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: "home", icon: "home" as keyof typeof Ionicons.glyphMap, label: "Home" },
    { id: "medications", icon: "medical" as keyof typeof Ionicons.glyphMap, label: "Medications" },
    { id: "reminders", icon: "notifications" as keyof typeof Ionicons.glyphMap, label: "Reminders" },
    { id: "progress", icon: "bar-chart" as keyof typeof Ionicons.glyphMap, label: "Progress" },
    { id: "profile", icon: "person" as keyof typeof Ionicons.glyphMap, label: "Profile" },
  ];

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.navItem}
          onPress={() => onTabChange(tab.id)}
        >
          <Ionicons
            name={tab.icon}
            size={24}
            color={activeTab === tab.id ? "#3498DB" : "#888"}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === tab.id && styles.navLabelActive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingVertical: 8,
    paddingBottom: 24,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    gap: 4,
  },
  navLabel: {
    fontSize: 12,
    color: "#888",
  },
  navLabelActive: {
    color: "#3498DB",
    fontWeight: "600",
  },
});