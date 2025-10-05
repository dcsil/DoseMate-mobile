import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: "home", icon: "home", library: "ionicons", label: "Home" },
    { id: "medications", icon: "pill-multiple", library: "material", label: "Medications" },
    { id: "reminders", icon: "notifications", library: "ionicons", label: "Reminders" },
    { id: "progress", icon: "bar-chart", library: "ionicons", label: "Progress" },
    { id: "profile", icon: "person", library: "ionicons", label: "Profile" },
  ];

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const IconComponent = tab.library === "material" ? MaterialCommunityIcons : Ionicons;
        const isActive = activeTab === tab.id;
        
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.navItem}
            onPress={() => onTabChange(tab.id)}
          >
            <IconComponent
              name={tab.icon as any}
              size={24}
              color={isActive ? "#3498DB" : "#888"}
            />
            <Text
              style={[
                styles.navLabel,
                isActive && styles.navLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
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