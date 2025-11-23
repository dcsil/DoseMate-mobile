import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BACKEND_BASE_URL } from "@/config";

export default function PhoneSignUpScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"enterPhone" | "enterCode">("enterPhone");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    if (!phone) {
      Alert.alert("Missing phone", "Please enter your phone number.");
      return;
    }

    try {
      setIsLoading(true);

      // TODO: replace with backend SMS/OTP endpoint
      const res = await fetch(`${BACKEND_BASE_URL}/auth/phone/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to send code");
      }

      setStep("enterCode");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      Alert.alert("Missing code", "Please enter the verification code.");
      return;
    }

    try {
      setIsLoading(true);

      // TODO: replace with backend verify endpoint
      const res = await fetch(`${BACKEND_BASE_URL}/auth/phone/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to verify code");
      }

      // After successful phone verification, go to privacy screen
      router.replace("/onboarding/privacy");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign up with Phone</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        {step === "enterPhone" ? (
          <>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 555 123 4567"
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={[styles.primaryBtn, isLoading && { opacity: 0.8 }]}
              onPress={handleSendCode}
              disabled={isLoading}
            >
              <Text style={styles.primaryBtnText}>
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="Enter the code you received"
              keyboardType="number-pad"
            />
            <TouchableOpacity
              style={[styles.primaryBtn, isLoading && { opacity: 0.8 }]}
              onPress={handleVerifyCode}
              disabled={isLoading}
            >
              <Text style={styles.primaryBtnText}>
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  body: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
    marginTop: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  primaryBtn: {
    marginTop: 30,
    backgroundColor: "#E74C3C",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
