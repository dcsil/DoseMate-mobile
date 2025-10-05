import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type IconLibrary = "ionicons" | "material";

interface StatsCardProps {
  icon: string;
  iconLibrary?: IconLibrary;
  iconColor: string;
  iconBgColor: string;
  label: string;
  value: string;
  cardBgColor: string;
  borderColor: string;
}

export default function StatsCard({
  icon,
  iconLibrary = "ionicons",
  iconColor,
  iconBgColor,
  label,
  value,
  cardBgColor,
  borderColor,
}: StatsCardProps) {
  const IconComponent = iconLibrary === "material" ? MaterialCommunityIcons : Ionicons;
  
  return (
    <View style={[styles.card, { backgroundColor: cardBgColor, borderColor }]}>
      <View style={styles.content}>
        <View style={[styles.icon, { backgroundColor: iconBgColor }]}>
          <IconComponent name={icon as any} size={20} color={iconColor} />
        </View>
        <View>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
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
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
});