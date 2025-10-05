// components/Step1Age.tsx
import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  age: string;
  setAge: (age: string) => void;
};

export default function PersonalInfo({ age, setAge }: Props) {
  return (
    <View style={styles.stepContent}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: "#D6EAF8" }]}>
          <Ionicons name="person-outline" size={32} color="#3498DB" />
        </View>
      </View>
      <Text style={styles.stepTitle}>Tell us about yourself</Text>
      <Text style={styles.stepSubtitle}>
        This helps us personalize your experience
      </Text>

      <View style={styles.inputSection}>
        <Text style={styles.label}>Age</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color="#888"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
            placeholderTextColor="#999"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContent: { paddingHorizontal: 20, paddingBottom: 24 },
  iconContainer: { alignItems: "center", marginBottom: 16 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 32,
  },
  inputSection: { marginBottom: 24 },
  label: { fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 12 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: "#333" },
});
