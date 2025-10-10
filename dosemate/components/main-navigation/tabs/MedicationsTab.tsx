import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MedicationCard from "@/components/main-navigation/MedicationCard";
import { FullMedication } from "./types";

interface MedicationsTabProps {
  medications: FullMedication[];
  onAddMedication: () => void;
  onMedicationPress: (name: string) => void;
  onEditMedication: (id: number) => void;
  onDeleteMedication: (id: number) => void;
  onViewMedicationDetails: (id: number) => void;
}

export default function MedicationsTab({
  medications,
  onAddMedication,
  onMedicationPress,
  onEditMedication,
  onDeleteMedication,
  onViewMedicationDetails,
}: MedicationsTabProps) {
  return (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.actionButton} onPress={onAddMedication}>
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
            onPress={() => onMedicationPress(med.name)} 
            activeOpacity={0.9}
          >
            <MedicationCard
              medication={med}
              onEdit={() => onEditMedication(med.id)}
              onDelete={() => onDeleteMedication(med.id)}
              onViewDetails={() => onViewMedicationDetails(med.id)}
            />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
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