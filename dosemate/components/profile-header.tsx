import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  step: number;
  handleBack: () => void;
};

export default function Header({ step, handleBack }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Profile Setup</Text>
      <Text style={styles.stepIndicator}>{step}/3</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#333" },
  stepIndicator: { fontSize: 14, color: "#888", fontWeight: "500" },
});
