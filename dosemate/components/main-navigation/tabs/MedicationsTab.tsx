import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { Calendar } from "react-native-calendars";
import MedicationCard from "@/components/main-navigation/MedicationCard";
import AddMedicationScreen from "@/components/main-navigation/AddMedicationScreen";
import MedicationDetailsScreen from "@/components/main-navigation/MedicationsDetailsScreen";
import { Medication } from "./types";
import { notificationService } from "@/components/services/notificationService";
import { BACKEND_BASE_URL } from "@/config";
import * as SecureStore from "expo-secure-store";

interface ScheduledDose {
  id: string;
  medicationId: number;
  medicationName: string;
  date: string; // YYYY-MM-DD format
  time: string;
  notificationId?: string;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Backend schedule from API
export interface Schedule {
  strength: string;
  quantity: string;
  frequency: string;
  time_of_day: string[]; // e.g. ["8:00 AM", "2:00 PM"]
  days: string[]; // e.g. ["Monday", "Wednesday"]
  food_instructions?: string;
}

// Backend medication format
export interface ApiMed {
  id: number;
  brand_name: string;
  purpose?: string;
  adherence_score?: number;

  // The backend returns a list of schedules per med
  schedules: Schedule[];
}

export default function MedicationsTab() {
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showMedicationDetails, setShowMedicationDetails] = useState(false);
  const [selectedMedication, setSelectedMedication] =
    useState<Medication | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(
    null,
  );
  const [editedTimes, setEditedTimes] = useState<string[]>([]);
  const [editedDays, setEditedDays] = useState<string[]>([]);
  const [scheduledDoses, setScheduledDoses] = useState<ScheduledDose[]>([]);

  // ============ MEDICATION STATE ============
  const [medications, setMedications] = useState<Medication[]>([]);

