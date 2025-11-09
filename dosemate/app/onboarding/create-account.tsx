import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BACKEND_BASE_URL } from "@/config";

import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";

WebBrowser.maybeCompleteAuthSession();

export default function CreateAccountScreen() {
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      console.log("Deep link received:", url);
      const { queryParams } = Linking.parse(url);
      const token = queryParams?.token;
      console.log("Received token:", token);

      if (token && typeof token === "string") {
        await SecureStore.setItemAsync("jwt", token);
        router.replace("/onboarding/privacy");
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, [router]);

  const handleGoogleLogin = async () => {
    const authUrl = `${BACKEND_BASE_URL}/auth/google`;

    // open in external browser
    await WebBrowser.openBrowserAsync(authUrl);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Welcome Text */}
      <View style={styles.body}>
        <Text style={styles.welcome}>Welcome to DoseMate</Text>
        <Text style={styles.subtitle}>
          Choose how you&apos;d like to create your account
        </Text>

        {/* Google Option */}
        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin}>
          <FontAwesome name="google" size={20} color="#fff" />
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        {/* Email & Phone Options */}
        <TouchableOpacity
          style={styles.optionBtn}
          onPress={() => router.push("/onboarding/privacy")}
        >
          <Ionicons name="mail-outline" size={22} color="#333" />
          <Text style={styles.optionText}>Use Email Address</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionBtn}>
          <Ionicons name="call-outline" size={22} color="#333" />
          <Text style={styles.optionText}>Use Phone Number</Text>
        </TouchableOpacity>
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
    marginBottom: 40,
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
    alignItems: "center",
  },
  welcome: {
    fontSize: 24,
    fontWeight: "700",
    color: "#E74C3C",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 32,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    justifyContent: "center",
    gap: 10,
  },
  googleText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#888",
    fontWeight: "500",
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: "100%",
    justifyContent: "center",
    marginBottom: 16,
    gap: 10,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});
