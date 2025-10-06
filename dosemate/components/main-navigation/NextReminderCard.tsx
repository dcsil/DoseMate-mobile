import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface NextReminderCardProps {
  name: string;
  strength: string;
  time: string;
  onViewPress?: () => void;
}

export default function NextReminderCard({ name, strength, time, onViewPress }: NextReminderCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.left}>
          <Ionicons name="notifications" size={24} color="#F39C12" />
          <View style={styles.text}>
            <Text style={styles.label}>Next reminder</Text>
            <Text style={styles.medication}>{name} {strength}{"\n"}{time}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.button} onPress={onViewPress}>
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#FCF3CF",
    borderColor: "#F9E79F",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  text: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  medication: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  button: {
    backgroundColor: "#F39C12",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});