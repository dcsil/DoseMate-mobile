import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function PrivacyScreen() {
  const router = useRouter();
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const scrollY = contentOffset.y;
    const isEnd = layoutMeasurement.height + scrollY >= contentSize.height - 20;

    // Hide hint as soon as user scrolls down even a bit
    if (scrollY > 10 && showHint) {
      setShowHint(false);
    }

    if (isEnd && !hasScrolledToEnd) {
      setHasScrolledToEnd(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Centered Section */}
        <View style={styles.centerSection}>
          <Ionicons name="shield-checkmark" size={72} color="#3498DB" />
          <Text style={styles.mainTitle}>Your Privacy Matters</Text>
          <Text style={styles.mainSubtitle}>
            Please review our privacy policy before continuing
          </Text>
        </View>

        {/* Info Boxes */}
        <View
          style={[styles.infoBox, { backgroundColor: "rgba(52,152,219,0.1)" }]}
        >
          <Ionicons name="lock-closed-outline" size={24} color="#3498DB" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Data Security</Text>
            <Text style={styles.infoText}>
              All your health information is encrypted and stored securely. We
              use industry-standard security measures to protect your data.
            </Text>
          </View>
        </View>

        <View
          style={[styles.infoBox, { backgroundColor: "rgba(46,204,113,0.1)" }]}
        >
          <Ionicons name="eye-outline" size={24} color="#27AE60" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>What We Collect</Text>
            <Text style={styles.infoText}>
              We only collect the information necessary to help you manage your
              medications effectively:
            </Text>
            <Text style={styles.bullet}>• Medication names and schedules</Text>
            <Text style={styles.bullet}>• Health conditions (optional)</Text>
            <Text style={styles.bullet}>• Reminder preferences</Text>
            <Text style={styles.bullet}>• Usage analytics (anonymous)</Text>
          </View>
        </View>

        {/* Privacy Policy */}
        <Text style={styles.policyTitle}>Privacy Policy</Text>
        <Text style={styles.policyText}>
          At DoseMate, we are committed to protecting your privacy and ensuring
          the security of your personal health information. This privacy policy
          explains how we collect, use, and protect your data.
          {"\n\n"}
          <Text style={styles.policySubTitle}>Information We Collect:</Text> We
          collect only the minimum information necessary to provide our
          medication management services. This includes medication names and
          schedules, health conditions you choose to share, and app usage data
          to improve our services.
          {"\n\n"}
          <Text style={styles.policySubTitle}>
            How We Use Your Information:
          </Text>{" "}
          Your information is used solely to provide medication reminders, track
          adherence, and improve your health outcomes. We never sell your
          personal information to third parties.
          {"\n\n"}
          <Text style={styles.policySubTitle}>Data Security:</Text> We employ
          enterprise-grade encryption and security measures to protect your
          data. All information is encrypted in transit and at rest.
          {"\n\n"}
          <Text style={styles.policySubTitle}>Your Rights:</Text> You have the
          right to access, modify, or delete your personal information at any
          time. You can also export your data or request account deletion
          through the app settings.
          {"\n\n"}
          <Text style={styles.policySubTitle}>Medical Disclaimer:</Text>{" "}
          DoseMate is not a substitute for professional medical advice. Always
          consult with your healthcare provider regarding your medications and
          health conditions.
          {"\n\n"}
          By continuing, you acknowledge that you have read and understood this
          privacy policy and agree to our terms of service.
        </Text>
      </ScrollView>

      {/* Scroll Hint (now outside ScrollView) */}
      {showHint && !hasScrolledToEnd && (
        <Text style={styles.scrollHint}>↓ Scroll to continue ↓</Text>
      )}

      {/* Bottom Button */}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: hasScrolledToEnd ? "#E74C3C" : "#BDC3C7" },
        ]}
        disabled={!hasScrolledToEnd}
        onPress={() => router.push("/onboarding/profile-setup")}
      >
        <Text style={styles.buttonText}>
          {hasScrolledToEnd ? "Accept Terms" : "Please read the full policy"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#333" },
  scrollContainer: { paddingHorizontal: 20, marginVertical: 24 },
  centerSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#3498DB",
    marginTop: 8,
  },
  mainSubtitle: { textAlign: "center", color: "#555", marginTop: 6 },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  infoTextContainer: { flex: 1 },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    color: "#333",
  },
  infoText: { fontSize: 14, color: "#555" },
  bullet: { fontSize: 14, color: "#555", marginLeft: 12, marginTop: 4 },
  policyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 12,
    color: "#333",
  },
  policySubTitle: { fontWeight: "700", color: "#333" },
  policyText: { fontSize: 14, color: "#444", lineHeight: 22 },
  scrollHint: {
    textAlign: "center",
    color: "#888",
    marginVertical: 8,
    fontStyle: "italic",
  },
  button: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
