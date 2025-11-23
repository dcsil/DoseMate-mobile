import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "@/components/main-navigation/Card";
import * as SecureStore from "expo-secure-store";
import { BACKEND_BASE_URL } from "@/config";

const profileOptions = [
  {
    icon: "person-outline",
    title: "Personal Information",
    subtitle: "Update your profile details",
    action: "personal-info",
  },
  {
    icon: "notifications-outline",
    title: "Notification Settings",
    subtitle: "Customize your reminders",
    action: "notifications",
  },
  {
    icon: "calendar-outline",
    title: "Schedule Preferences",
    subtitle: "Set your daily routine",
    action: "schedule",
  },
  {
    icon: "bar-chart-outline",
    title: "Health Goals",
    subtitle: "Set adherence targets",
    action: "health-goals",
  },
];

type User = {
  id: string;
  name: string | null;
  email?: string;
};

export default function ProfileTab() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleProfileOption = (option: string) =>
    console.log("Profile option pressed:", option);

  const handleLearnMorePremium = () =>
    console.log("Learn more about premium pressed");

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = await SecureStore.getItemAsync("jwt");
        if (!token) {
          setError("You’re not logged in.");
          setIsLoading(false);
          return;
        }

        const res = await fetch(`${BACKEND_BASE_URL}/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          console.warn("Failed to fetch user:", data || res.statusText);

          let message = "Failed to load your profile.";
          if (data?.detail) {
            if (typeof data.detail === "string") {
              message = data.detail;
            } else if (Array.isArray(data.detail)) {
              message = data.detail
                .map((d: any) => d.msg ?? String(d))
                .join("\n");
            }
          }

          setError(message);
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Something went wrong while loading your profile.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const displayName = user?.name || user?.email || "Your Profile";

  if (isLoading) {
    return (
      <View
        style={[
          styles.scrollContent,
          { flex: 1, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator />
        <Text style={{ marginTop: 12, color: "#666" }}>
          Loading your profile...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.scrollContent,
          { flex: 1, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: "#E85D5B", marginBottom: 8 }}>{error}</Text>
        <Text style={{ color: "#666", fontSize: 13, textAlign: "center" }}>
          Try logging in again or restarting the app.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHeader}>
        <View style={styles.profileIconContainer}>
          <Ionicons name="person" size={48} color="#E85D5B" />
        </View>
        <Text style={styles.profileName}>{displayName}</Text>
      </View>

      <View style={styles.section}>
        {profileOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleProfileOption(option.action)}
          >
            <Card style={styles.listItem}>
              <View style={styles.listItemContent}>
                <View style={styles.profileOptionIcon}>
                  <Ionicons
                    name={option.icon as any}
                    size={22}
                    color="#E85D5B"
                  />
                </View>
                <View style={styles.listItemText}>
                  <Text style={styles.listItemTitle}>{option.title}</Text>
                  <Text style={styles.listItemSubtitle}>{option.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CCC" />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <Card style={styles.premiumCard}>
          <View style={styles.premiumIconContainer}>
            <Ionicons name="star" size={32} color="#F4C03A" />
          </View>
          <Text style={styles.premiumTitle}>DoseMate Premium</Text>
          <Text style={styles.premiumSubtitle}>
            Get advanced analytics and family sharing
          </Text>
          <TouchableOpacity
            style={styles.premiumButton}
            onPress={handleLearnMorePremium}
          >
            <Text style={styles.primaryButtonText}>Learn More</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flex: 1, paddingHorizontal: 20 },
  section: { marginTop: 20 },
  lastSection: { marginBottom: 100 },

  // Profile Header
  profileHeader: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 12,
  },
  profileIconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#FFF5F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  profileSubtext: {
    fontSize: 14,
    color: "#999",
    fontWeight: "400",
  },

  // List Items
  listItem: {
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  listItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  profileOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  listItemText: { flex: 1 },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  listItemSubtitle: {
    fontSize: 13,
    color: "#999",
  },

  // Premium Card
  premiumCard: {
    backgroundColor: "#FFFBF0",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  premiumIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#F4C03A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  premiumButton: {
    backgroundColor: "#E85D5B",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#E85D5B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
});
