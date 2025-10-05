import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
import Card from "@/components/dashboard/Card";

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


    const nextReminderData = [
    {
      medicationName: "Metformin",
      time: "2:00 PM",
      isUrgent: true,
    },
    {
      medicationName: "Lisinopril",
      time: "8:00 PM",
      isUrgent: false,
    },
    {
      medicationName: "Atorvastatin",
      time: "9:00 PM",
      isUrgent: false,
    },
  ];

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
      time: "Today at 12:00 PM",
      status: "taken" as const,
    },
    {
      medicationName: "Lisinopril 10mg",
      time: "Today at 8:00 AM",
      status: "taken" as const,
    },
    {
      medicationName: "Atorvastatin 20mg",
      time: "Today at 8:00 AM",
      status: "taken" as const,
    },
  ];

  const remindersSummary = {
    // pending: apiResponse.pendingCount,
    // completed: apiResponse.completedCount,
    // overdue: apiResponse.overdueCount,
    pending: 2,
    completed: 3,
    overdue: 1,
  };

  const progressData = {
    weeklyAdherence: 88,
    dayStreak: 5,
    weeklyDoses: { taken: 19, total: 21 },
  };


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

  const handleViewAllMedications = () => {
    console.log("View all medications pressed");
    // Navigate to medication list
  };

  const handleAddMedication = () => {
    console.log("Add medication pressed");
    // Navigate to add medication screen
  };

    const handleMedicationPress = (medicationName: string) => {
    console.log("Medication pressed:", medicationName);
    // Navigate to medication detail
  };

  const handleMarkTaken = (medication: string) => {
    console.log("Mark taken:", medication);
  };

  const handleViewAllReminders = () => {
    console.log("View all reminders pressed");
  };

  const handleViewDetailedProgress = () => {
    console.log("View detailed progress pressed");
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
          medicationName={nextReminderData[0]?.medicationName ?? ""}
          time={nextReminderData[0]?.time ?? ""}
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



const renderMedicationsTab = () => (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[styles.quickActionButton, styles.blueAction]}
            onPress={handleViewAllMedications}
          >
            <Ionicons name="medical" size={32} color="#3498DB" />
            <Text style={styles.quickActionText}>View All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, styles.greenAction]}
            onPress={handleAddMedication}
          >
            <Ionicons name="add-circle" size={32} color="#27AE60" />
            <Text style={styles.quickActionText}>Add New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Medications */}
      <View style={[styles.section, { marginBottom: 24 }]}>
        <Text style={styles.subsectionTitle}>Recent Medications</Text>
        <View style={styles.medicationList}>
          {recentActivities.map((med, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleMedicationPress(med.medicationName)}
            >
              <Card style={styles.medicationCard}>
                <View style={styles.medicationContent}>
                  <View style={styles.medicationIcon}>
                    <Ionicons name="medical" size={20} color="#fff" />
                  </View>
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationName}>{med.medicationName}</Text>
                    <Text style={styles.medicationStatus}>Taken today</Text>
                  </View>
                  <Ionicons name="time-outline" size={16} color="#888" />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );


