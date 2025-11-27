import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons"; // Re-importing necessary icons

// --- Color Palette ---
const Colors = {
  primary: "#E74C3C",
  background: "#FFFFFF",
  textDark: "#333333", // Dark text (thin font weight makes it light)
  textLight: "#95A5A6", // Very light, delicate secondary text
  // Feature Colors - toned down
  iconSecurity: "#5DADE2", // Lighter Blue
  iconTime: "#F4D03F", // Gold
  iconHealth: "#E74C3C",
};

// --- Feature Data Structure (Using original icons) ---
const featuresData = [
  {
    iconComponent: MaterialIcons,
    iconName: "security",
    color: Colors.iconSecurity,
    text: "Secure",
  },
  {
    iconComponent: Ionicons,
    iconName: "time-outline",
    color: Colors.iconTime,
    text: "Reminders",
  },
  {
    iconComponent: FontAwesome5,
    iconName: "heartbeat",
    color: Colors.iconHealth,
    text: "Tracking",
  },
];

export default function OnboardingStart() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Branding and Core Identity */}
        <View style={styles.centerFocus}>
          <Ionicons
            name="heart-outline"
            size={70}
            color={Colors.primary}
            style={styles.mainIcon}
          />
          <Text style={styles.title}>DoseMate</Text>

          {/* Main Headline */}
          <Text style={styles.description}>
            Your reliable partner in medication adherence.
          </Text>

          {/* --- FEATURES (Subtle & Spaced Out) --- */}
          <View style={styles.featuresRow}>
            {featuresData.map((feature, index) => {
              const IconComponent = feature.iconComponent;
              return (
                <View key={index} style={styles.featureItem}>
                  <IconComponent
                    name={feature.iconName}
                    size={22}
                    color={feature.color}
                  />
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Call to Action - Thin and Subtle */}
        <View style={styles.bottomCta}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/onboarding/create-account")}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 40,
    paddingVertical: 40,
    justifyContent: "space-between",
  },

  // --- Login Link ---
  loginLink: {
    position: "absolute",
    top: 50,
    right: 30,
    zIndex: 10,
    padding: 10,
  },
  loginText: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.textLight,
  },

  // --- Center Focus ---
  centerFocus: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mainIcon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 56,
    fontWeight: "300",
    color: Colors.textDark,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    fontWeight: "400",
    color: Colors.textLight,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 40, // Increased spacing before features
  },

  // --- FEATURES ROW ---
  featuresRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around", // Spread features out
    paddingHorizontal: 10,
    marginTop: 10, // Small space after main description
  },
  featureItem: {
    alignItems: "center",
    paddingHorizontal: 5,
    // No borders or heavy backgrounds for lightness
  },
  featureText: {
    fontSize: 12, // Small, light text for minimal impact
    fontWeight: "400",
    color: Colors.textLight,
    marginTop: 4,
  },

  // --- Bottom CTA ---
  bottomCta: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "400",
  },
});
