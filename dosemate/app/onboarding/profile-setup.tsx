import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

import Header from "@/components/profile-header";
import ProgressBar from "@/components/progress-bar";
import {
  PersonalInfo,
  HealthInfo,
  Lifestyle,
} from "@/components/profile-setup";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [profile, setProfile] = useState({
    age: "",
    conditions: [] as string[],
    allergies: "",
    sleepSchedule: "",
    activityLevel: "",
  });

  const conditions = [
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

  const handleNext = () =>
    step < 3 ? setStep(step + 1) : router.push("/onboarding/tutorial");
  const handleBack = () => (step === 1 ? router.back() : setStep(step - 1));

  return (
    <View style={styles.container}>
      <Header step={step} handleBack={handleBack} />
      <ProgressBar step={step} totalSteps={3} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          <PersonalInfo
            age={profile.age}
            setAge={(age) => setProfile({ ...profile, age })}
          />
        )}
        {step === 2 && (
          <HealthInfo
            conditions={conditions}
            selectedConditions={profile.conditions}
            setConditions={(c) => setProfile({ ...profile, conditions: c })}
            allergies={profile.allergies}
            setAllergies={(a) => setProfile({ ...profile, allergies: a })}
          />
        )}
        {step === 3 && (
          <Lifestyle
            sleepSchedules={sleepSchedules}
            activityLevels={activityLevels}
            selectedSleep={profile.sleepSchedule}
            setSleep={(s) => setProfile({ ...profile, sleepSchedule: s })}
            selectedActivity={profile.activityLevel}
            setActivity={(a) => setProfile({ ...profile, activityLevel: a })}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
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
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 60 },
  scrollView: { flex: 1 },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  button: { borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