  const generateColor = (name: string) => {
    const COLORS = ["#2196F3", "#4CAF50", "#9C27B0", "#FF9800"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COLORS.length;
    return COLORS[index];
  };

  const calculateNextDose = (schedule: Schedule) => {
    if (
      !schedule ||
      !schedule.time_of_day ||
      schedule.time_of_day.length === 0
    ) {
      return "No scheduled times";
    }

    const now = new Date();
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

    // If schedule has days and today isn't included → tomorrow’s first time
    if (schedule.days && !schedule.days.includes(today)) {
      return `Tomorrow ${schedule.time_of_day[0]}`;
    }

    // Convert time_of_day entries to actual Date objects for today
    const upcoming = schedule.time_of_day
      .map((t: string) => {
        const [time, modifier] = t.split(" ");
        let [hour, minute] = time.split(":").map(Number);

        if (modifier === "PM" && hour !== 12) hour += 12;
        if (modifier === "AM" && hour === 12) hour = 0;

        const d = new Date();
        d.setHours(hour, minute, 0, 0);

        return d;
      })
      .filter((d: Date) => d > now);

    // Case 1: there's a remaining dose today
    if (upcoming.length > 0) {
      const nextTime = upcoming[0];
      return nextTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    // Case 2: no times left today → tomorrow’s first time
    return `Tomorrow ${schedule.time_of_day[0]}`;
  };

  useEffect(() => {
    const transformMedication = (apiMed: ApiMed): Medication => {
      const schedule = apiMed.schedules[0]; // assuming 1 per med for now

      return {
        id: apiMed.id,
        name: apiMed.brand_name,
        strength: schedule?.strength || "Standard dosage",
        quantity: schedule?.quantity || "",
        frequency: schedule?.frequency,
        times: schedule?.time_of_day || [],
        days: schedule?.days || [],
        color: generateColor(apiMed.brand_name),
        nextDose: calculateNextDose(schedule),
        adherence: apiMed.adherence_score ?? 99,
        foodInstructions: schedule?.food_instructions || "",
        purpose: apiMed.purpose || "General use",
      };
    };

    const fetchMeds = async () => {
      try {
        const token = await SecureStore.getItemAsync("jwt");
        if (!token) throw new Error("No JWT token found");
        const res = await fetch(`${BACKEND_BASE_URL}/user/medications`, {
          method: "GET",
          credentials: "include", // needed if you're using cookies/jwt
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch medications");
          return;
        }

        const data = await res.json();

        const transformed = data.map(transformMedication);

        setMedications(transformed);
      } catch (err) {
        console.error("Error fetching meds:", err);
      }
    };

    fetchMeds();
  }, []);

  // ============ NOTIFICATION SETUP ============
  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    const hasPermission = await notificationService.requestPermissions();
    setNotificationsEnabled(hasPermission);

    if (hasPermission) {
      await scheduleAllMedications();

      const cleanup = notificationService.setupNotificationListeners(
        (notification) => {
          console.log("✅ Notification received:", notification);
        },
        (response) => {
          console.log("✅ Notification tapped - navigating to Reminders tab");
        },
      );

      return cleanup;
    } else {
      Alert.alert(
        "Notifications Disabled",
        "Please enable notifications in your device settings.",
      );
    }
  };

  const scheduleAllMedications = async () => {
    try {
      await notificationService.cancelAllNotifications();

      // Schedule recurring medications
      for (const med of medications) {
        await notificationService.scheduleMedicationWithMultipleTimes(
          med.id,
          med.name,
          med.strength,
          med.quantity,
          med.times,
          med.days,
          med.foodInstructions,
        );
      }

      // Schedule specific date doses
      for (const dose of scheduledDoses) {
        await scheduleSpecificDateDose(dose);
      }

      console.log("✅ All medication reminders scheduled");
    } catch (error) {
      console.error("❌ Error scheduling medications:", error);
      Alert.alert("Error", "Failed to schedule medication reminders");
    }
  };

  const scheduleSpecificDateDose = async (dose: ScheduledDose) => {
    try {
      const med = medications.find((m) => m.id === dose.medicationId);
      if (!med) return;

      // Parse date and time
      const [year, month, day] = dose.date.split("-").map(Number);
      const [timeStr, period] = dose.time.split(" ");
      let [hour, minute] = timeStr.split(":").map(Number);

      if (period === "PM" && hour !== 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;

      const scheduleDate = new Date(year, month - 1, day, hour, minute);
      const now = new Date();

      if (scheduleDate <= now) {
        console.log(
          "⚠️ Scheduling for past/current time:",
          dose.date,
          dose.time,
        );
        // Still allow it - user might want to schedule for later today
      }

      const secondsUntil = Math.floor(
        (scheduleDate.getTime() - now.getTime()) / 1000,
      );

      // If time is in the past, don't schedule notification
      if (secondsUntil <= 0) {
        console.log("⚠️ Time already passed, notification not scheduled");
        return;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `💊 Time for ${med.name}`,
          body: `Take ${med.quantity} (${med.strength})\n${med.foodInstructions}`,
          data: {
            medicationId: med.id,
            doseId: dose.id,
            type: "specific-date-dose",
          },
          sound: "default",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntil,
        },
      });

      console.log(`✅ Scheduled ${med.name} for ${dose.date} at ${dose.time}`);
      return notificationId;
    } catch (error) {
      console.error("❌ Error scheduling specific date dose:", error);
    }
  };

  // ============ CALENDAR HANDLERS ============
  const handleScheduleForDate = (medicationId: number) => {
    const medication = medications.find((m) => m.id === medicationId);
    if (medication) {
      setEditingMedication(medication);
      setShowCalendarModal(true);
    }
  };

  const handleDateSelect = (date: string) => {
    // Show time selection for this date
    Alert.alert(
      "Select Time",
      `Schedule ${editingMedication?.name} for ${date}`,
      [
        {
          text: "Morning (8:00 AM)",
          onPress: () => addDoseForDate(date, "8:00 AM"),
        },
        {
          text: "Afternoon (2:00 PM)",
          onPress: () => addDoseForDate(date, "2:00 PM"),
        },
        {
          text: "Evening (8:00 PM)",
          onPress: () => addDoseForDate(date, "8:00 PM"),
        },
        {
          text: "Custom Time",
          onPress: () => showCustomTimePicker(date),
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const showCustomTimePicker = (date: string) => {
    Alert.prompt(
      "Enter Time",
      'Format: "8:00 AM" or "2:30 PM"',
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Schedule",
          onPress: (time: any) => {
            if (time) addDoseForDate(date, time);
          },
        },
      ],
      "plain-text",
      "8:00 AM",
    );
  };

  const addDoseForDate = async (date: string, time: string) => {
    if (!editingMedication) return;

    const newDose: ScheduledDose = {
      id: `${editingMedication.id}-${date}-${time}`,
      medicationId: editingMedication.id,
      medicationName: editingMedication.name,
      date,
      time,
    };

    setScheduledDoses([...scheduledDoses, newDose]);
    await scheduleSpecificDateDose(newDose);

    Alert.alert(
      "✅ Scheduled!",
      `${editingMedication.name} scheduled for ${date} at ${time}`,
    );

    setShowCalendarModal(false);
    setEditingMedication(null);
  };

  const removeDoseForDate = (doseId: string) => {
    Alert.alert("Remove Dose", "Remove this scheduled dose?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setScheduledDoses(scheduledDoses.filter((d) => d.id !== doseId));
          Alert.alert("Removed", "Dose removed from schedule");
        },
      },
    ]);
  };

