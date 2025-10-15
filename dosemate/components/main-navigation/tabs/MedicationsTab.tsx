import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MedicationCard from "@/components/main-navigation/MedicationCard";
import AddMedicationScreen from "@/components/main-navigation/AddMedicationScreen";
import MedicationDetailsScreen from "@/components/main-navigation/MedicationsDetailsScreen";
import { Medication } from "./types";

export default function MedicationsTab() {
  // ============ STATIC DATA FOR MEDICATIONS TAB - Organized for Backend Integration ============
  const medicationsData = {
    allMedications: [
      {
        id: 1,
        name: "Metformin",
        strength: "500mg",
        quantity: "1 tablet",
        frequency: "Twice daily",
        times: ["8:00 AM", "8:00 PM"],
        color: "#2196F3",
        nextDose: "8:00 PM",
        adherence: 95,
        foodInstructions: "Take with food",
        purpose: "Diabetes management",
      },
      {
        id: 2,
        name: "Lisinopril",
        strength: "10mg",
        quantity: "1 tablet",
        frequency: "Once daily",
        times: ["8:00 AM"],
        color: "#4CAF50",
        nextDose: "Tomorrow 8:00 AM",
        adherence: 88,
        foodInstructions: "No food restrictions",
        purpose: "Blood pressure control",
      },
      {
        id: 3,
        name: "Atorvastatin",
        strength: "20mg",
        quantity: "1 tablet",
        frequency: "Once daily",
        times: ["9:00 PM"],
        color: "#9C27B0",
        nextDose: "9:00 PM",
        adherence: 92,
        foodInstructions: "Take in the evening",
        purpose: "Cholesterol management",
      },
      {
        id: 4,
        name: "Aspirin",
        strength: "81mg",
        quantity: "1 tablet",
        frequency: "Once daily",
        times: ["8:00 AM"],
        color: "#FF9800",
        nextDose: "Tomorrow 8:00 AM",
        adherence: 97,
        foodInstructions: "Take with food",
        purpose: "Heart protection",
      },
    ],
  };

  const { allMedications: medications } = medicationsData;

  const handleMedicationPress = (name: string) =>
    console.log("Medication pressed:", name);
  const handleEditMedication = (id: number) =>
    console.log("Edit medication:", id);
  const handleDeleteMedication = (id: number) =>
    console.log("Delete medication:", id);

  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showMedicationDetails, setShowMedicationDetails] = useState(false);
  const [selectedMedication, setSelectedMedication] =
    useState<Medication | null>(null);

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
        <View style={styles.section}>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowAddMedication(true)}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name="add-circle" size={26} color="#E85D5B" />
              </View>
              <Text style={styles.actionButtonText}>Add New</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.subtitle}>All Medications</Text>
          {medications.map((med) => (
            <TouchableOpacity
              key={med.id}
              onPress={() => handleMedicationPress(med.name)}
              activeOpacity={0.9}
            >
              <MedicationCard
                medication={med}
                onEdit={() => handleEditMedication(med.id)}
                onDelete={() => handleDeleteMedication(med.id)}
                onViewDetails={() => handleViewDetails(med.id)}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

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
    letterSpacing: -0.3,
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
    letterSpacing: -0.2,
  },
});
