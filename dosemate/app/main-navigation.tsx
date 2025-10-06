import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Import card components
import StatsCard from "@/components/main-navigation/StatsCard";
import NextReminderCard from "@/components/main-navigation/NextReminderCard";
import AdherenceProgressCard from "@/components/main-navigation/AdherenceProgressCard";
import MotivationalCard from "@/components/main-navigation/MotivationalCard";
import WeeklyOverviewCard from "@/components/main-navigation/WeeklyOverviewCard";
import RecentActivityCard from "@/components/main-navigation/RecentActivityCard";
import ShareHealthcareCard from "@/components/main-navigation/ShareHealthcareCard";
import BottomNavigation from "@/components/main-navigation/Navbar";
import Card from "@/components/main-navigation/Card";

export default function NavigationScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");

  // ============ DYNAMIC DATA - Organized for Backend Integration ============
  const navigationData = {
    user: {
      id: "user123",
      name: "John Doe",
    },
    
    medications: {
      today: {
        taken: 3,
        total: 4,
      },
      recent: [
        { 
          id: "med1",
          name: "Amlodipine", 
          dose: "5mg",
          lastTaken: "Today at 12:00 PM", 
          time: "12:00 PM",
          status: "taken" as const 
        },
        { 
          id: "med2",
          name: "Levothyroxine", 
          dose: "50mcg",
          lastTaken: "Today at 8:00 AM", 
          time: "8:00 AM",
          status: "taken" as const 
        },
        { 
          id: "med3",
          name: "Hydrochlorothiazide", 
          dose: "25mg",
          lastTaken: "Today at 8:00 AM", 
          time: "8:00 AM",
          status: "taken" as const 
        },
      ],
    },

    reminders: {
      summary: {
        pending: 2,
        completed: 3,
        overdue: 1,
      },
      upcoming: [
        { id: "rem1", name: "Metformin", dose: "500mg", time: "2:00 PM", isUrgent: true },
        { id: "rem2", name: "Lisinopril", dose: "10mg", time: "8:00 PM", isUrgent: false },
        { id: "rem3", name: "Atorvastatin", dose: "20mg", time: "9:00 PM", isUrgent: false },
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

  // ============ EVENT HANDLERS ============
  const handleViewReminder = () => {console.log("View reminder pressed"); setActiveTab("reminders"); };
  const handleViewDetails = () => {console.log("View detailed analytics pressed"); setActiveTab("progress"); };
  const handleWeeklyReport = () => console.log("Weekly report pressed");
  const handleMonthlyReport = () => console.log("Monthly report pressed");
  const handleGenerateShare = () => console.log("Generate & share pressed");
  const handleViewAllMedications = () => console.log("View all medications pressed");
  const handleAddMedication = () => console.log("Add medication pressed");
  const handleMedicationPress = (medicationName: string) => console.log("Medication pressed:", medicationName);
  const handleMarkTaken = (medication: string) => console.log("Mark taken:", medication);
  const handleViewAllReminders = () => console.log("View all reminders pressed");
  const handleViewDetailedProgress = () => console.log("View detailed progress pressed");
  const handleProfileOption = (option: string) => console.log("Profile option pressed:", option);
  const handleLearnMorePremium = () => console.log("Learn more about premium pressed");

  // ============ RENDER FUNCTIONS ============
  
  const { medications, reminders, progress, motivation } = navigationData;

  
  const renderHomeTab = () => (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.row}>
          <StatsCard
            icon="pill"
            iconLibrary="material"
            iconColor="#ffffff"
            iconBgColor="#3498DB"
            label="Today's Meds"
            value={`${medications.today.taken} of ${medications.today.total}`}
            cardBgColor="#EBF5FB"
            borderColor="#AED6F1"
          />
          <StatsCard
            icon="bar-chart"
            iconColor="#ffffff"
            iconBgColor="#27AE60"
            label="This Week"
            value={`${progress.week.percentage}%`}
            cardBgColor="#D5F4E6"
            borderColor="#A9DFBF"
          />
        </View>
      </View>

      <View style={styles.section}>
        <NextReminderCard
          name={reminders.upcoming[0]?.name ?? ""}
          dose={reminders.upcoming[0]?.dose ?? ""}
          time={reminders.upcoming[0]?.time ?? ""}
          onViewPress={handleViewReminder}
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
          onViewDetails={handleViewDetails} 
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


  const renderMedicationsTab = () => (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.actionButton, styles.blueAction]} onPress={handleViewAllMedications}>
            <MaterialCommunityIcons name="pill" size={32} color="#3498DB" />
            <Text style={styles.actionButtonText}>View All</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.greenAction]} onPress={handleAddMedication}>
            <Ionicons name="add-circle" size={32} color="#27AE60" />
            <Text style={styles.actionButtonText}>Add New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.subtitle}>Recent Medications</Text>
        <View style={styles.list}>
          {medications.recent.map((med) => (
            <TouchableOpacity key={med.id} onPress={() => handleMedicationPress(med.name)}>
              <Card style={styles.listItem}>
                <View style={styles.listItemContent}>
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="pill" size={20} color="#fff" />
                  </View>
                  <View style={styles.listItemText}>
                    <Text style={styles.listItemTitle}>{med.name}</Text>
                    <Text style={styles.listItemSubtitle}>Taken today</Text>
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
      <View style={styles.section}>
        <View style={styles.row}>
          
          <Card style={[styles.summaryCard, styles.blueSummary]}>
            <Text style={[styles.summaryNumber, { color: "#3498DB" }]}>{reminders.summary.pending}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </Card>

          <Card style={[styles.summaryCard, styles.greenSummary]}>
            <Text style={[styles.summaryNumber, { color: "#27AE60" }]}>{reminders.summary.completed}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </Card>

          <Card style={[styles.summaryCard, styles.redSummary]}>
            <Text style={[styles.summaryNumber, { color: "#E74C3C" }]}>{reminders.summary.overdue}</Text>
            <Text style={styles.summaryLabel}>Overdue</Text>
          </Card>
        </View>
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.subtitle}>Next Reminders</Text>
        <View style={styles.list}>
          {reminders.upcoming.map((reminder) => (
            <Card key={reminder.id} style={reminder.isUrgent ? styles.urgentCard : undefined}>
              <View style={styles.reminderContent}>
                <View style={styles.reminderLeft}>
                  <Ionicons name="notifications" size={24} color={reminder.isUrgent ? "#F39C12" : "#888"} />
                  <View style={styles.listItemText}>
                    <Text style={styles.listItemTitle}>{reminder.name} {reminder.dose}</Text>
                    <Text style={styles.listItemSubtitle}>{reminder.time}</Text>
                  </View>
                </View>
                {reminder.isUrgent && (
                  <TouchableOpacity style={styles.primaryButton} onPress={() => handleMarkTaken(reminder.name ?? "")}>
                    <Text style={styles.primaryButtonText}>Mark Taken</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))}
        </View>

        <TouchableOpacity style={styles.fullWidthButton} onPress={handleViewAllReminders}>
          <Text style={styles.fullWidthButtonText}>View All Reminders</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderProgressTab = () => (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.progressCard}>
          <Text style={styles.progressNumber}>{progress.week.percentage}%</Text>
          <Text style={styles.progressLabel}>Weekly Adherence</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress.week.percentage}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Card style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#27AE60" }]}>{progress.week.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#3498DB" }]}>
              {progress.week.taken}/{progress.week.total}
            </Text>
            <Text style={styles.statLabel}>This Week</Text>
          </Card>
        </View>
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.subtitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          {medications.recent.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <MaterialCommunityIcons name="pill" size={16} color="#27AE60" />
              </View>
              <View style={styles.listItemText}>
                <Text style={styles.activityText}>Took {activity.name} {activity.dose}</Text>
                <Text style={styles.listItemSubtitle}>{activity.lastTaken}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.fullWidthButton} onPress={handleViewDetailedProgress}>
          <Text style={styles.fullWidthButtonText}>View Detailed Progress</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderProfileTab = () => (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <View style={styles.profileIconContainer}>
          <Ionicons name="person" size={40} color="#3498DB" />
        </View>
        <Text style={styles.title}>{navigationData.user.name}</Text>
      </View>

      <View style={styles.section}>
        {[
          { icon: "person-outline", title: "Personal Information", subtitle: "Update your profile details", action: "personal-info" },
          { icon: "notifications-outline", title: "Notification Settings", subtitle: "Customize your reminders", action: "notifications" },
          { icon: "calendar-outline", title: "Schedule Preferences", subtitle: "Set your daily routine", action: "schedule" },
          { icon: "bar-chart-outline", title: "Health Goals", subtitle: "Set adherence targets", action: "health-goals" },
        ].map((option, index) => (
          <TouchableOpacity key={index} onPress={() => handleProfileOption(option.action)}>
            <Card style={styles.listItem}>
              <View style={styles.listItemContent}>
                <Ionicons name={option.icon as any} size={24} color="#888" />
                <View style={styles.listItemText}>
                  <Text style={styles.listItemTitle}>{option.title}</Text>
                  <Text style={styles.listItemSubtitle}>{option.subtitle}</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <View style={styles.divider} />
        <Card style={styles.premiumCard}>
          <Text style={styles.premiumTitle}>DoseMate Premium</Text>
          <Text style={styles.premiumSubtitle}>Get advanced analytics and family sharing</Text>
          <TouchableOpacity style={styles.premiumButton} onPress={handleLearnMorePremium}>
            <Text style={styles.primaryButtonText}>Learn More</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "home": return renderHomeTab();
      case "medications": return renderMedicationsTab();
      case "reminders": return renderRemindersTab();
      case "progress": return renderProgressTab();
      case "profile": return renderProfileTab();
      default: return renderHomeTab();
    }
  };

  const getHeaderTitle = () => ({
    home: "Home",
    medications: "Medications",
    reminders: "Reminders",
    progress: "Progress",
    profile: "Profile",
  }[activeTab] || "Home");

  const getHeaderSubtitle = () => ({
    home: "Ready to stay on track today?",
    medications: "Manage your medications",
    reminders: "Stay on top of your schedule",
    progress: "Track your adherence",
    profile: "Your account settings",
  }[activeTab] || "");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        <Text style={styles.headerSubtitle}>{getHeaderSubtitle()}</Text>
      </View>
      {renderTabContent()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Container & Layout
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollContent: { flex: 1, paddingHorizontal: 24 },
  section: { marginTop: 24 },
  lastSection: { marginBottom: 24 },
  row: { flexDirection: "row", gap: 16 },
  list: { gap: 12 },

  // Header
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#333", marginBottom: 4 },
  headerSubtitle: { fontSize: 16, color: "#666" },

  // Typography
  title: { fontSize: 24, fontWeight: "700", color: "#333", marginBottom: 8 },
  subtitle: { fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 16 },
  centered: { fontSize: 16, color: "#666", textAlign: "center" },

  // Buttons
  actionButton: {
    flex: 1,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  blueAction: { backgroundColor: "#EBF5FB", borderColor: "#AED6F1" },
  greenAction: { backgroundColor: "#D5F4E6", borderColor: "#A9DFBF" },
  actionButtonText: { fontSize: 14, fontWeight: "600", color: "#333" },

  primaryButton: {
    backgroundColor: "#27AE60",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  primaryButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  fullWidthButton: {
    backgroundColor: "#3498DB",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  fullWidthButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  // List Items
  listItem: { padding: 16, marginBottom: 16 },
  listItemContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  listItemText: { flex: 1 },
  listItemTitle: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4 },
  listItemSubtitle: { fontSize: 14, color: "#666" },

  // Icons
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3498DB",
    alignItems: "center",
    justifyContent: "center",
  },

  // Summary Cards
  summaryCard: { flex: 1, padding: 16, borderWidth: 1, alignItems: "center" },
  blueSummary: { backgroundColor: "#EBF5FB", borderColor: "#AED6F1" },
  greenSummary: { backgroundColor: "#D5F4E6", borderColor: "#A9DFBF" },
  redSummary: { backgroundColor: "#FADBD8", borderColor: "#F5B7B1" },
  summaryNumber: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
  summaryLabel: { fontSize: 12, color: "#666" },

  // Reminder Cards
  urgentCard: { backgroundColor: "#FCF3CF", borderWidth: 1, borderColor: "#F9E79F" },
  reminderContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reminderLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },

  // Progress Cards
  progressCard: {
    backgroundColor: "#EBF5FB",
    borderColor: "#AED6F1",
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  progressNumber: { fontSize: 48, fontWeight: "700", color: "#333", marginBottom: 8 },
  progressLabel: { fontSize: 16, color: "#666", marginBottom: 16 },
  progressBar: { width: "100%", height: 8, backgroundColor: "#E5E5E5", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#3498DB", borderRadius: 4 },

  statCard: { flex: 1, padding: 16, alignItems: "center" },
  statNumber: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
  statLabel: { fontSize: 14, color: "#666" },

  // Activity Items
  activityList: { gap: 12, marginBottom: 24 },
  activityItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D5F4E6",
    alignItems: "center",
    justifyContent: "center",
  },
  activityText: { fontSize: 14, color: "#333", marginBottom: 2 },

  // Profile
  profileHeader: { alignItems: "center", marginTop: 24 },
  profileIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EBF5FB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  divider: { height: 1, backgroundColor: "#E5E5E5", marginBottom: 24 },

  premiumCard: {
    backgroundColor: "#EBF5FB",
    borderWidth: 1,
    borderColor: "#AED6F1",
    padding: 16,
    alignItems: "center",
  },
  premiumTitle: { fontSize: 16, fontWeight: "600", color: "#1A5490", marginBottom: 8 },
  premiumSubtitle: { fontSize: 14, color: "#2874A6", textAlign: "center", marginBottom: 16 },
  premiumButton: { backgroundColor: "#3498DB", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
});