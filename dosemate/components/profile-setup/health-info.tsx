// components/Step2Conditions.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Condition = string;

type Props = {
  conditions: Condition[];
  selectedConditions: Condition[];
  setConditions: (c: Condition[]) => void;
  allergies: string;
  setAllergies: (text: string) => void;
};

export default function HealthInfo({
  conditions,
  selectedConditions,
  setConditions,
  allergies,
  setAllergies,
}: Props) {
  const toggleCondition = (condition: Condition) => {
    if (selectedConditions.includes(condition)) {
      setConditions(selectedConditions.filter((c) => c !== condition));
    } else {
      setConditions([...selectedConditions, condition]);
    }
  };

  return (
    <View style={styles.stepContent}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: "#D5F4E6" }]}>
          <Ionicons name="heart-outline" size={32} color="#27AE60" />
        </View>
      </View>
      <Text style={styles.stepTitle}>Health Conditions</Text>
      <Text style={styles.stepSubtitle}>
        Select any conditions you manage {"\n"}(optional but helpful)
      </Text>

      <View style={styles.checkboxSection}>
        {conditions.map((condition) => (
          <TouchableOpacity
            key={condition}
            style={styles.checkboxContainer}
            onPress={() => toggleCondition(condition)}
          >
            <View
              style={[
                styles.checkbox,
                selectedConditions.includes(condition) &&
                  styles.checkboxChecked,
              ]}
            >
              {selectedConditions.includes(condition) && (
                <Ionicons name="checkmark" size={18} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>{condition}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.label}>Known Allergies</Text>
        <View style={styles.textAreaContainer}>
          <Ionicons
            name="warning-outline"
            size={20}
            color="#888"
            style={styles.textAreaIcon}
          />
          <TextInput
            style={styles.textArea}
            placeholder="List any medication or food allergies..."
            multiline
            numberOfLines={4}
            value={allergies}
            onChangeText={setAllergies}
            placeholderTextColor="#999"
            textAlignVertical="top"
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

  checkboxSection: { marginBottom: 24 },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#BDC3C7",
    borderRadius: 6,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#3498DB", borderColor: "#3498DB" },
  checkboxLabel: { fontSize: 16, color: "#333", flex: 1 },

  inputSection: { marginBottom: 24 },
  label: { fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 12 },
  textAreaContainer: {
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    padding: 16,
    minHeight: 100,
  },
  textAreaIcon: { marginBottom: 8 },
  textArea: { fontSize: 16, color: "#333", minHeight: 60 },
});
