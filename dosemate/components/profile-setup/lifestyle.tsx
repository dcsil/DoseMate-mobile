// components/Step3Lifestyle.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

type Option = { label: string; value: string };

type Props = {
  sleepSchedules: Option[];
  activityLevels: Option[];
  selectedSleep: string;
  setSleep: (val: string) => void;
  selectedActivity: string;
  setActivity: (val: string) => void;
};

export default function Lifestyle({
  sleepSchedules,
  activityLevels,
  selectedSleep,
  setSleep,
  selectedActivity,
  setActivity,
}: Props) {
  return (
    <View style={styles.stepContent}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: "#E8DAEF" }]}>
          <Ionicons name="moon-outline" size={32} color="#8E44AD" />
        </View>
      </View>
      <Text style={styles.stepTitle}>Lifestyle & Schedule</Text>
      <Text style={styles.stepSubtitle}>
        Help us optimize your medication reminders
      </Text>

      {/* Sleep Schedule */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Sleep Schedule</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedSleep}
            onValueChange={setSleep}
            style={styles.picker}
          >
            <Picker.Item label="Select sleep schedule..." value="" />
            {sleepSchedules.map((s) => (
              <Picker.Item key={s.value} label={s.label} value={s.value} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Activity Level */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Activity Level</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedActivity}
            onValueChange={setActivity}
            style={styles.picker}
          >
            <Picker.Item label="Select activity level..." value="" />
            {activityLevels.map((a) => (
              <Picker.Item key={a.value} label={a.label} value={a.value} />
            ))}
          </Picker>
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

  pickerContainer: {
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
    width: "100%",
  },
});
