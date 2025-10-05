import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Condition =
  | "Diabetes"
  | "Hypertension"
  | "Heart Disease"
  | "High Cholesterol"
  | "Arthritis"
  | "Asthma"
  | "Depression"
  | "Anxiety";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    age: "",
    conditions: [] as Condition[],
    allergies: "",
    sleepSchedule: "",
    activityLevel: "",
  });

  const conditions: Condition[] = [
    "Diabetes",
    "Hypertension",
    "Heart Disease",
    "High Cholesterol",
    "Arthritis",
    "Asthma",
    "Depression",
    "Anxiety",
  ];

  const sleepSchedules = [
    { label: "Early Bird (9 PM - 6 AM)", value: "early" },
    { label: "Normal (10 PM - 7 AM)", value: "normal" },
    { label: "Night Owl (11 PM - 8 AM)", value: "late" },
    { label: "Irregular Schedule", value: "irregular" },
  ];

  const activityLevels = [
    { label: "Low - Mostly sedentary", value: "low" },
    { label: "Moderate - Some exercise", value: "moderate" },
    { label: "High - Regular exercise", value: "high" },
    { label: "Very High - Athlete level", value: "athlete" },
  ];

  const handleConditionChange = (condition: Condition) => {
    if (profile.conditions.includes(condition)) {
      setProfile((prev) => ({
        ...prev,
        conditions: prev.conditions.filter((c) => c !== condition),
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        conditions: [...prev.conditions, condition],
      }));
    }
  };

  const canContinue = () => {
    switch (step) {
      case 1:
        return profile.age !== "";
      case 2:
        return profile.conditions.length > 0;
      case 3:
        return profile.sleepSchedule !== "" && profile.activityLevel !== "";
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Navigate to main app
      console.log("Profile setup complete", profile);
      router.push("/onboarding/tutorial");
    }
  };

  const handleBack = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
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
                    value={profile.age}
                    onChangeText={(text) =>
                      setProfile((prev) => ({ ...prev, age: text }))
                    }
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        );

      case 2:
        return (
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.stepContent}>
              <View style={styles.iconContainer}>
                <View style={[styles.iconCircle, { backgroundColor: "#D5F4E6" }]}>
                  <Ionicons name="heart-outline" size={32} color="#27AE60" />
                </View>
              </View>
              <Text style={styles.stepTitle}>Health Conditions</Text>
              <Text style={styles.stepSubtitle}>
                Select any conditions you manage (optional but helpful)
              </Text>

              <View style={styles.checkboxSection}>
                {conditions.map((condition) => (
                  <TouchableOpacity
                    key={condition}
                    style={styles.checkboxContainer}
                    onPress={() => handleConditionChange(condition)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        profile.conditions.includes(condition) &&
                          styles.checkboxChecked,
                      ]}
                    >
                      {profile.conditions.includes(condition) && (
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
                    value={profile.allergies}
                    onChangeText={(text) =>
                      setProfile((prev) => ({ ...prev, allergies: text }))
                    }
                    placeholderTextColor="#999"
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        );

      case 3:
        return (
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
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

              <View style={styles.inputSection}>
                <Text style={styles.label}>Sleep Schedule</Text>
                <View style={styles.selectSection}>
                  {sleepSchedules.map((schedule) => (
                    <TouchableOpacity
                      key={schedule.value}
                      style={[
                        styles.selectOption,
                        profile.sleepSchedule === schedule.value &&
                          styles.selectOptionSelected,
                      ]}
                      onPress={() =>
                        setProfile((prev) => ({
                          ...prev,
                          sleepSchedule: schedule.value,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.selectOptionText,
                          profile.sleepSchedule === schedule.value &&
                            styles.selectOptionTextSelected,
                        ]}
                      >
                        {schedule.label}
                      </Text>
                      {profile.sleepSchedule === schedule.value && (
                        <Ionicons name="checkmark-circle" size={20} color="#3498DB" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.label}>Activity Level</Text>
                <View style={styles.selectSection}>
                  {activityLevels.map((level) => (
                    <TouchableOpacity
                      key={level.value}
                      style={[
                        styles.selectOption,
                        profile.activityLevel === level.value &&
                          styles.selectOptionSelected,
                      ]}
                      onPress={() =>
                        setProfile((prev) => ({
                          ...prev,
                          activityLevel: level.value,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.selectOptionText,
                          profile.activityLevel === level.value &&
                            styles.selectOptionTextSelected,
                        ]}
                      >
                        {level.label}
                      </Text>
                      {profile.activityLevel === level.value && (
                        <Ionicons name="checkmark-circle" size={20} color="#3498DB" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Setup</Text>
        <Text style={styles.stepIndicator}>{step}/3</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(step / 3) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Step Content */}
      {renderStep()}

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: canContinue() ? "#E74C3C" : "#BDC3C7" },
          ]}
          disabled={!canContinue()}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {step === 3 ? "Complete Setup" : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  stepIndicator: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E5E5",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3498DB",
    borderRadius: 4,
  },
  scrollContent: {
    flex: 1,
  },
  stepContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
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
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  textAreaContainer: {
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    padding: 16,
    minHeight: 100,
  },
  textAreaIcon: {
    marginBottom: 8,
  },
  textArea: {
    fontSize: 16,
    color: "#333",
    minHeight: 60,
  },
  checkboxSection: {
    marginBottom: 24,
  },
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
  checkboxChecked: {
    backgroundColor: "#3498DB",
    borderColor: "#3498DB",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  selectSection: {
    gap: 12,
  },
  selectOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderRadius: 10,
  },
  selectOptionSelected: {
    borderColor: "#3498DB",
    backgroundColor: "#EBF5FB",
  },
  selectOptionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  selectOptionTextSelected: {
    color: "#3498DB",
    fontWeight: "600",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  button: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});