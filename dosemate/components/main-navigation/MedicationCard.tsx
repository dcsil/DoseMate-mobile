import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

interface Medication {
  id: number;
  name: string;
  strength: string;
  quantity: string;
  frequency: string;
  times: string[];
  color: string;
  nextDose: string;
  adherence: number;
  foodInstructions: string;
  purpose: string;
}

interface MedicationCardProps {
  medication: Medication;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
}

export default function MedicationCard({
  medication,
  onEdit,
  onDelete,
  onViewDetails,
}: MedicationCardProps) {
  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 90) return { bg: "#D5F4E6", text: "#27AE60" };
    if (adherence >= 80) return { bg: "#FCF3CF", text: "#F39C12" };
    return { bg: "#FADBD8", text: "#E74C3C" };
  };

  const getNextDoseColor = (nextDose: string) => {
    if (nextDose.includes("Tomorrow")) {
      return { bg: "#E5E5E5", text: "#666" };
    }
    return { bg: "#EBF5FB", text: "#3498DB" };
  };

  const adherenceColors = getAdherenceColor(medication.adherence);
  const nextDoseColors = getNextDoseColor(medication.nextDose);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[styles.iconCircle, { backgroundColor: medication.color }]}
          >
            <MaterialCommunityIcons name="pill" size={24} color="#fff" />
          </View>
          <View style={styles.medicationInfo}>
            <Text style={styles.medicationName}>{medication.name}</Text>
            <Text style={styles.medicationDetails}>
              {medication.strength} • {medication.quantity}
            </Text>
          </View>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel="Edit medication"
          >
            <Ionicons name="pencil" size={16} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel="Delete medication"
          >
            <Ionicons name="trash" size={16} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Details */}
      <View style={styles.details}>
        {/* Frequency */}
        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Ionicons name="time-outline" size={16} color="#888" />
            <Text style={styles.detailText}>{medication.frequency}</Text>
          </View>
          <View style={styles.timeBadges}>
            {medication.times.map((time, index) => (
              <View key={index} style={styles.timeBadge}>
                <Text style={styles.timeBadgeText}>{time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Next Dose */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Next dose:</Text>
          <View style={[styles.badge, { backgroundColor: nextDoseColors.bg }]}>
            <Text style={[styles.badgeText, { color: nextDoseColors.text }]}>
              {medication.nextDose}
            </Text>
          </View>
        </View>

        {/* Adherence */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Adherence:</Text>
          <View style={[styles.badge, { backgroundColor: adherenceColors.bg }]}>
            <Text style={[styles.badgeText, { color: adherenceColors.text }]}>
              {medication.adherence}%
            </Text>
          </View>
        </View>

        {/* Purpose & Instructions */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Purpose: </Text>
            {medication.purpose}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Instructions: </Text>
            {medication.foodInstructions}
          </Text>
        </View>

        {/* View Details Button */}
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={onViewDetails}
          accessibilityRole="button"
          accessibilityLabel="View medication details and side effects"
        >
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#3498DB"
          />
          <Text style={styles.detailsButtonText}>
            View Details & Side Effects
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  medicationDetails: {
    fontSize: 14,
    color: "#666",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  details: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  timeBadges: {
    flexDirection: "row",
    gap: 4,
  },
  timeBadge: {
    borderWidth: 1,
    borderColor: "#D5D8DC",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeBadgeText: {
    fontSize: 12,
    color: "#333",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  infoSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  infoLabel: {
    fontWeight: "600",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#AED6F1",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 12,
    backgroundColor: "#EBF5FB",
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3498DB",
  },
});
