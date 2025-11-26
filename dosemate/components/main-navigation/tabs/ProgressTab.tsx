import React, { useEffect, useState, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Card from "@/components/main-navigation/Card";
import {
  registerTestUser,
  getTodaysReminders,
} from "@/components/services/backend";

export default function ProgressTab() {
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [reminders, setReminders] = useState<any[]>([]);

  // derive simple progress metrics from reminders
  const progress = useMemo(() => {
    const total = reminders.length;
    const taken = reminders.filter((r) => r.status === "taken").length;
    const percentage = total ? Math.round((taken / total) * 100) : 0;
    const currentStreak = 0; // placeholder: compute properly later

    return {
      today: { percentage, target: 90, subtitle: "Target: 90%" },
      week: {
        percentage,
        taken,
        total,
        currentStreak,
        subtitle: `${taken} of ${total} doses taken`,
      },
      month: {
        percentage,
        taken,
        total,
        subtitle: `${taken} of ${total} doses taken`,
      },
      weeklyData: [],
    };
  }, [reminders]);

  // Detailed analytics removed — handler intentionally omitted

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        // Register a test user to obtain a JWT, then fetch today's reminders
        const token = await registerTestUser();
        const data = await getTodaysReminders(token);
        if (!mounted) return;
        setReminders(data || []);
      } catch (err: any) {
        console.warn("Failed to load reminders", err);
        if (mounted) setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.progressCard}>
            <View style={styles.progressIconContainer}>
              <Ionicons name="trending-up" size={32} color="#E85D5B" />
            </View>
            <Text style={styles.progressNumber}>
              {progress.week.percentage}%
            </Text>
            <Text style={styles.progressLabel}>Today&apos;s Adherence</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress.week.percentage}%` },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Card style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons name="pill" size={28} color="#E85D5B" />
              </View>
              <Text style={styles.statNumber}>
                {progress.week.taken}/{progress.week.total}
              </Text>
              <Text style={styles.statLabel}>Doses taken today</Text>
            </Card>
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.subtitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {loading && <Text>Loading recent activity...</Text>}
            {error && <Text style={{ color: "red" }}>{error}</Text>}
            {!loading && !error && reminders.length === 0 && (
              <Text>No reminders for today.</Text>
            )}

            {!loading &&
              !error &&
              reminders.map((r) => (
                <View key={String(r.id)} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <MaterialCommunityIcons
                      name={r.status === "taken" ? "check" : "clock-outline"}
                      size={16}
                      color={r.status === "taken" ? "#4CAF50" : "#FFA500"}
                    />
                  </View>
                  <View style={styles.listItemText}>
                    <Text style={styles.activityText}>
                      {r.name || r.title || "Medication"}
                    </Text>
                    <Text style={styles.listItemSubtitle}>
                      {r.time ||
                        r.scheduled_time ||
                        (r.overdue ? "Overdue" : "Pending")}
                    </Text>
                  </View>
                </View>
              ))}
          </View>

          {/* Detailed analytics removed per request */}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flex: 1, paddingHorizontal: 20 },
  section: { marginTop: 20 },
  lastSection: { marginBottom: 100 },
  row: { flexDirection: "row", gap: 12 },
  subtitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  // Progress Card
  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  progressIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF5F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  progressNumber: {
    fontSize: 56,
    fontWeight: "700",
    color: "#E85D5B",
    marginBottom: 8,
    letterSpacing: -1,
  },
  progressLabel: {
    fontSize: 16,
    color: "#888",
    marginBottom: 20,
    fontWeight: "500",
  },
  progressBar: {
    width: "100%",
    height: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#E85D5B",
    borderRadius: 5,
  },

  // Stat Cards
  statCard: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconContainer: {
    marginBottom: 12,
    opacity: 0.9,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: -0.5,
    color: "#2C2C2C",
  },
  statLabel: {
    fontSize: 13,
    color: "#888",
    fontWeight: "500",
  },

  // Activity Items
  activityList: { gap: 12, marginBottom: 20 },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0FFF4",
    alignItems: "center",
    justifyContent: "center",
  },
  listItemText: { flex: 1 },
  activityText: {
    fontSize: 15,
    color: "#2C2C2C",
    marginBottom: 2,
    fontWeight: "500",
  },
  listItemSubtitle: {
    fontSize: 13,
    color: "#999",
  },

  // Button
  fullWidthButton: {
    backgroundColor: "#E85D5B",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#E85D5B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  fullWidthButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
});