  // Get marked dates for calendar
  const getMarkedDates = () => {
    const marked: any = {};
    scheduledDoses.forEach((dose) => {
      if (!marked[dose.date]) {
        marked[dose.date] = {
          marked: true,
          dotColor: "#E85D5B",
          doses: [],
        };
      }
      marked[dose.date].doses.push(dose);
    });
    return marked;
  };

  // ============ EDIT RECURRING DOSES ============
  const handleEditMedication = (id: number) => {
    const medication = medications.find((med) => med.id === id);
    if (medication) {
      setEditingMedication(medication);
      setEditedTimes([...medication.times]);
      setEditedDays([...(medication.days || [])]);
      setShowEditModal(true);
    }
  };

  const handleUpdateTime = (index: number, newTime: string) => {
    const updated = [...editedTimes];
    updated[index] = newTime;
    setEditedTimes(updated);
  };

  const handleAddTime = () => {
    setEditedTimes([...editedTimes, "12:00 PM"]);
  };

  const handleRemoveTime = (index: number) => {
    if (editedTimes.length === 1) {
      Alert.alert("Error", "You must have at least one reminder time");
      return;
    }
    const updated = editedTimes.filter((_, i) => i !== index);
    setEditedTimes(updated);
  };

  const toggleDay = (day: string) => {
    if (editedDays.includes(day)) {
      if (editedDays.length === 1) {
        Alert.alert("Error", "You must select at least one day");
        return;
      }
      setEditedDays(editedDays.filter((d) => d !== day));
    } else {
      setEditedDays([...editedDays, day]);
    }
  };

  const handleSaveDose = async () => {
    if (!editingMedication) return;

    const updatedMedications = medications.map((med) =>
      med.id === editingMedication.id
        ? { ...med, times: editedTimes, days: editedDays }
        : med,
    );

    setMedications(updatedMedications);
    await scheduleAllMedications();

    Alert.alert("Success", `${editingMedication.name} schedule updated!`);
    setShowEditModal(false);
    setEditingMedication(null);
  };

  // ============ OTHER HANDLERS ============
  const handleTestNotification = async () => {
    await notificationService.sendTestNotification("Test Medication");
    Alert.alert("Test Sent!", "Check in 1 second. Tap it to test navigation!");
  };

  const handleViewScheduled = async () => {
    const scheduled = await notificationService.getScheduledNotifications();

    Alert.alert(
      "📅 Scheduled Notifications",
      `Total: ${scheduled.length} recurring reminders\n\nSpecific Dates: ${scheduledDoses.length} doses`,
      [
        {
          text: "View Dates",
          onPress: () => {
            const details = scheduledDoses
              .map((d) => `• ${d.medicationName}: ${d.date} at ${d.time}`)
              .join("\n");
            Alert.alert(
              "Scheduled Dates",
              details || "No specific dates scheduled",
            );
          },
        },
        { text: "OK" },
      ],
    );
  };

