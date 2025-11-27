import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "@/components/main-navigation/Card";
import { AdaptationSuggestion } from "./tabs/types";

interface AdaptationSuggestionModalProps {
  visible: boolean;
  suggestion: AdaptationSuggestion | null;
  loading: boolean;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
  onClose: () => void;
}

export default function AdaptationSuggestionModal({
  visible,
  suggestion,
  loading,
  onAccept,
  onReject,
  onClose,
}: AdaptationSuggestionModalProps) {
  if (!suggestion) return null;

  const confidenceColor =
    suggestion.confidence_score >= 80
      ? "#4CAF50"
      : suggestion.confidence_score >= 60
        ? "#FF9800"
        : "#E85D5B";

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Card style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="bulb" size={32} color="#FF9800" />
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              disabled={loading}
            >
              <Ionicons name="close" size={24} color="#2C2C2C" />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.title}>Smart Timing Suggestion</Text>
          <Text style={styles.subtitle}>
            We noticed a pattern with your {suggestion.medication_name}{" "}
            reminders
          </Text>

          {/* Medication Info */}
          <View style={styles.medicationInfo}>
            <Text style={styles.medicationName}>
              {suggestion.medication_name}
            </Text>
          </View>

          {/* Time Comparison */}
          <View style={styles.timeComparison}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Current Reminder</Text>
              <View style={styles.timeBadge}>
                <Ionicons name="time-outline" size={20} color="#888" />
                <Text style={styles.timeText}>{suggestion.current_time}</Text>
              </View>
            </View>

            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={24} color="#4CAF50" />
            </View>

            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Suggested Time</Text>
              <View style={[styles.timeBadge, styles.suggestedTimeBadge]}>
                <Ionicons name="time" size={20} color="#4CAF50" />
                <Text style={[styles.timeText, styles.suggestedTimeText]}>
                  {suggestion.suggested_time}
                </Text>
              </View>
            </View>
          </View>

          {/* Insight */}
          <View style={styles.insightBox}>
            <Ionicons
              name="information-circle"
              size={20}
              color="#5BA4D6"
              style={styles.insightIcon}
            />
            <Text style={styles.insightText}>
              You typically take this medication around{" "}
              <Text style={styles.insightHighlight}>
                {suggestion.median_actual_time}
              </Text>
              . You&apos;ve snoozed or delayed it{" "}
              <Text style={styles.insightHighlight}>
                {suggestion.snooze_count} out of {suggestion.total_doses}
              </Text>{" "}
              times recently.
            </Text>
          </View>

          {/* Confidence Score */}
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence</Text>
            <View style={styles.confidenceBar}>
              <View
                style={[
                  styles.confidenceFill,
                  {
                    width: `${suggestion.confidence_score}%`,
                    backgroundColor: confidenceColor,
                  },
                ]}
              />
            </View>
            <Text style={[styles.confidenceScore, { color: confidenceColor }]}>
              {suggestion.confidence_score}%
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={onReject}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#2C2C2C" />
              ) : (
                <>
                  <Ionicons name="close-circle" size={20} color="#2C2C2C" />
                  <Text style={styles.rejectButtonText}>Not Now</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={onAccept}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.acceptButtonText}>Update Time</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF4E6",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: "#777",
    marginBottom: 20,
    lineHeight: 22,
  },
  medicationInfo: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2C",
    textAlign: "center",
  },
  timeComparison: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  timeBlock: {
    flex: 1,
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
    fontWeight: "500",
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  suggestedTimeBadge: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C2C2C",
  },
  suggestedTimeText: {
    color: "#4CAF50",
  },
  arrowContainer: {
    marginHorizontal: 8,
  },
  insightBox: {
    flexDirection: "row",
    backgroundColor: "#EBF5FB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#5BA4D6",
  },
  insightIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: "#2C2C2C",
    lineHeight: 20,
  },
  insightHighlight: {
    fontWeight: "700",
    color: "#5BA4D6",
  },
  confidenceContainer: {
    marginBottom: 24,
  },
  confidenceLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
    fontWeight: "500",
  },
  confidenceBar: {
    height: 8,
    backgroundColor: "#E5E5E5",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  confidenceFill: {
    height: "100%",
    borderRadius: 4,
  },
  confidenceScore: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  rejectButton: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  rejectButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C2C2C",
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
