import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export default function OnboardingStart() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Heart Icon */}
      <Ionicons name="heart" size={72} color="#E74C3C" style={styles.icon} />

      {/* Title */}
      <Text style={styles.title}>DoseMate</Text>
      <Text style={styles.subtitle}>Your partner in staying on track</Text>

      {/* Description */}
      <Text style={styles.description}>
        Never miss your medication again with smart reminders and tracking.
      </Text>

      {/* Feature Row */}
      <View style={styles.features}>
        <View style={styles.featureItem}>
          <MaterialIcons name="security" size={24} color="#3498DB" />
          <Text style={styles.featureText}>Secure & Private</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="time-outline" size={24} color="#F1C40F" />
          <Text style={styles.featureText}>Smart Reminders</Text>
        </View>
        <View style={styles.featureItem}>
          <FontAwesome5 name="heartbeat" size={22} color="#E74C3C" />
          <Text style={styles.featureText}>Health Tracking</Text>
        </View>
      </View>

      {/* Get Started Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/onboarding/create-account")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#E74C3C",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginBottom: 32,
  },
  features: {
    marginBottom: 48,
    width: "100%",
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  featureText: {
    fontSize: 16,
    color: "#444",
  },
  button: {
    backgroundColor: "#E74C3C",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
