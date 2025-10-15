import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Card from "@/components/main-navigation/Card";
import DetailedProgressScreen from "@/components/main-navigation/DetailedProgressScreen";

export default function ProgressTab() {
  // ============ STATIC DATA FOR PROGRESS TAB - Organized for Backend Integration ============
  const progressData = {
    progress: {
      today: {
        percentage: 92,
        target: 90,
        subtitle: "Target: 90%",
      },
      week: {
        percentage: 88,
        taken: 19,
        total: 21,
        currentStreak: 5,
        subtitle: `19 of 21 doses taken`,
      },
      month: {
        percentage: 85,
        taken: 85,
        total: 90,
        subtitle: "85 of 90 doses taken",
      },
      weeklyData: [
        { day: "Mon", score: 100 },
        { day: "Tue", score: 100 },
        { day: "Wed", score: 67 },
        { day: "Thu", score: 100 },
        { day: "Fri", score: 42 },
        { day: "Sat", score: 100 },
        { day: "Sun", score: 100 },
      ],
    },
    recentActivity: [
      {
        id: "med1",
        name: "Amlodipine",
        strength: "5mg",
        lastTaken: "Today at 12:00 PM",
        time: "12:00 PM",
        status: "taken" as const,
      },
      {
        id: "med2",
        name: "Levothyroxine",
        strength: "50mcg",
        lastTaken: "Today at 8:00 AM",
        time: "8:00 AM",
        status: "taken" as const,
      },
      {
        id: "med3",
        name: "Hydrochlorothiazide",
        strength: "25mg",
        lastTaken: "Today at 8:00 AM",
        time: "8:00 AM",
        status: "taken" as const,
      },
    ],
  };

  const { progress, recentActivity } = progressData;

  const [showDetailedProgress, setShowDetailedProgress] = useState(false);

  const handleViewDetailedProgress = () => {
    setShowDetailedProgress(true);
  };

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
            <Text style={styles.progressLabel}>Weekly Adherence</Text>
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
                <Ionicons name="flame" size={28} color="#E85D5B" />
              </View>
              <Text style={styles.statNumber}>
                {progress.week.currentStreak}
              </Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </Card>

            <Card style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons name="pill" size={28} color="#E85D5B" />
              </View>
              <Text style={styles.statNumber}>
                {progress.week.taken}/{progress.week.total}
              </Text>
              <Text style={styles.statLabel}>This Week</Text>
            </Card>
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.subtitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {recentActivity.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <MaterialCommunityIcons
                    name="check"
                    size={16}
                    color="#4CAF50"
                  />
                </View>
                <View style={styles.listItemText}>
                  <Text style={styles.activityText}>
                    Took {activity.name} {activity.strength}
                  </Text>
                  <Text style={styles.listItemSubtitle}>
                    {activity.lastTaken}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.fullWidthButton}
            onPress={handleViewDetailedProgress}
          >
            <Text style={styles.fullWidthButtonText}>
              View Detailed Progress
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DetailedProgressScreen
        visible={showDetailedProgress}
        onClose={() => setShowDetailedProgress(false)}
      />
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
