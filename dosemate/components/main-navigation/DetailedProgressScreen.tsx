import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/main-navigation/Card';
import OverviewChartCard from '@/components/main-navigation/OverviewChartCard';

// const { width } = Dimensions.get('window');

interface DetailedProgressScreenProps {
  visible: boolean;
  onClose: () => void;
}

export default function DetailedProgressScreen({
  visible,
  onClose
}: DetailedProgressScreenProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  const adherenceData = [
    { day: 'Mon', adherence: 100 },
    { day: 'Tue', adherence: 75 },
    { day: 'Wed', adherence: 100 },
    { day: 'Thu', adherence: 100 },
    { day: 'Fri', adherence: 50 },
    { day: 'Sat', adherence: 100 },
    { day: 'Sun', adherence: 100 }
  ];

  const medicationBreakdown = [
    { name: 'Metformin', value: 95, color: '#3B82F6' },
    { name: 'Lisinopril', value: 88, color: '#10B981' },
    { name: 'Atorvastatin', value: 92, color: '#8B5CF6' },
    { name: 'Aspirin', value: 97, color: '#F59E0B' }
  ];

  const weeklyStats = {
    overall: 92,
    streak: 5,
    total: 28,
    taken: 26,
    missed: 2
  };

  const achievements = [
    { id: 1, title: '7-Day Streak', description: 'Took medication 7 days in a row', achieved: true, icon: '🔥' },
    { id: 2, title: 'Perfect Week', description: '100% adherence for a week', achieved: false, icon: '⭐' },
    { id: 3, title: 'Early Bird', description: 'Took morning meds on time 10 times', achieved: true, icon: '🌅' },
    { id: 4, title: 'Consistency', description: '90%+ adherence for a month', achieved: true, icon: '🎯' }
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2C2C2C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Progress Dashboard</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={22} color="#E85D5B" />
          </TouchableOpacity>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          <View style={styles.timeRangeButtons}>
            {(['week', 'month', 'year'] as const).map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeButton,
                  timeRange === range && styles.timeRangeButtonActive
                ]}
                onPress={() => setTimeRange(range)}
              >
                <Text
                  style={[
                    styles.timeRangeButtonText,
                    timeRange === range && styles.timeRangeButtonTextActive
                  ]}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Overview Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardBlue]}>
              <View style={styles.statCardHeader}>
                <Ionicons name="trending-up" size={32} color="rgba(255,255,255,0.8)" />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>This Week</Text>
                </View>
              </View>
              <Text style={styles.statNumber}>{weeklyStats.overall}%</Text>
              <Text style={styles.statLabel}>Overall Adherence</Text>
            </View>

            <View style={[styles.statCard, styles.statCardGreen]}>
              <View style={styles.statCardHeader}>
                <Ionicons name="trophy" size={32} color="rgba(255,255,255,0.8)" />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Streak</Text>
                </View>
              </View>
              <Text style={styles.statNumber}>{weeklyStats.streak}</Text>
              <Text style={styles.statLabel}>Days in a row</Text>
            </View>
          </View>

          {/* Weekly Progress Ring */}
          <Card style={styles.progressCard}>
            <Text style={styles.cardTitle}>{"This Week's Progress"}</Text>
            <View style={styles.progressRing}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressPercent}>{weeklyStats.overall}%</Text>
                <Text style={styles.progressLabel}>Complete</Text>
              </View>
            </View>

            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text style={[styles.progressStatNumber, { color: '#3B82F6' }]}>
                  {weeklyStats.taken}
                </Text>
                <Text style={styles.progressStatLabel}>Taken</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={[styles.progressStatNumber, { color: '#EF4444' }]}>
                  {weeklyStats.missed}
                </Text>
                <Text style={styles.progressStatLabel}>Missed</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={[styles.progressStatNumber, { color: '#2C2C2C' }]}>
                  {weeklyStats.total}
                </Text>
                <Text style={styles.progressStatLabel}>Total</Text>
              </View>
            </View>
          </Card>

          {/* Daily Adherence Chart */}
          <OverviewChartCard
            data={adherenceData.map((item) => ({ day: item.day, score: item.adherence }))} 
            timeRange="week"
            showIcon={false}
            showDetailsButton={false}
          />

          {/* Medication Breakdown */}
          <Card style={styles.medicationCard}>
            <Text style={styles.cardTitle}>Medication Adherence</Text>
            <View style={styles.medicationList}>
              {medicationBreakdown.map((med, index) => (
                <View key={index} style={styles.medicationItem}>
                  <View style={styles.medicationInfo}>
                    <View
                      style={[styles.medicationDot, { backgroundColor: med.color }]}
                    />
                    <Text style={styles.medicationName}>{med.name}</Text>
                  </View>
                  <View style={styles.medicationProgress}>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${med.value}%`, backgroundColor: med.color }
                        ]}
                      />
                    </View>
                    <Text style={styles.medicationPercent}>{med.value}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* Achievements */}
          <Card style={styles.achievementsCard}>
            <Text style={styles.cardTitle}>Achievements</Text>
            <View style={styles.achievementsGrid}>
              {achievements.map((achievement) => (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementItem,
                    achievement.achieved ? styles.achievementAchieved : styles.achievementLocked
                  ]}
                >
                  <View style={styles.achievementHeader}>
                    <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                    <View
                      style={[
                        styles.achievementBadge,
                        achievement.achieved ? styles.achievementBadgeGreen : styles.achievementBadgeGray
                      ]}
                    >
                      <Text
                        style={[
                          styles.achievementBadgeText,
                          achievement.achieved ? styles.achievementBadgeTextGreen : styles.achievementBadgeTextGray
                        ]}
                      >
                        {achievement.achieved ? 'Achieved' : 'Locked'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Export & Share */}
          <Card style={styles.exportCard}>
            <Text style={styles.cardTitle}>Share Your Progress</Text>
            <Text style={styles.exportDescription}>
              Share your adherence report with your healthcare provider to help optimize your treatment.
            </Text>
            <View style={styles.exportButtons}>
              <TouchableOpacity style={styles.exportButton}>
                <Ionicons name="download-outline" size={20} color="#2C2C2C" />
                <Text style={styles.exportButtonText}>Export PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.exportButton}>
                <Ionicons name="share-outline" size={20} color="#2C2C2C" />
                <Text style={styles.exportButtonText}>Share Report</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Motivational Message */}
          <View style={styles.motivationalCard}>
            <Ionicons name="trophy" size={48} color="#F59E0B" style={styles.motivationalIcon} />
            <Text style={styles.motivationalTitle}>Great job this week!</Text>
            <Text style={styles.motivationalMessage}>
              {"You've maintained a {weeklyStats.overall}% adherence rate. Keep up the excellent work!"}
            </Text>
            <View style={styles.motivationalGoal}>
              <Ionicons name="flag-outline" size={16} color="#888" />
              <Text style={styles.motivationalGoalText}>Goal: 90% adherence rate</Text>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2C',
    letterSpacing: -0.3,
  },
  shareButton: {
    padding: 8,
  },
  timeRangeContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  timeRangeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeRangeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  timeRangeButtonActive: {
    backgroundColor: '#E85D5B',
    borderColor: '#E85D5B',
  },
  timeRangeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  timeRangeButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  statCardBlue: {
    backgroundColor: '#3B82F6',
  },
  statCardGreen: {
    backgroundColor: '#10B981',
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  progressCard: {
    marginTop: 20,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  progressRing: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  progressCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#F0FFF4',
    borderWidth: 12,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
  },
  progressLabel: {
    fontSize: 12,
    color: '#888',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  progressStatLabel: {
    fontSize: 14,
    color: '#888',
  },
  chartCard: {
    marginTop: 20,
    padding: 20,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 200,
    paddingTop: 20,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarContainer: {
    width: '80%',
    height: 160,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 6,
  },
  chartLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
  medicationCard: {
    marginTop: 20,
    padding: 20,
  },
  medicationList: {
    gap: 16,
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  medicationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  medicationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  medicationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  medicationProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarContainer: {
    width: 96,
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  medicationPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2C',
    width: 48,
    textAlign: 'right',
  },
  achievementsCard: {
    marginTop: 20,
    padding: 20,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  achievementItem: {
    width: '45%',
    padding: 10,
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 140,
  },
  achievementAchieved: {
    backgroundColor: '#F0FFF4',
    borderColor: '#86EFAC',
  },
  achievementLocked: {
    backgroundColor: '#F9F9F9',
    borderColor: '#E5E5E5',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    width: '100%',
  },
  achievementIcon: {
    fontSize: 20,
  },
  achievementBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  achievementBadgeGreen: {
    backgroundColor: '#D1FAE5',
  },
  achievementBadgeGray: {
    backgroundColor: '#E5E5E5',
  },
  achievementBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  achievementBadgeTextGreen: {
    color: '#059669',
  },
  achievementBadgeTextGray: {
    color: '#6B7280',
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 20,
  },
  exportCard: {
    marginTop: 20,
    padding: 20,
  },
  exportDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
    lineHeight: 20,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  motivationalCard: {
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#FFFBF0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  motivationalIcon: {
    marginBottom: 12,
  },
  motivationalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  motivationalMessage: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  motivationalGoal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  motivationalGoalText: {
    fontSize: 14,
    color: '#888',
  },
  bottomSpacer: {
    height: 40,
  },
});