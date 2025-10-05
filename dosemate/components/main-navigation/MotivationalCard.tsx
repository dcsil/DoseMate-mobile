import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "./Card";

interface MotivationalCardProps {
  title: string;
  message: string;
  badgeText: string;
}

export default function MotivationalCard({ title, message, badgeText }: MotivationalCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Ionicons name="trending-up" size={24} color="#8E44AD" />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F4ECF7",
    borderWidth: 1,
    borderColor: "#D7BDE2",
  },
  content: {
    flexDirection: "row",
    gap: 16,
  },
  icon: {
    width: 48,
    height: 48,
    backgroundColor: "#E8DAEF",
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
    color: "#6C3483",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#7D3C98",
    lineHeight: 20,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: "#E8DAEF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6C3483",
  },
});