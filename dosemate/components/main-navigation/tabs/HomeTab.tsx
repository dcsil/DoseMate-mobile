import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import StatsCard from "@/components/main-navigation/StatsCard";
import NextReminderCard from "@/components/main-navigation/NextReminderCard";
import AdherenceProgressCard from "@/components/main-navigation/AdherenceProgressCard";
import MotivationalCard from "@/components/main-navigation/MotivationalCard";
import WeeklyOverviewCard from "@/components/main-navigation/WeeklyOverviewCard";
import RecentActivityCard from "@/components/main-navigation/RecentActivityCard";
import ShareHealthcareCard from "@/components/main-navigation/ShareHealthcareCard";

interface HomeTabProps {
  onViewReminder: () => void;
  onViewDetails: () => void;
}

export default function HomeTab({
  onViewReminder,
  onViewDetails,
}: HomeTabProps) {
  
  // ============ STATIC DATA FOR HOME TAB - Organized for Backend Integration ============
  const homeData = {
    medications: {
      today: {
        taken: 3,
        total: 4,
      },
      recent: [
        { 
          id: "med1",
          name: "Amlodipine", 
          strength: "5mg",
          lastTaken: "Today at 12:00 PM", 
          time: "12:00 PM",
          status: "taken" as const 
        },
        { 
          id: "med2",
          name: "Levothyroxine", 
          strength: "50mcg",
          lastTaken: "Today at 8:00 AM", 
          time: "8:00 AM",
          status: "taken" as const 
        },
        { 
          id: "med3",
          name: "Hydrochlorothiazide", 
          strength: "25mg",
          lastTaken: "Today at 8:00 AM", 
          time: "8:00 AM",
          status: "taken" as const 
        },
      ],
    },

    reminders: {
      allReminders: [
        {
          id: 1,
          name: 'Metformin',
          strength: '500mg',
          quantity: '1 tablet',
          time: '2:00 PM',
          status: 'pending' as const,
          color: '#2196F3',
          overdue: false,
          instructions: 'Take with food'
        },
        {
          id: 2,
          name: 'Atorvastatin',
          strength: '20mg',
          quantity: '1 tablet',
          time: '9:00 PM',
          status: 'pending' as const,
          color: '#9C27B0',
          overdue: false,
          instructions: 'Take in the evening'
        },
        {
          id: 3,
          name: 'Lisinopril',
          strength: '10mg',
          quantity: '1 tablet',
          time: '8:00 AM',
          status: 'taken' as const,
          color: '#4CAF50',
          overdue: false,
          instructions: 'No food restrictions'
        },
        {
          id: 4,
          name: 'Aspirin',
          strength: '81mg',
          quantity: '1 tablet',
          time: '8:00 AM',
          status: 'overdue' as const,
          color: '#FF9800',
          overdue: true,
          instructions: 'Take with food'
        }
      ],
    },

    progress: {
      today: { 
        percentage: 92, 
        target: 90,
        subtitle: "Target: 90%" 
      },
      week: { 
        percentage: 88, 
        taken: 19,
        total: 21,
        currentStreak: 5,
        subtitle: `19 of 21 doses taken`
      },
      month: { 
        percentage: 85, 
        taken: 85,
        total: 90,
        subtitle: "85 of 90 doses taken" 
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

    motivation: {
      title: "Great job this week!",
      message: "You've maintained a 88% adherence rate. Keep up the excellent work!",
      badgeText: "Above Target",
      type: "positive" as const,
    },
  };

  const { medications, reminders, progress, motivation } = homeData;

  const handleWeeklyReport = () => console.log("Weekly report pressed");
  const handleMonthlyReport = () => console.log("Monthly report pressed");
  const handleGenerateShare = () => console.log("Generate & share pressed");


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