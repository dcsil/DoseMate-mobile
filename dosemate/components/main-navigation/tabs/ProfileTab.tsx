import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "@/components/main-navigation/Card";
import * as SecureStore from "expo-secure-store";
import { BACKEND_BASE_URL } from "@/config";

type User = {
  id: string;
  name: string | null;
  email?: string;
};

type UserProfile = {
  age: number | null;
  allergies: string | null;
  conditions: string[] | null;
  activity_level: string | null;
  sleep_schedule: string | null;
};

export default function ProfileTab() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLearnMorePremium = () => {
    Alert.alert(
      "DoseMate Premium",
      "Upgrade to Premium for:\n\n• Advanced analytics\n• Clinical Dashboard Integration \n• Priority support\n• Unlimited medications\n• Adaptive reminders",
      [
        { text: "stay tuned!", style: "cancel" }
      ]
    );
  };

  useEffect(() => {
    const loadUserAndProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = await SecureStore.getItemAsync("jwt");
        if (!token) {
          setError("You're not logged in.");
          setIsLoading(false);
          return;
        }

        // Call 1: Get basic user info
        const userRes = await fetch(`${BACKEND_BASE_URL}/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!userRes.ok) {
          const data = await userRes.json().catch(() => null);
          console.warn("Failed to fetch user:", data || userRes.statusText);

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

        const userData = await userRes.json();
        setUser(userData);
        console.log("Fetched user:", userData);

        // Call 2: Get profile data
        const profileRes = await fetch(`${BACKEND_BASE_URL}/profile/me/complete`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          console.log("Fetched profile:", profileData);
          setProfile(profileData);
        } else {
          console.warn("Failed to fetch profile, continuing without it");
        }

      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Something went wrong while loading your profile.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserAndProfile();
  }, []);

  const displayName = user?.name || user?.email || "Your Profile";

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E85D5B" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#E85D5B" />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>
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
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileIconContainer}>
          <Ionicons name="person" size={48} color="#E85D5B" />
        </View>
        <Text style={styles.profileName}>{displayName}</Text>
        {user?.email && (
          <Text style={styles.profileEmail}>{user.email}</Text>
        )}
      </View>

      {/* Profile Information */}
      {profile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <Card style={styles.infoCard}>
            {profile.age && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="calendar-outline" size={20} color="#E85D5B" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Age</Text>
                  <Text style={styles.infoValue}>{profile.age} years old</Text>
                </View>
              </View>
            )}

            {profile.activity_level && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="fitness-outline" size={20} color="#E85D5B" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Activity Level</Text>
                  <Text style={styles.infoValue}>
                    {profile.activity_level.charAt(0).toUpperCase() + 
                     profile.activity_level.slice(1)}
                  </Text>
                </View>
              </View>
            )}

            {profile.sleep_schedule && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="moon-outline" size={20} color="#E85D5B" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Sleep Schedule</Text>
                  <Text style={styles.infoValue}>
                    {profile.sleep_schedule.charAt(0).toUpperCase() + 
                     profile.sleep_schedule.slice(1)}
                  </Text>
                </View>
              </View>
            )}

            {profile.conditions && profile.conditions.length > 0 && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="medical-outline" size={20} color="#E85D5B" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Medical Conditions</Text>
                  <Text style={styles.infoValue}>
                    {profile.conditions.join(", ")}
                  </Text>
                </View>
              </View>
            )}

            {profile.allergies && (
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <View style={styles.infoIcon}>
                  <Ionicons name="warning-outline" size={20} color="#E85D5B" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Allergies</Text>
                  <Text style={styles.infoValue}>{profile.allergies}</Text>
                </View>
              </View>
            )}
          </Card>
        </View>
      )}

      {!profile && (
        <View style={styles.section}>
          <Card style={styles.emptyCard}>
            <Ionicons name="information-circle-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No profile information yet</Text>
            <Text style={styles.emptySubtext}>
              Add your health information to get personalized medication reminders
            </Text>
          </Card>
        </View>
      )}

      {/* Premium Card */}
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
  scrollContent: { 
    flex: 1, 
    paddingHorizontal: 20,
    backgroundColor: "#F8F9FA",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#F8F9FA",
  },
  section: { marginTop: 20 },
  lastSection: { marginBottom: 100 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 12,
    letterSpacing: -0.3,
  },

  // Loading & Error States
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 15,
  },
  errorText: {
    color: "#E85D5B",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  errorSubtext: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },

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
  profileEmail: {
    fontSize: 14,
    color: "#999",
    fontWeight: "400",
  },

  // Profile Info Card
  infoCard: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF5F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: "#999",
    marginBottom: 5,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#2C2C2C",
    fontWeight: "600",
    lineHeight: 22,
  },

  // Empty State
  emptyCard: {
    padding: 40,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
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