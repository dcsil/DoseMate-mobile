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


  // ============ EVENT HANDLERS ============
  const handlers = {
    handleViewReminder: () => { console.log("View reminder pressed"); setActiveTab("reminders"); },
    handleViewDetails: () => { console.log("View detailed analytics pressed"); setActiveTab("progress"); },
  };


  // ============ RENDER TAB CONTENT ============
  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeTab
            onViewReminder={handlers.handleViewReminder}
            onViewDetails={handlers.handleViewDetails}
          />
        );
      
      case "medications":
        return (
          <MedicationsTab />
        );
      
      case "reminders":
        return (
          <RemindersTab />
        );
      
      case "progress":
        return (
          <ProgressTab />
        );
      
      case "profile":
        return (
          <ProfileTab />
        );
      
      default:
        return (
          <HomeTab
            onViewReminder={handlers.handleViewReminder}
            onViewDetails={handlers.handleViewDetails}
          />
        );
    }
  };

  // ============ HEADER HELPERS ============
  const getHeaderTitle = () => ({
    home: "Welcome Back",
    medications: "Medications",
    reminders: "Today's Reminders",
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