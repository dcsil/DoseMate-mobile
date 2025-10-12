import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import StatsCard from "@/components/main-navigation/StatsCard";
import NextReminderCard from "@/components/main-navigation/NextReminderCard";
import AdherenceProgressCard from "@/components/main-navigation/AdherenceProgressCard";
import MotivationalCard from "@/components/main-navigation/MotivationalCard";
import WeeklyOverviewCard from "@/components/main-navigation/WeeklyOverviewCard";
import RecentActivityCard from "@/components/main-navigation/RecentActivityCard";
import ShareHealthcareCard from "@/components/main-navigation/ShareHealthcareCard";
import { MedicationData, ReminderData, ProgressData, MotivationData } from "./types";

interface HomeTabProps {
  medications: MedicationData;
  reminders: ReminderData;
  progress: ProgressData;
  motivation: MotivationData;
  onViewReminder: () => void;
  onViewDetails: () => void;
  onWeeklyReport: () => void;
  onMonthlyReport: () => void;
  onGenerateShare: () => void;
}

export default function HomeTab({
  medications,
  reminders,
  progress,
  motivation,
  onViewReminder,
  onViewDetails,
  onWeeklyReport,
  onMonthlyReport,
  onGenerateShare,
}: HomeTabProps) {
  return (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.row}>
          <StatsCard
            icon="pill"
            iconLibrary="material"
            iconColor="#ffffff"
            iconBgColor="#E85D5B"
            label="Today's Meds"
            value={`${medications.today.taken} of ${medications.today.total}`}
            cardBgColor="#FFFFFF"
            borderColor="#F0F0F0"
          />
          <StatsCard
            icon="bar-chart"
            iconColor="#ffffff"
            iconBgColor="#E85D5B"
            label="This Week"
            value={`${progress.week.percentage}%`}
            cardBgColor="#FFFFFF"
            borderColor="#F0F0F0"
          />
        </View>
      </View>

      <View style={styles.section}>
        {/* <NextReminderCard
          name={reminders.upcoming[0]?.name ?? ""}
          strength={reminders.upcoming[0]?.strength ?? ""}
          time={reminders.upcoming[0]?.time ?? ""}
          onViewPress={onViewReminder}
        /> */}
        <NextReminderCard
          name={reminders.allReminders[0]?.name ?? ""}
          strength={reminders.allReminders[0]?.strength ?? ""}
          time={reminders.allReminders[0]?.time ?? ""}
          onViewPress={onViewReminder}
        />
      </View>

      <View style={styles.section}>
        <AdherenceProgressCard
          todayData={{
            label: "Today",
            percentage: progress.today.percentage,
            subtitle: progress.today.subtitle,
          }}
          weekData={{
            label: "This Week",
            percentage: progress.week.percentage,
            subtitle: progress.week.subtitle,
          }}
          monthData={{
            label: "This Month",
            percentage: progress.month.percentage,
            subtitle: progress.month.subtitle,
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

      <View style={styles.section}>
        <WeeklyOverviewCard 
          weekData={progress.weeklyData} 
          onViewDetails={onViewDetails} 
        />
      </View>

      <View style={styles.section}>
        <RecentActivityCard activities={medications.recent} />
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <ShareHealthcareCard
          onWeeklyReport={onWeeklyReport}
          onMonthlyReport={onMonthlyReport}
          onGenerateShare={onGenerateShare}
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