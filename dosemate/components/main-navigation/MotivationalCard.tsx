import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "./Card";

interface MotivationalCardProps {
  title: string;
  message: string;
  badgeText: string;
  type?: "positive" | "negative" | "neutral" | "warning";
}

export default function MotivationalCard({
  title,
  message,
  badgeText,
  type = "positive",
}: MotivationalCardProps) {
  const colors = {
    positive: {
      cardBg: "#F4ECF7",
      cardBorder: "#D7BDE2",
      iconBg: "#E8DAEF",
      iconColor: "#8E44AD",
      icon: "trending-up" as keyof typeof Ionicons.glyphMap,
      titleColor: "#6C3483",
      messageColor: "#7D3C98",
      badgeBg: "#E8DAEF",
      badgeText: "#6C3483",
    },
    negative: {
      cardBg: "#FADBD8",
      cardBorder: "#F5B7B1",
      iconBg: "#F5B7B1",
      iconColor: "#C0392B",
      icon: "trending-down" as keyof typeof Ionicons.glyphMap,
      titleColor: "#922B21",
      messageColor: "#C0392B",
      badgeBg: "#F5B7B1",
      badgeText: "#922B21",
    },
    neutral: {
      cardBg: "#EEF2F3",
      cardBorder: "#D6DBDF",
      iconBg: "#D5DBDB",
      iconColor: "#566573",
      icon: "alert" as keyof typeof Ionicons.glyphMap,
      titleColor: "#34495E",
      messageColor: "#566573",
      badgeBg: "#D5DBDB",
      badgeText: "#34495E",
    },
    warning: {
      cardBg: "#FEF5E7",
      cardBorder: "#FAD7A0",
      iconBg: "#FDEBD0",
      iconColor: "#D35400",
      icon: "warning" as keyof typeof Ionicons.glyphMap,
      titleColor: "#B9770E",
      messageColor: "#D35400",
      badgeBg: "#FDEBD0",
      badgeText: "#B9770E",
    },
  };

  const theme = colors[type];

  return (
    <Card
      style={[
        styles.card,
        { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.icon, { backgroundColor: theme.iconBg }]}>
          <Ionicons name={theme.icon} size={24} color={theme.iconColor} />
        </View>
        <View style={styles.text}>
          <Text style={[styles.title, { color: theme.titleColor }]}>
            {title}
          </Text>
          <Text style={[styles.message, { color: theme.messageColor }]}>
            {message}
          </Text>
          <View style={[styles.badge, { backgroundColor: theme.badgeBg }]}>
            <Text style={[styles.badgeText, { color: theme.badgeText }]}>
              {badgeText}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  content: {
    flexDirection: "row",
    gap: 16,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
