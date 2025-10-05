import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

// Import card components
import TodaysMedsCard from "@/components/dashboard/TodaysMedsCard";
import WeekStatsCard from "@/components/dashboard/WeekStatsCard";
import NextReminderCard from "@/components/dashboard/NextReminderCard";
import AdherenceProgressCard from "@/components/dashboard/AdherenceProgressCard";
import MotivationalCard from "@/components/dashboard/MotivationalCard";
import WeeklyOverviewCard from "@/components/dashboard/WeeklyOverviewCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import ShareHealthcareCard from "@/components/dashboard/ShareHealthcareCard";
import BottomNavigation from "@/components/dashboard/Navbar";

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");

  // ============ DYNAMIC DATA - Replace with backend data ============
  const todaysMedsData = {
    taken: 3,
    total: 4,
  };

  const weekStatsData = {
    percentage: 92,
  };

  const nextReminderData = {
    medicationName: "Metformin",
    time: "2:00 PM",
  };

  const adherenceData = {
    todayData: {
      label: "Today",
      percentage: 92,
      subtitle: "Target: 90%",
    },
    weekData: {
      label: "This Week",
      percentage: 88,
      subtitle: "19 of 21 doses taken",
    },
    monthData: {
      label: "This Month",
      percentage: 85,
      subtitle: "85 of 90 doses taken",
    },
  };

  const motivationalData = {
    title: "Great job this week!",
    message: "You've maintained a 88% adherence rate. Keep up the excellent work!",
    badgeText: "Above Target",
  };

  const weeklyData = [
    { day: "Mon", score: 100 },
    { day: "Tue", score: 100 },
    { day: "Wed", score: 67 },
    { day: "Thu", score: 100 },
    { day: "Fri", score: 42 },
    { day: "Sat", score: 100 },
    { day: "Sun", score: 100 },
  ];

  const recentActivities = [
    {
      medicationName: "Metformin 500mg",
      time: "Today at 8:00 AM",
      status: "taken" as const,
    },
    {
      medicationName: "Lisinopril 10mg",
      time: "Today at 8:00 AM",
      status: "taken" as const,
    },
    {
      medicationName: "Atorvastatin 20mg",
      time: "Due at 9:00 PM",
      status: "upcoming" as const,
    },
  ];

  // ============ EVENT HANDLERS ============
  const handleViewReminder = () => {
    console.log("View reminder pressed");
    // Navigate to reminders screen
  };

  const handleViewDetails = () => {
    console.log("View detailed analytics pressed");
    // Navigate to analytics screen
  };

  const handleWeeklyReport = () => {
    console.log("Weekly report pressed");
    // Generate weekly report
  };

  const handleMonthlyReport = () => {
    console.log("Monthly report pressed");
    // Generate monthly report
  };

  const handleGenerateShare = () => {
    console.log("Generate & share pressed");
    // Generate and share report
  };

  // ============ RENDER FUNCTIONS ============
  const renderHomeTab = () => (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Quick Stats */}
      <View style={styles.section}>
        <View style={styles.statsGrid}>
          <TodaysMedsCard taken={todaysMedsData.taken} total={todaysMedsData.total} />
          <WeekStatsCard percentage={weekStatsData.percentage} />
        </View>
      </View>

      {/* Next Reminder */}
      <View style={styles.section}>
        <NextReminderCard
          medicationName={nextReminderData.medicationName}
          time={nextReminderData.time}
          onViewPress={handleViewReminder}
        />
      </View>

      {/* Adherence Progress */}
      <View style={styles.section}>
        <AdherenceProgressCard
          todayData={adherenceData.todayData}
          weekData={adherenceData.weekData}
          monthData={adherenceData.monthData}
        />
      </View>

      {/* Motivational Message */}
      <View style={styles.section}>
        <MotivationalCard
          title={motivationalData.title}
          message={motivationalData.message}
          badgeText={motivationalData.badgeText}
        />
      </View>

      {/* Weekly Chart Preview */}
      <View style={styles.section}>
        <WeeklyOverviewCard weekData={weeklyData} onViewDetails={handleViewDetails} />
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <RecentActivityCard activities={recentActivities} />
      </View>

      {/* Share Section */}
      <View style={[styles.section, { marginBottom: 24 }]}>
        <ShareHealthcareCard
          onWeeklyReport={handleWeeklyReport}
          onMonthlyReport={handleMonthlyReport}
          onGenerateShare={handleGenerateShare}
        />
      </View>
    </ScrollView>
  );

  const renderPlaceholder = (title: string) => (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>{title} - Coming Soon</Text>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return renderHomeTab();
      case "medications":
        return renderPlaceholder("Medications");
      case "reminders":
        return renderPlaceholder("Reminders");
      case "progress":
        return renderPlaceholder("Progress");
      case "profile":
        return renderPlaceholder("Profile");
      default:
        return renderHomeTab();
    }
  };

  const getHeaderTitle = () => {
    const titles: { [key: string]: string } = {
      home: "Good morning!",
      medications: "Medications",
      reminders: "Reminders",
      progress: "Progress",
      profile: "Profile",
    };
    return titles[activeTab] || "Home";
  };

  const getHeaderSubtitle = () => {
    const subtitles: { [key: string]: string } = {
      home: "Ready to stay on track today?",
      medications: "Manage your medications",
      reminders: "Stay on top of your schedule",
      progress: "Track your adherence",
      profile: "Your account settings",
    };
    return subtitles[activeTab] || "";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
          <Text style={styles.headerSubtitle}>{getHeaderSubtitle()}</Text>
        </View>
      </View>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 24,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 18,
    color: "#888",
  },
});