import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Card from "@/components/main-navigation/Card";
import { Reminder } from "./types";
import { BACKEND_BASE_URL } from "@/config";
import * as SecureStore from "expo-secure-store";

export default function RemindersTab() {
  // ============ STATIC DATA FOR REMINDERS TAB - Organized for Backend Integration ============

  const generateColor = (name: string) => {
    const COLORS = ["#2196F3", "#4CAF50", "#9C27B0", "#FF9800"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COLORS.length;
    return COLORS[index];
  };

  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        // 1. Get the JWT
        const token = await SecureStore.getItemAsync("jwt");
        if (!token) {
          console.warn("⚠️ No JWT found");
          return;
        }

        // 2. Call backend
        const res = await fetch(`${BACKEND_BASE_URL}/reminders/today`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("❌ Failed to fetch reminders:", res.status);
          return;
        }

        // 3. Parse JSON
        const data = await res.json();

        const hydrated = data.map((item: any) => ({
          ...item,
          color: generateColor(item.name),
        }));

        // 4. Update state
        setReminders(hydrated);
      } catch (err) {
        console.error("🔥 Error fetching reminders:", err);
      }
    };

    fetchReminders();
  }, []);

  const handleMarkTaken = async (id: number) => {
    try {
      setReminders(
        reminders.map((reminder) =>
          reminder.id === id
            ? { ...reminder, status: "taken" as const, overdue: false }
            : reminder,
        ),
      );

      // Get JWT
      const token = await SecureStore.getItemAsync("jwt");
      if (!token) return;

      // Call backend to mark as taken
      const res = await fetch(
        `${BACKEND_BASE_URL}/reminders/${id}/mark-taken`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        console.error("❌ Failed to mark reminder as taken:", res.status);
        // Optionally rollback local state here
      }
    } catch (err) {
      console.error("🔥 Error marking reminder as taken:", err);
    }
  };

  const handleSnooze = async (id: number) => {
    try {
      setReminders(
        reminders.map((reminder) =>
          reminder.id === id
            ? { ...reminder, status: "snoozed" as const }
            : reminder,
        ),
      );

      const token = await SecureStore.getItemAsync("jwt");
      if (!token) return;

      const res = await fetch(`${BACKEND_BASE_URL}/reminders/${id}/snooze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("❌ Failed to snooze reminder:", res.status);
        // Optionally rollback local state here
      }
    } catch (err) {
      console.error("🔥 Error snoozing reminder:", err);
    }
  };

  const pendingReminders = reminders.filter(
    (r) =>
      r.status === "pending" ||
      r.status === "overdue" ||
      r.status === "snoozed",
  );
  const completedReminders = reminders.filter((r) => r.status === "taken");
  const overdueCount = reminders.filter((r) => r.overdue)?.length;

  return (
    <ScrollView
      style={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Summary Cards */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Card style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: "#E85D5B" }]}>
              {pendingReminders?.length}
            </Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </Card>

          <Card style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: "#4CAF50" }]}>
              {completedReminders?.length}
            </Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </Card>

          <Card style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: "#FF6B6B" }]}>
              {overdueCount}
            </Text>
            <Text style={styles.summaryLabel}>Overdue</Text>
          </Card>
        </View>
      </View>

      {/* Pending Reminders */}
      {pendingReminders?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Pending Reminders</Text>
          <View style={styles.list}>
            {pendingReminders.map((reminder) => (
              <Card
                key={reminder.id}
                style={[
                  styles.reminderCard,
                  reminder.overdue && styles.overdueCard,
                  !reminder.overdue &&
                    reminder.status === "snoozed" &&
                    styles.snoozedCard,
                ]}
              >
                <View style={styles.reminderHeader}>
                  <View style={styles.reminderInfo}>
                    <View
                      style={[
                        styles.pillIcon,
                        { backgroundColor: reminder.color },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="pill"
                        size={32}
                        color="#FFFFFF"
                      />
                      {reminder.overdue ? (
                        <View style={styles.overdueIndicator}>
                          <Ionicons name="time" size={12} color="#FFFFFF" />
                        </View>
                      ) : reminder.status === "snoozed" ? (
                        <View style={styles.snoozedIndicator}>
                          <Ionicons
                            name="hourglass"
                            size={12}
                            color="#FFFFFF"
                          />
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.reminderDetails}>
                      <Text style={styles.reminderMedication}>
                        {reminder.name}
                      </Text>
                      <Text style={styles.reminderDose}>
                        {reminder.strength} • {reminder.quantity}
                      </Text>
                      <Text style={styles.reminderInstructions}>
                        {reminder.instructions}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.timeBadge,
                      reminder.overdue && styles.overdueBadge,
                      !reminder.overdue &&
                        reminder.status === "snoozed" &&
                        styles.snoozedBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeBadgeText,
                        reminder.overdue && styles.overdueBadgeText,
                        !reminder.overdue &&
                          reminder.status === "snoozed" &&
                          styles.snoozedBadgeText,
                      ]}
                    >
                      {reminder.overdue
                        ? "Overdue"
                        : reminder.status === "snoozed"
                          ? "Snoozed"
                          : reminder.time}
                    </Text>
                  </View>
                </View>

                <View style={styles.reminderActions}>
                  <TouchableOpacity
                    style={styles.primaryAction}
                    onPress={() => handleMarkTaken(reminder.id)}
                  >
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.primaryActionText}>Mark as Taken</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryAction}
                    onPress={() => handleSnooze(reminder.id)}
                  >
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={20}
                      color="#2C2C2C"
                    />
                    <Text style={styles.secondaryActionText}>Snooze</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        </View>
      )}

      {/* Completed Reminders */}
      {completedReminders?.length > 0 && (
        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.subtitle}>Completed Today</Text>
          <View style={styles.list}>
            {completedReminders.map((reminder) => (
              <Card key={reminder.id} style={styles.completedCard}>
                <View style={styles.completedReminderContent}>
                  <View
                    style={[
                      styles.pillIconSmall,
                      { backgroundColor: reminder.color },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="pill"
                      size={24}
                      color="#FFFFFF"
                    />
                    <View style={styles.completedIndicator}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  </View>
                  <View style={styles.completedInfo}>
                    <Text style={styles.completedMedication}>
                      {reminder.name}
                    </Text>
                    <Text style={styles.completedDetails}>
                      {reminder.strength} • Taken at {reminder.time}
                    </Text>
                  </View>
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>Completed</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </View>
      )}

      {/* Empty State */}
      {pendingReminders.length === 0 && (
        <View style={styles.emptyState}>
          <View style={styles.emptyStateIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
          </View>
          <Text style={styles.emptyStateTitle}>All caught up!</Text>
          <Text style={styles.emptyStateText}>
            {"You've taken all your medications for today."}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flex: 1, paddingHorizontal: 20 },
  section: { marginTop: 20 },
  lastSection: { marginBottom: 100 },
  row: { flexDirection: "row", gap: 12 },
  list: { gap: 16 },
  subtitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  // Summary Cards
  summaryCard: {
    flex: 1,
    padding: 18,
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },

  // Detailed Reminder Cards
  reminderCard: {
    padding: 20,
  },
  overdueCard: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFD4D4",
  },
  snoozedCard: {
    backgroundColor: "#FFFBF0",
    borderWidth: 1,
    borderColor: "#FFE8A0",
  },
  reminderHeader: {
    marginBottom: 16,
  },
  reminderInfo: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  pillIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  overdueIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E85D5B",
    alignItems: "center",
    justifyContent: "center",
  },
  snoozedIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F4A124",
    alignItems: "center",
    justifyContent: "center",
  },
  reminderDetails: {
    flex: 1,
    justifyContent: "center",
  },
  reminderMedication: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  reminderDose: {
    fontSize: 15,
    color: "#777",
    marginBottom: 4,
  },
  reminderInstructions: {
    fontSize: 13,
    color: "#999",
  },
  timeBadge: {
    backgroundColor: "#EBF5FB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  overdueBadge: {
    backgroundColor: "#FFE8E8",
  },
  snoozedBadge: {
    backgroundColor: "#FFF4D6",
  },
  timeBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5BA4D6",
  },
  overdueBadgeText: {
    color: "#E85D5B",
  },
  snoozedBadgeText: {
    color: "#F4A124",
  },
  reminderActions: {
    flexDirection: "row",
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C2C2C",
    letterSpacing: -0.2,
  },

  // Completed Cards
  completedCard: {
    padding: 16,
    backgroundColor: "#F0FFF4",
    borderWidth: 1,
    borderColor: "#C6F6D5",
  },
  completedReminderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  pillIconSmall: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  completedIndicator: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  completedInfo: {
    flex: 1,
  },
  completedMedication: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  completedDetails: {
    fontSize: 13,
    color: "#777",
  },
  completedBadge: {
    backgroundColor: "#D5F4E6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4CAF50",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyStateIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F0FFF4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptyStateText: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
  },
});
