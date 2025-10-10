import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "@/components/main-navigation/Card";
import { ReminderData } from "./types";

interface RemindersTabProps {
  reminders: ReminderData;
  onMarkTaken: (medication: string) => void;
  onViewAllReminders: () => void;
}

export default function RemindersTab({
  reminders,
  onMarkTaken,
  onViewAllReminders,
}: RemindersTabProps) {
  return (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.row}>
          <Card style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: "#E85D5B" }]}>
              {reminders.summary.pending}
            </Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </Card>

          <Card style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: "#4CAF50" }]}>
              {reminders.summary.completed}
            </Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </Card>

          <Card style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: "#FF6B6B" }]}>
              {reminders.summary.overdue}
            </Text>
            <Text style={styles.summaryLabel}>Overdue</Text>
          </Card>
        </View>
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.subtitle}>Next Reminders</Text>
        <View style={styles.list}>
          {reminders.upcoming.map((reminder) => (
            <Card 
              key={reminder.id} 
              style={reminder.isUrgent ? styles.urgentCard : undefined}
            >
              <View style={styles.reminderContent}>
                <View style={styles.reminderLeft}>
                  <View style={[
                    styles.reminderIconCircle, 
                    reminder.isUrgent && styles.urgentIconCircle
                  ]}>
                    <Ionicons 
                      name="notifications" 
                      size={20} 
                      color={reminder.isUrgent ? "#F4A124" : "#999"} 
                    />
                  </View>
                  <View style={styles.listItemText}>
                    <Text style={styles.listItemTitle}>
                      {reminder.name} {reminder.strength}
                    </Text>
                    <Text style={styles.listItemSubtitle}>{reminder.time}</Text>
                  </View>
                </View>
                {reminder.isUrgent && (
                  <TouchableOpacity 
                    style={styles.primaryButton} 
                    onPress={() => onMarkTaken(reminder.name)}
                  >
                    <Text style={styles.primaryButtonText}>Mark Taken</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))}
        </View>

        <TouchableOpacity style={styles.fullWidthButton} onPress={onViewAllReminders}>
          <Text style={styles.fullWidthButtonText}>View All Reminders</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flex: 1, paddingHorizontal: 20 },
  section: { marginTop: 20 },
  lastSection: { marginBottom: 100 },
  row: { flexDirection: "row", gap: 12 },
  list: { gap: 10 },
  subtitle: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: "#2C2C2C", 
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  // Summary Cards
  summaryCard: { 
    flex: 1, 
    padding: 18, 
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryNumber: { 
    fontSize: 28, 
    fontWeight: "700", 
    marginBottom: 6, 
    letterSpacing: -0.5 
  },
  summaryLabel: { 
    fontSize: 12, 
    color: "#888", 
    fontWeight: "500" 
  },

  // Reminder Cards
  urgentCard: { 
    backgroundColor: "#FFF9E6", 
    borderLeftWidth: 4, 
    borderLeftColor: "#F4C03A",
  },
  reminderContent: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between" 
  },
  reminderLeft: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 12, 
    flex: 1 
  },
  reminderIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  urgentIconCircle: {
    backgroundColor: "#FFFBF0",
  },
  listItemText: { flex: 1 },
  listItemTitle: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#2C2C2C", 
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  listItemSubtitle: { fontSize: 13, color: "#999" },

  // Buttons
  primaryButton: {
    backgroundColor: "#E85D5B",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#E85D5B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: { 
    color: "#FFFFFF", 
    fontSize: 14, 
    fontWeight: "600",
    letterSpacing: -0.2,
  },
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