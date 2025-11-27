import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Text,
  RefreshControl,
  Alert,
} from "react-native";
import StatsCard from "@/components/main-navigation/StatsCard";
import NextReminderCard from "@/components/main-navigation/NextReminderCard";
import AdherenceProgressCard from "@/components/main-navigation/AdherenceProgressCard";
import MotivationalCard from "@/components/main-navigation/MotivationalCard";
import RecentActivityCard from "@/components/main-navigation/RecentActivityCard";
import ShareHealthcareCard from "@/components/main-navigation/ShareHealthcareCard";
import * as SecureStore from "expo-secure-store";
import { BACKEND_BASE_URL } from "@/config";

interface HomeTabProps {
  onViewReminder: () => void;
  onViewDetails: () => void;
}

type ReminderStatus = "pending" | "taken" | "missed";

type Reminder = {
  id: string;
  name: string;
  strength: string;
  quantity: string;
  time: string;
  status: ReminderStatus;
  overdue: boolean;
  instructions: string;
};

type DayData = {
  date: string;
  day: string;
  taken: number;
  total: number;
  percentage: number;
  is_today: boolean;
};

type WeeklyAdherence = {
  days: DayData[];
  summary: {
    taken: number;
    total: number;
    percentage: number;
    perfect_days: number;
    current_streak: number;
  };
};

type MonthlyAdherence = {
  summary: {
    taken: number;
    missed: number;
    total: number;
    percentage: number;
  };
};

type TodayAdherence = {
  taken: number;
  missed: number;
  pending: number;
  total: number;
  percentage: number;
};

type RecentActivity = {
  id: string;
  medication_name: string;
  strength: string;
  taken_at: string;
  display_time: string;
  status: string;
};