  const handleDeleteMedication = async (id: number) => {
    Alert.alert(
      "Delete Medication",
      "This will remove all recurring and specific date reminders.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await notificationService.cancelMedicationNotifications(id);
            setMedications(medications.filter((med) => med.id !== id));
            setScheduledDoses(
              scheduledDoses.filter((d) => d.medicationId !== id),
            );
            Alert.alert("Deleted", "Medication removed");
          },
        },
      ],
    );
  };

  const handleViewDetails = (id: number) => {
    const medication = medications.find((med) => med.id === id);
    if (medication) {
      setSelectedMedication(medication);
      setShowMedicationDetails(true);
    }
  };

  return (
    <>
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!notificationsEnabled && (
          <View style={styles.warningBanner}>
            <Ionicons name="notifications-off" size={20} color="#FF9800" />
            <Text style={styles.warningText}>
              Notifications disabled. Enable in settings.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleTestNotification}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name="notifications" size={26} color="#2196F3" />
              </View>
              <Text style={styles.actionButtonText}>Test Alert</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewScheduled}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name="calendar" size={26} color="#4CAF50" />
              </View>
              <Text style={styles.actionButtonText}>View Scheduled</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.subtitle}>All Medications</Text>
          {medications.map((med) => (
            <TouchableOpacity key={med.id} activeOpacity={0.9}>
              <MedicationCard
                medication={med}
                onEdit={() => handleScheduleForDate(med.id)}
                onDelete={() => handleDeleteMedication(med.id)}
                onViewDetails={() => handleViewDetails(med.id)}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Show Scheduled Specific Dates */}
        {scheduledDoses.length > 0 && (
          <View style={[styles.section, styles.lastSection]}>
            <Text style={styles.subtitle}>Scheduled Specific Dates</Text>
            {scheduledDoses.map((dose) => (
              <View key={dose.id} style={styles.scheduledDoseCard}>
                <View style={styles.doseInfo}>
                  <Text style={styles.doseMedName}>{dose.medicationName}</Text>
                  <Text style={styles.doseDateTime}>
                    📅 {dose.date} at ⏰ {dose.time}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeDoseForDate(dose.id)}>
                  <Ionicons name="trash" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* CALENDAR MODAL */}
      <Modal
        visible={showCalendarModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Schedule {editingMedication?.name}
              </Text>
              <TouchableOpacity onPress={() => setShowCalendarModal(false)}>
                <Ionicons name="close" size={28} color="#2C2C2C" />
              </TouchableOpacity>
            </View>

            <Calendar
              onDayPress={(day) => handleDateSelect(day.dateString)}
              markedDates={getMarkedDates()}
              theme={{
                selectedDayBackgroundColor: "#E85D5B",
                todayTextColor: "#E85D5B",
                arrowColor: "#E85D5B",
              }}
            />

            <View style={styles.calendarLegend}>
              <View style={styles.legendItem}>
                <View style={styles.legendDot} />
                <Text style={styles.legendText}>Has scheduled dose</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT RECURRING DOSES MODAL */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Edit Recurring - {editingMedication?.name}
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={28} color="#2C2C2C" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>Times:</Text>
              {editedTimes.map((time, index) => (
                <View key={index} style={styles.timeRow}>
                  <TextInput
                    style={styles.timeInput}
                    value={time}
                    onChangeText={(text) => handleUpdateTime(index, text)}
                    placeholder="8:00 AM"
                  />
                  <TouchableOpacity
                    onPress={() => handleRemoveTime(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addTimeButton}
                onPress={handleAddTime}
              >
                <Ionicons name="add-circle" size={24} color="#4CAF50" />
                <Text style={styles.addTimeText}>Add Time</Text>
              </TouchableOpacity>

              <Text style={[styles.modalSubtitle, { marginTop: 24 }]}>
                Days:
              </Text>
              <View style={styles.daysContainer}>
                {DAYS_OF_WEEK.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      editedDays.includes(day) && styles.dayButtonActive,
                    ]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        editedDays.includes(day) && styles.dayButtonTextActive,
                      ]}
                    >
                      {day.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveDose}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <AddMedicationScreen
        visible={showAddMedication}
        onClose={() => setShowAddMedication(false)}
      />
      <MedicationDetailsScreen
        visible={showMedicationDetails}
        onClose={() => {
          setShowMedicationDetails(false);
          setSelectedMedication(null);
        }}
        medication={selectedMedication}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flex: 1, paddingHorizontal: 20 },
  section: { marginTop: 20 },
  lastSection: { marginBottom: 100 },
  row: { flexDirection: "row", gap: 12 },
  subtitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    height: 100,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C2C2C",
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: "#B8860B",
    fontWeight: "500",
  },
  scheduledDoseCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  doseInfo: {
    flex: 1,
  },
  doseMedName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 4,
  },
  doseDateTime: {
    fontSize: 14,
    color: "#777",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingTop: 20,
  },
  calendarModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C2C2C",
  },
  modalBody: {
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  timeInput: {
    flex: 1,
    height: 50,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2C",
  },
  removeButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#FFE8E8",
    alignItems: "center",
    justifyContent: "center",
  },
  addTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderRadius: 12,
    marginTop: 8,
  },
  addTimeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
  },
  dayButtonActive: {
    backgroundColor: "#E85D5B",
    borderColor: "#E85D5B",
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
  },
  dayButtonTextActive: {
    color: "#FFFFFF",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2C",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  calendarLegend: {
    padding: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E85D5B",
  },
  legendText: {
    fontSize: 14,
    color: "#777",
  },
});
