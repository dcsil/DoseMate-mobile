import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import StatsCard from "@/components/main-navigation/StatsCard";
import NextReminderCard from "@/components/main-navigation/NextReminderCard";
import AdherenceProgressCard from "@/components/main-navigation/AdherenceProgressCard";
import MotivationalCard from "@/components/main-navigation/MotivationalCard";
import RecentActivityCard from "@/components/main-navigation/RecentActivityCard";
import ShareHealthcareCard from "@/components/main-navigation/ShareHealthcareCard";
import { registerTestUser, getProgressSummary, getStreak, getTodaysReminders } from "@/components/services/backend";
import * as SecureStore from "expo-secure-store";

interface HomeTabProps {
  onViewReminder: () => void;
  onViewDetails: () => void;
}

// OverviewChartCard removed per user request
export default function HomeTab({
  onViewReminder,
  onViewDetails,
}: HomeTabProps) {
  // local UI state — server data will replace these when available
  const [medications, setMedications] = useState<any>({ today: { taken: 0, total: 0 }, recent: [] });
  const [remindersState, setRemindersState] = useState<any>({ allReminders: [] });
  const [progress, setProgress] = useState<any | null>(null);
  const [motivation, setMotivation] = useState<any>({ title: "Keep it up!", message: "", badgeText: "", type: "neutral" });

  // Set a friendly motivational quote on mount
  useEffect(() => {
    const quotes = [
      "Small steps every day add up to big changes.",
      "You're doing great — consistency is the key.",
      "Progress, not perfection. One dose at a time.",
      "Celebrate the wins — even the tiny ones.",
      "Keep going — your future self will thank you.",
    ];
    const pick = quotes[Math.floor(Math.random() * quotes.length)];
    setMotivation((prev: any) => ({ ...prev, message: pick }));
  }, []);

  const fetchSummary = async () => {
    try {
      const token = (await SecureStore.getItemAsync("jwt")) || (await registerTestUser());
      const [summaryData, streakData, remindersData] = await Promise.all([
        getProgressSummary(token).catch(() => null),
        getStreak(token).catch(() => null),
        getTodaysReminders(token).catch(() => []),
      ]);

      if (remindersData) {
        setRemindersState({ allReminders: remindersData });
      }

      if (summaryData) {
        setProgress({
          today: { percentage: summaryData.daily?.percentage ?? 0, subtitle: "Target: 90%" },
          week: { percentage: summaryData.weekly?.percentage ?? 0, taken: summaryData.weekly?.taken ?? 0, total: summaryData.weekly?.total ?? 0, currentStreak: streakData?.current_streak ?? 0, subtitle: `${summaryData.weekly?.taken ?? 0} of ${summaryData.weekly?.total ?? 0} doses taken` },
          month: { percentage: summaryData.monthly?.percentage ?? 0, taken: summaryData.monthly?.taken ?? 0, total: summaryData.monthly?.total ?? 0, subtitle: `${summaryData.monthly?.taken ?? 0} of ${summaryData.monthly?.total ?? 0} doses taken` },
          weeklyData: summaryData.weekly?.daily ?? [],
        });
        // Update today's medication counts so the "Today's Meds" card shows accurate taken/total
        setMedications((prev: any) => ({
          ...prev,
          today: {
            taken: summaryData.daily?.taken ?? prev.today?.taken ?? 0,
            total: summaryData.daily?.total ?? prev.today?.total ?? 0,
          },
        }));
        // Color and badge for motivation based on today's adherence
        const pct = summaryData.daily?.percentage ?? (
          summaryData.daily?.total
            ? Math.round(((summaryData.daily?.taken ?? 0) / (summaryData.daily?.total ?? 1)) * 100)
            : 0
        );

        let type: "positive" | "neutral" | "negative" = "neutral";
        if (pct >= 80) type = "positive";
        else if (pct < 50) type = "negative";

        const badge = `${pct}% adherence`;
        setMotivation((prev: any) => ({ ...prev, badgeText: badge, type }));
      }
    } catch (e) {
      console.warn("Error fetching home summary", e);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleWeeklyReport = () => console.log("Weekly report pressed");
  const handleMonthlyReport = () => console.log("Monthly report pressed");
  const handleGenerateShare = () => console.log("Generate & share pressed");

  return (
    <ScrollView
      style={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <View style={styles.row}>
          <StatsCard
            icon="pill"
            iconLibrary="material"
            iconColor="#ffffff"
            iconBgColor="#E85D5B"
            label="Today's Meds"
            value={`${medications.today?.taken ?? 0} of ${medications.today?.total ?? 0}`}
            cardBgColor="#FFFFFF"
            borderColor="#F0F0F0"
          />

        </View>
      </View>

      <View style={styles.section}>
        <NextReminderCard
          name={remindersState.allReminders[0]?.name ?? ""}
          strength={remindersState.allReminders[0]?.strength ?? ""}
          time={remindersState.allReminders[0]?.time ?? ""}
          onViewPress={onViewReminder}
        />
      </View>

      <View style={styles.section}>
        <AdherenceProgressCard
          todayData={{
            label: "Today",
            percentage: progress?.today?.percentage ?? 0,
            subtitle: progress?.today?.subtitle ?? "",
          }}

        />
      </View>

      <View style={styles.section}>
        <MotivationalCard
          title={motivation.title}
          message={motivation.message}
          badgeText={motivation.badgeText}
          type={motivation.type}
        />
      </View>

      {/* Weekly overview removed per request */}

      <View style={styles.section}>
        {/* Use today's reminders as recent activity to match Progress tab */}
        <RecentActivityCard
          activities={
            (remindersState.allReminders || []).map((r: any) => ({
              id: String(r.id || `${r.name}-${r.time}`),
              name: r.name || r.title || "Medication",
              strength: r.strength || r.quantity || "",
              lastTaken: r.taken_time ?? null,
              time: r.time || r.scheduled_time || (r.overdue ? "Overdue" : "Pending"),
              status: r.status === "taken" ? "taken" : r.overdue ? "overdue" : "upcoming",
            }))
          }
        />
      </View>

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
  scrollContent: { flex: 1, paddingHorizontal: 20 },
  section: { marginTop: 20 },
  lastSection: { marginBottom: 100 },
  row: { flexDirection: "row", gap: 12 },
});