export default function HomeTab({
  onViewReminder,
  onViewDetails,
}: HomeTabProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [todayAdherence, setTodayAdherence] = useState<TodayAdherence | null>(null);
  const [weeklyAdherence, setWeeklyAdherence] = useState<WeeklyAdherence | null>(null);
  const [monthlyAdherence, setMonthlyAdherence] = useState<MonthlyAdherence | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setError(null);

      const token = await SecureStore.getItemAsync("jwt");
      if (!token) {
        setError("Not logged in");
        setIsLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Load all data in parallel
      const [remindersRes, todayRes, weekRes, monthRes, activityRes] = await Promise.all([
        fetch(`${BACKEND_BASE_URL}/reminders/today`, { headers }),
        fetch(`${BACKEND_BASE_URL}/reminders/adherence/today`, { headers }),
        fetch(`${BACKEND_BASE_URL}/reminders/adherence/week`, { headers }),
        fetch(`${BACKEND_BASE_URL}/reminders/adherence/month`, { headers }),
        fetch(`${BACKEND_BASE_URL}/reminders/recent-activity?limit=5`, { headers }),
      ]);

      if (remindersRes.ok) {
        const data = await remindersRes.json();
        setReminders(data);
      }

      if (todayRes.ok) {
        const data = await todayRes.json();
        setTodayAdherence(data);
      }

      if (weekRes.ok) {
        const data = await weekRes.json();
        setWeeklyAdherence(data);
      }

      if (monthRes.ok) {
        const data = await monthRes.json();
        setMonthlyAdherence(data);
      }

      if (activityRes.ok) {
        const data = await activityRes.json();
        setRecentActivity(data);
      }

    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  // Get motivational message based on adherence and streak
  const getMotivation = () => {
    if (!todayAdherence || !weeklyAdherence) {
      return {
        title: "Welcome to DoseMate!",
        message: "Start tracking your medications today",
        badgeText: "Getting Started",
        type: "positive" as const,
      };
    }

    const streak = weeklyAdherence.summary.current_streak;
    const todayPct = todayAdherence.percentage;
    const weekPct = weeklyAdherence.summary.percentage;

    // Amazing streak!
    if (streak >= 7) {
      return {
        title: "🔥 Incredible Streak!",
        message: `${streak} days of perfect adherence! You're a medication champion!`,
        badgeText: `${streak} Day Streak`,
        type: "positive" as const,
      };
    }

    // Good streak
    if (streak >= 3) {
      return {
        title: "🌟 Great Streak!",
        message: `${streak} days in a row at 100%! Keep the momentum going!`,
        badgeText: `${streak} Day Streak`,
        type: "positive" as const,
      };
    }

    // Excellent today
    if (todayPct === 100 && todayAdherence.total > 0) {
      return {
        title: "Perfect Day!",
        message: `You've taken all ${todayAdherence.taken} medications today. Excellent work!`,
        badgeText: "100% Today",
        type: "positive" as const,
      };
    }

    // Great this week
    if (weekPct >= 90) {
      return {
        title: "Excellent Week!",
        message: `${weekPct}% adherence this week. You're doing amazing!`,
        badgeText: "Above Target",
        type: "positive" as const,
      };
    }

    // Good this week
    if (weekPct >= 70) {
      return {
        title: "Good Progress!",
        message: `${weekPct}% adherence this week. You're on the right track!`,
        badgeText: "On Track",
        type: "positive" as const,
      };
    }

    // Needs attention
    return {
      title: "Let's Get Back on Track",
      message: `${todayAdherence.pending} medications still pending today. You've got this!`,
      badgeText: "Needs Attention",
      type: "negative" as const,
    };
  };

  const handleWeeklyReport = async () => {
    try {
      const token = await SecureStore.getItemAsync("jwt");
      if (!token) {
        Alert.alert("Error", "You're not logged in");
        return;
      }

      Alert.alert(
        "Generating Report",
        "Your weekly report is being prepared...",
        [{ text: "OK" }]
      );

      const url = `${BACKEND_BASE_URL}/reminders/reports/weekly`;
      
      // On mobile, open PDF in browser
      const fullUrl = `${url}?token=${token}`;
      
      // Use Linking to open in browser (works on iOS/Android)
      const { Linking } = require('react-native');
      await Linking.openURL(fullUrl);
      
      console.log("Weekly report opened");
    } catch (err) {
      console.error("Error generating weekly report:", err);
      Alert.alert("Error", "Failed to generate report");
    }
  };

  const handleMonthlyReport = async () => {
    try {
      const token = await SecureStore.getItemAsync("jwt");
      if (!token) {
        Alert.alert("Error", "You're not logged in");
        return;
      }

      Alert.alert(
        "Generating Report",
        "Your monthly report is being prepared...",
        [{ text: "OK" }]
      );

      const url = `${BACKEND_BASE_URL}/reminders/reports/monthly`;
      
      // On mobile, open PDF in browser
      const fullUrl = `${url}?token=${token}`;
      
      // Use Linking to open in browser (works on iOS/Android)
      const { Linking } = require('react-native');
      await Linking.openURL(fullUrl);
      
      console.log("Monthly report opened");
    } catch (err) {
      console.error("Error generating monthly report:", err);
      Alert.alert("Error", "Failed to generate report");
    }
  };

  const handleGenerateShare = async () => {
    Alert.alert(
      "Share Report",
      "Which report would you like to share?",
      [
        {
          text: "Weekly Report",
          onPress: handleWeeklyReport
        },
        {
          text: "Monthly Report",
          onPress: handleMonthlyReport
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.scrollContent, styles.centerContent]}>
        <ActivityIndicator size="large" color="#E85D5B" />
        <Text style={styles.loadingText}>Loading your health data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.scrollContent, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>Pull down to retry</Text>
      </View>
    );
  }

  if (!todayAdherence || todayAdherence.total === 0) {
    return (
      <ScrollView
        style={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No medications scheduled for today</Text>
          <Text style={styles.emptySubtext}>
            Add medications to start tracking your adherence
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Get next pending reminder
  const nextReminder = reminders.find((r) => r.status === "pending" && !r.overdue);

  // Format recent activity for display
  const formattedActivity = recentActivity.map((activity) => ({
    id: activity.id,
    name: activity.medication_name,
    strength: activity.strength,
    lastTaken: activity.display_time,
    time: activity.display_time,
    status: "taken" as const,
  }));

  // Format weekly chart data
  const chartData = weeklyAdherence?.days.map((day) => ({
    day: day.day,
    score: day.percentage,
  })) || [];

  const motivation = getMotivation();

  return (
    <ScrollView
      style={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Today's Stats */}
      <View style={styles.section}>
        <View style={styles.row}>
          <StatsCard
            icon="pill"
            iconLibrary="material"
            iconColor="#ffffff"
            iconBgColor="#E85D5B"
            label="Today's Meds"
            value={`${todayAdherence.taken} of ${todayAdherence.total}`}
            cardBgColor="#FFFFFF"
            borderColor="#F0F0F0"
          />
          <StatsCard
            icon="bar-chart"
            iconColor="#ffffff"
            iconBgColor="#E85D5B"
            label="Today"
            value={`${todayAdherence.percentage}%`}
            cardBgColor="#FFFFFF"
            borderColor="#F0F0F0"
          />
        </View>
      </View>

      {/* Streak Badge (if exists) */}
      {weeklyAdherence && weeklyAdherence.summary.current_streak > 0 && (
        <View style={styles.section}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View style={styles.streakTextContainer}>
              <Text style={styles.streakNumber}>
                {weeklyAdherence.summary.current_streak} Day Streak
              </Text>
              <Text style={styles.streakSubtext}>
                {weeklyAdherence.summary.current_streak === 1
                  ? "Keep it going!"
                  : "You're on fire!"}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Next Reminder */}
      {nextReminder && (
        <View style={styles.section}>
          <NextReminderCard
            name={nextReminder.name}
            strength={nextReminder.strength}
            time={nextReminder.time}
            onViewPress={onViewReminder}
          />
        </View>
      )}

      {/* Adherence Progress */}
      {weeklyAdherence && monthlyAdherence && (
        <View style={styles.section}>
          <AdherenceProgressCard
            todayData={{
              label: "Today",
              percentage: todayAdherence.percentage,
              subtitle: `${todayAdherence.taken} of ${todayAdherence.total} doses taken`,
            }}
            weekData={{
              label: "This Week",
              percentage: weeklyAdherence.summary.percentage,
              subtitle: `${weeklyAdherence.summary.taken} of ${weeklyAdherence.summary.total} doses taken`,
            }}
            monthData={{
              label: "This Month",
              percentage: monthlyAdherence.summary.percentage,
              subtitle: `${monthlyAdherence.summary.taken} of ${monthlyAdherence.summary.total} doses taken`,
            }}
          />
        </View>
      )}

      {/* Motivational Card */}
      <View style={styles.section}>
        <MotivationalCard
          title={motivation.title}
          message={motivation.message}
          badgeText={motivation.badgeText}
          type={motivation.type}
        />
      </View>

      {/* Weekly Chart */}
      {chartData.length > 0 && (
        <View style={styles.section}>
          <OverviewChartCard
            data={chartData}
            timeRange="week"
            onViewDetails={onViewDetails}
          />
        </View>
      )}

      {/* Recent Activity */}
      {formattedActivity.length > 0 && (
        <View style={styles.section}>
          <RecentActivityCard activities={formattedActivity} />
        </View>
      )}

      {/* Share Healthcare Card */}
      <View style={[styles.section, styles.lastSection]}>
        <ShareHealthcareCard
          onWeeklyReport={handleWeeklyReport}
          onMonthlyReport={handleMonthlyReport}
          onGenerateShare={handleGenerateShare}
        />
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
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  section: { marginTop: 20 },
  lastSection: { marginBottom: 100 },
  row: { flexDirection: "row", gap: 12 },

  // Loading & Error
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 15,
  },
  errorText: {
    color: "#E85D5B",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },

  // Streak Badge
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5ED",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#FFD4A8",
    shadowColor: "#FF9500",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  streakEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  streakTextContainer: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF9500",
    marginBottom: 2,
  },
  streakSubtext: {
    fontSize: 13,
    color: "#FF9500",
    fontWeight: "500",
  },
});