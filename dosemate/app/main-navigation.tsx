import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Import tab components
import HomeTab from "@/components/main-navigation/tabs/HomeTab";
import MedicationsTab from "@/components/main-navigation/tabs/MedicationsTab";
import RemindersTab from "@/components/main-navigation/tabs/RemindersTab";
import ProgressTab from "@/components/main-navigation/tabs/ProgressTab";
import ProfileTab from "@/components/main-navigation/tabs/ProfileTab";
import BottomNavigation from "@/components/main-navigation/Navbar";

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
      allMedications: [
        {
          id: 1,
          name: 'Metformin',
          strength: '500mg',
          quantity: '1 tablet',
          frequency: 'Twice daily',
          times: ['8:00 AM', '8:00 PM'],
          color: '#2196F3',
          nextDose: '8:00 PM',
          adherence: 95,
          foodInstructions: 'Take with food',
          purpose: 'Diabetes management'
        },
        {
          id: 2,
          name: 'Lisinopril',
          strength: '10mg',
          quantity: '1 tablet',
          frequency: 'Once daily',
          times: ['8:00 AM'],
          color: '#4CAF50',
          nextDose: 'Tomorrow 8:00 AM',
          adherence: 88,
          foodInstructions: 'No food restrictions',
          purpose: 'Blood pressure control'
        },
        {
          id: 3,
          name: 'Atorvastatin',
          strength: '20mg',
          quantity: '1 tablet',
          frequency: 'Once daily',
          times: ['9:00 PM'],
          color: '#9C27B0',
          nextDose: '9:00 PM',
          adherence: 92,
          foodInstructions: 'Take in the evening',
          purpose: 'Cholesterol management'
        },
        {
          id: 4,
          name: 'Aspirin',
          strength: '81mg',
          quantity: '1 tablet',
          frequency: 'Once daily',
          times: ['8:00 AM'],
          color: '#FF9800',
          nextDose: 'Tomorrow 8:00 AM',
          adherence: 97,
          foodInstructions: 'Take with food',
          purpose: 'Heart protection'
        }
      ],
    },

    reminders: {
      summary: {
        pending: 2,
        completed: 3,
        overdue: 1,
      },
      upcoming: [
        { id: "rem1", name: "Metformin", strength: "500mg", time: "2:00 PM", isUrgent: true },
        { id: "rem2", name: "Lisinopril", strength: "10mg", time: "8:00 PM", isUrgent: false },
        { id: "rem3", name: "Atorvastatin", strength: "20mg", time: "9:00 PM", isUrgent: false },
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
  const handlers = {
    handleViewReminder: () => { console.log("View reminder pressed"); setActiveTab("reminders"); },
    handleViewDetails: () => { console.log("View detailed analytics pressed"); setActiveTab("progress"); },
    handleWeeklyReport: () => console.log("Weekly report pressed"),
    handleMonthlyReport: () => console.log("Monthly report pressed"),
    handleGenerateShare: () => console.log("Generate & share pressed"),
    handleAddMedication: () => console.log("Add medication pressed"),
    handleMedicationPress: (name: string) => console.log("Medication pressed:", name),
    handleMarkTaken: (medication: string) => console.log("Mark taken:", medication),
    handleViewAllReminders: () => console.log("View all reminders pressed"),
    handleViewDetailedProgress: () => console.log("View detailed progress pressed"),
    handleProfileOption: (option: string) => console.log("Profile option pressed:", option),
    handleLearnMorePremium: () => console.log("Learn more about premium pressed"),
    handleEditMedication: (id: number) => console.log("Edit medication:", id),
    handleDeleteMedication: (id: number) => console.log("Delete medication:", id),
    handleViewMedicationDetails: (id: number) => console.log("View details:", id),
  };

  const { medications, reminders, progress, motivation, user } = navigationData;

  // ============ RENDER TAB CONTENT ============
  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeTab
            medications={medications}
            reminders={reminders}
            progress={progress}
            motivation={motivation}
            onViewReminder={handlers.handleViewReminder}
            onViewDetails={handlers.handleViewDetails}
            onWeeklyReport={handlers.handleWeeklyReport}
            onMonthlyReport={handlers.handleMonthlyReport}
            onGenerateShare={handlers.handleGenerateShare}
          />
        );
      
      case "medications":
        return (
          <MedicationsTab
            medications={medications.allMedications}
            onAddMedication={handlers.handleAddMedication}
            onMedicationPress={handlers.handleMedicationPress}
            onEditMedication={handlers.handleEditMedication}
            onDeleteMedication={handlers.handleDeleteMedication}
            onViewMedicationDetails={handlers.handleViewMedicationDetails}
          />
        );
      
      case "reminders":
        return (
          <RemindersTab
            reminders={reminders}
            onMarkTaken={handlers.handleMarkTaken}
            onViewAllReminders={handlers.handleViewAllReminders}
          />
        );
      
      case "progress":
        return (
          <ProgressTab
            progress={progress}
            recentActivity={medications.recent}
            onViewDetailedProgress={handlers.handleViewDetailedProgress}
          />
        );
      
      case "profile":
        return (
          <ProfileTab
            user={user}
            onProfileOption={handlers.handleProfileOption}
            onLearnMorePremium={handlers.handleLearnMorePremium}
          />
        );
      
      default:
        return (
          <HomeTab
            medications={medications}
            reminders={reminders}
            progress={progress}
            motivation={motivation}
            onViewReminder={handlers.handleViewReminder}
            onViewDetails={handlers.handleViewDetails}
            onWeeklyReport={handlers.handleWeeklyReport}
            onMonthlyReport={handlers.handleMonthlyReport}
            onGenerateShare={handlers.handleGenerateShare}
          />
        );
    }
  };

  // ============ HEADER HELPERS ============
  const getHeaderTitle = () => ({
    home: "Welcome back",
    medications: "Medications",
    reminders: "Reminders",
    progress: "Progress",
    profile: "Profile",
  }[activeTab] || "Home");

  const getHeaderSubtitle = () => ({
    home: "Ready to stay on track today?",
    medications: "Manage your medications",
    reminders: "Stay on top of your schedule",
    progress: "Track your adherence journey",
    profile: "Manage your account",
  }[activeTab] || "");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
            <Text style={styles.headerSubtitle}>{getHeaderSubtitle()}</Text>
          </View>
          {activeTab === "home" && (
            <View style={styles.heartContainer}>
              <Ionicons name="heart" size={28} color="#E85D5B" />
            </View>
          )}
        </View>
      </View>
      {renderTabContent()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: "700", 
    color: "#2C2C2C", 
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: { 
    fontSize: 15, 
    color: "#888",
    fontWeight: "400",
  },
  heartContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFF5F5",
    alignItems: "center",
    justifyContent: "center",
  },
});