const renderRemindersTab = () => (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>

      {/* Pending Reminders Summary */}
      <View style={styles.section}>
        <View style={styles.reminderSummaryGrid}>
          <Card style={[styles.summaryCard, styles.blueSummary]}>
            <View style={styles.summaryCardContent}>
              <Text style={[styles.summaryNumber, { color: "#3498DB" }]}>
                {remindersSummary.pending}
              </Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
          </Card>

          <Card style={[styles.summaryCard, styles.greenSummary]}>
            <View style={styles.summaryCardContent}>
              <Text style={[styles.summaryNumber, { color: "#27AE60" }]}>
                {remindersSummary.completed}
              </Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
          </Card>

          <Card style={[styles.summaryCard, styles.redSummary]}>
            <View style={styles.summaryCardContent}>
              <Text style={[styles.summaryNumber, { color: "#E74C3C" }]}>
                {remindersSummary.overdue}
              </Text>
              <Text style={styles.summaryLabel}>Overdue</Text>
            </View>
          </Card>
        </View>
      </View>

      {/* Next Reminders */}
      <View style={[styles.section, { marginBottom: 24 }]}>
        <Text style={styles.subsectionTitle}>Next Reminders</Text>
        <View style={styles.remindersList}>
          {nextReminderData.map((reminder, index) => (
            <Card
              key={index}
              style={[
                styles.reminderCard,
                reminder.isUrgent && styles.urgentReminderCard,
              ]}
            >
              <View style={styles.reminderContent}>
                <View style={styles.reminderLeft}>
                  <Ionicons
                    name="notifications"
                    size={24}
                    color={reminder.isUrgent ? "#F39C12" : "#888"}
                  />
                  <View style={styles.reminderInfo}>
                    <Text style={styles.reminderMedication}>
                      {reminder.medicationName}
                    </Text>
                    <Text style={styles.reminderTime}>{reminder.time}</Text>
                  </View>
                </View>
                {reminder.isUrgent && (
                  <TouchableOpacity
                    style={styles.markTakenButton}
                    onPress={() => handleMarkTaken(reminder.medicationName ?? "")}
                  >
                    <Text style={styles.markTakenText}>Mark Taken</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))}
        </View>

        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={handleViewAllReminders}
        >
          <Text style={styles.viewAllButtonText}>View All Reminders</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );


  const renderProgressTab = () => (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>

      {/* Weekly Overview Card */}
      <View style={styles.section}>
        <View style={styles.progressCard}>
          <Text style={styles.progressNumber}>{progressData.weeklyAdherence}%</Text>
          <Text style={styles.progressLabel}>Weekly Adherence</Text>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${progressData.weeklyAdherence}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <View style={styles.progressStatsGrid}>
          <Card style={styles.progressStatCard}>
            <Text style={[styles.progressStatNumber, { color: "#27AE60" }]}>
              {progressData.dayStreak}
            </Text>
            <Text style={styles.progressStatLabel}>Day Streak</Text>
          </Card>

          <Card style={styles.progressStatCard}>
            <Text style={[styles.progressStatNumber, { color: "#3498DB" }]}>
              {progressData.weeklyDoses.taken}/{progressData.weeklyDoses.total}
            </Text>
            <Text style={styles.progressStatLabel}>This Week</Text>
          </Card>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={[styles.section, { marginBottom: 24 }]}>
        <Text style={styles.subsectionTitle}>Recent Activity</Text>
        <View style={styles.progressActivityList}>
          {recentActivities.map((activity, index) => (
            <View key={index} style={styles.progressActivityItem}>
              <View style={styles.progressActivityIcon}>
                <Ionicons name="medical" size={16} color="#27AE60" />
              </View>
              <View style={styles.progressActivityInfo}>
                <Text style={styles.progressActivityText}>
                  Took {activity.medicationName}
                </Text>
                <Text style={styles.progressActivityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={handleViewDetailedProgress}
        >
          <Text style={styles.viewAllButtonText}>View Detailed Progress</Text>
        </TouchableOpacity>
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
        return renderMedicationsTab();
      case "reminders":
        return renderRemindersTab();
      case "progress":
        return renderProgressTab();
      case "profile":
        return renderPlaceholder("Profile");
      default:
        return renderHomeTab();
    }
  };

  const getHeaderTitle = () => {
    const titles: { [key: string]: string } = {
      home: "Dashboard",
      medications: "My Medications",
      reminders: "Today's Reminders",
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
    subsectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
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
   quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  medicationList: {
    gap: 12,
  },
  medicationCard: {
    padding: 16,
  },
  medicationContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  medicationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3498DB",
    alignItems: "center",
    justifyContent: "center",
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  medicationStatus: {
    fontSize: 14,
    color: "#666",
  },
    quickActionsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  quickActionButton: {
    flex: 1,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  blueAction: {
    backgroundColor: "#EBF5FB",
    borderColor: "#AED6F1",
    borderWidth: 1,
  },
  greenAction: {
    backgroundColor: "#D5F4E6",
    borderColor: "#A9DFBF",
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  remindersList: {
    gap: 12,
  },
  reminderCard: {
    padding: 16,
  },
  urgentReminderCard: {
    backgroundColor: "#FCF3CF",
    borderWidth: 1,
    borderColor: "#F9E79F",
  },
  reminderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reminderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderMedication: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 14,
    color: "#666",
  },
  markTakenButton: {
    backgroundColor: "#27AE60",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  markTakenText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  viewAllButton: {
    backgroundColor: "#3498DB",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  viewAllButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  reminderSummaryGrid: {
    flexDirection: "row",
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
  },
  summaryCardContent: {
    alignItems: "center",
  },
  blueSummary: {
    backgroundColor: "#EBF5FB",
    borderColor: "#AED6F1",
    borderWidth: 1,
  },
  greenSummary: {
    backgroundColor: "#D5F4E6",
    borderColor: "#A9DFBF",
    borderWidth: 1,
  },
  redSummary: {
    backgroundColor: "#FADBD8",
    borderColor: "#F5B7B1",
    borderWidth: 1,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
  },
  progressCard: {
    backgroundColor: "#EBF5FB",
    borderColor: "#AED6F1",
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  progressNumber: {
    fontSize: 48,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#E5E5E5",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#3498DB",
    borderRadius: 4,
  },
  progressStatsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  progressStatCard: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  progressStatNumber: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  progressStatLabel: {
    fontSize: 14,
    color: "#666",
  },
  progressActivityList: {
    gap: 12,
    marginBottom: 24,
  },
  progressActivityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressActivityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D5F4E6",
    alignItems: "center",
    justifyContent: "center",
  },
  progressActivityInfo: {
    flex: 1,
  },
  progressActivityText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  progressActivityTime: {
    fontSize: 12,
    color: "#666",
  },
});