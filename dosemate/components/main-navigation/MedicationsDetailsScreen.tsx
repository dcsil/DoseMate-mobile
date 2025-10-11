import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Card from './Card';

interface MedicationDetailsScreenProps {
  visible: boolean;
  onClose: () => void;
  medication: {
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
  } | null;
}

export default function MedicationDetailsScreen({
  visible,
  onClose,
  medication
}: MedicationDetailsScreenProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sideEffects' | 'interactions'>('overview');

  if (!medication) return null;

  // Mock data - In real app, fetch from database/API

// const fetchMedicationDetails = async (medicationId: number) => {
// const response = await fetch(`/api/medications/${medicationId}/details`);
// return response.json();
// };

  const medicationDetails = {
    genericName: medication.name === 'Metformin' ? 'Metformin HCl' : 
                 medication.name === 'Lisinopril' ? 'Lisinopril' :
                 medication.name === 'Atorvastatin' ? 'Atorvastatin Calcium' : medication.name,
    drugClass: medication.name === 'Metformin' ? 'Antidiabetic' :
               medication.name === 'Lisinopril' ? 'ACE Inhibitor' :
               medication.name === 'Atorvastatin' ? 'Statin' : 'Medication',
    manufacturer: 'Generic Pharmaceutical',
    description: medication.purpose,
    
    usage: {
      instructions: [
        medication.foodInstructions,
        `Take ${medication.quantity}`,
        `${medication.frequency}`,
        'Swallow whole with water',
        'Do not crush or chew'
      ],
      missedDose: 'Take as soon as you remember. If it\'s almost time for your next dose, skip the missed dose. Do not double doses.',
      storage: 'Store at room temperature away from moisture and heat. Keep out of reach of children.'
    },

    sideEffects: {
      common: medication.name === 'Metformin' ? [
        'Nausea or vomiting',
        'Diarrhea',
        'Stomach upset',
        'Gas or bloating',
        'Loss of appetite',
        'Metallic taste in mouth'
      ] : medication.name === 'Lisinopril' ? [
        'Dizziness or lightheadedness',
        'Dry cough',
        'Headache',
        'Fatigue',
        'Nausea'
      ] : [
        'Muscle pain or weakness',
        'Headache',
        'Nausea',
        'Diarrhea',
        'Joint pain'
      ],
      serious: medication.name === 'Metformin' ? [
        'Lactic acidosis (rare but serious)',
        'Severe allergic reaction',
        'Low blood sugar (hypoglycemia)',
        'Vitamin B12 deficiency'
      ] : medication.name === 'Lisinopril' ? [
        'Swelling of face, lips, or throat',
        'Difficulty breathing',
        'Severe dizziness',
        'Fainting',
        'Signs of kidney problems'
      ] : [
        'Unexplained muscle pain',
        'Dark-colored urine',
        'Yellowing of skin or eyes',
        'Severe allergic reaction'
      ],
      whenToCall: 'Contact your doctor immediately if you experience any serious side effects or if common side effects persist or worsen.'
    },

    interactions: {
      drugs: medication.name === 'Metformin' ? [
        'Insulin or other diabetes medications',
        'Blood pressure medications',
        'Corticosteroids',
        'Diuretics (water pills)',
        'Heart or blood pressure medications'
      ] : medication.name === 'Lisinopril' ? [
        'Other blood pressure medications',
        'NSAIDs (ibuprofen, naproxen)',
        'Potassium supplements',
        'Diuretics',
        'Diabetes medications'
      ] : [
        'Other cholesterol medications',
        'Blood thinners',
        'Antibiotics',
        'Antifungal medications',
        'HIV medications'
      ],
      food: medication.name === 'Atorvastatin' ? [
        'Grapefruit and grapefruit juice',
        'Large amounts of alcohol'
      ] : [
        'Alcohol (limit intake)',
        medication.foodInstructions.includes('with food') ? 'Best taken with meals' : 'Can be taken with or without food'
      ],
      conditions: [
        'Kidney disease',
        'Liver disease',
        'Heart problems',
        'Pregnancy or breastfeeding',
        'Allergies to medications'
      ]
    },

    warnings: [
      'Do not stop taking this medication without consulting your doctor',
      'Inform your doctor of all medications you are taking',
      'Regular blood tests may be required',
      'Notify your doctor if you become pregnant',
      'Avoid alcohol or limit consumption while taking this medication'
    ]
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Basic Information */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Generic Name</Text>
          <Text style={styles.infoValue}>{medicationDetails.genericName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Drug Class</Text>
          <Text style={styles.infoValue}>{medicationDetails.drugClass}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Strength</Text>
          <Text style={styles.infoValue}>{medication.strength}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Manufacturer</Text>
          <Text style={styles.infoValue}>{medicationDetails.manufacturer}</Text>
        </View>
      </Card>

      {/* Current Schedule */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Your Schedule</Text>
        <View style={styles.scheduleInfo}>
          <View style={styles.scheduleRow}>
            <Ionicons name="calendar-outline" size={20} color="#E85D5B" />
            <Text style={styles.scheduleText}>{medication.frequency}</Text>
          </View>
          <View style={styles.scheduleRow}>
            <Ionicons name="time-outline" size={20} color="#E85D5B" />
            <Text style={styles.scheduleText}>{medication.times.join(', ')}</Text>
          </View>
          <View style={styles.scheduleRow}>
            <MaterialCommunityIcons name="pill" size={20} color="#E85D5B" />
            <Text style={styles.scheduleText}>{medication.quantity}</Text>
          </View>
          <View style={styles.scheduleRow}>
            <Ionicons name="restaurant-outline" size={20} color="#E85D5B" />
            <Text style={styles.scheduleText}>{medication.foodInstructions}</Text>
          </View>
        </View>
      </Card>

      {/* Usage Instructions */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>How to Use</Text>
        {medicationDetails.usage.instructions.map((instruction, index) => (
          <View key={index} style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{instruction}</Text>
          </View>
        ))}
      </Card>

      {/* Missed Dose */}
      <Card style={styles.section}>
        <View style={styles.warningHeader}>
          <Ionicons name="alert-circle" size={20} color="#F4C03A" />
          <Text style={styles.sectionTitle}>Missed Dose</Text>
        </View>
        <Text style={styles.bodyText}>{medicationDetails.usage.missedDose}</Text>
      </Card>

      {/* Storage */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Storage</Text>
        <Text style={styles.bodyText}>{medicationDetails.usage.storage}</Text>
      </Card>

      {/* Warnings */}
      <Card style={[styles.section, styles.lastSection]}>
        <View style={styles.warningHeader}>
          <Ionicons name="warning" size={20} color="#E85D5B" />
          <Text style={styles.sectionTitle}>Important Warnings</Text>
        </View>
        {medicationDetails.warnings.map((warning, index) => (
          <View key={index} style={styles.bulletPoint}>
            <View style={[styles.bullet, styles.warningBullet]} />
            <Text style={styles.bulletText}>{warning}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );

  const renderSideEffectsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Common Side Effects */}
      <Card style={styles.section}>
        <View style={styles.sideEffectHeader}>
          <Ionicons name="information-circle" size={24} color="#5BA4D6" />
          <Text style={styles.sectionTitle}>Common Side Effects</Text>
        </View>
        <Text style={styles.sideEffectSubtitle}>
          These side effects are usually mild and may go away as your body adjusts to the medication.
        </Text>
        {medicationDetails.sideEffects.common.map((effect, index) => (
          <View key={index} style={styles.sideEffectItem}>
            <View style={[styles.bullet, { backgroundColor: '#5BA4D6' }]} />
            <Text style={styles.bulletText}>{effect}</Text>
          </View>
        ))}
      </Card>

      {/* Serious Side Effects */}
      <Card style={styles.section}>
        <View style={styles.sideEffectHeader}>
          <Ionicons name="alert-circle" size={24} color="#E85D5B" />
          <Text style={styles.sectionTitle}>Serious Side Effects</Text>
        </View>
        <Text style={styles.sideEffectSubtitle}>
          Seek immediate medical attention if you experience any of these symptoms.
        </Text>
        {medicationDetails.sideEffects.serious.map((effect, index) => (
          <View key={index} style={styles.sideEffectItem}>
            <View style={[styles.bullet, { backgroundColor: '#E85D5B' }]} />
            <Text style={styles.bulletText}>{effect}</Text>
          </View>
        ))}
      </Card>

      {/* When to Call Doctor */}
      <Card style={[styles.section, styles.lastSection, styles.emergencyCard]}>
        <View style={styles.emergencyHeader}>
          <Ionicons name="call" size={24} color="#FFFFFF" />
          <Text style={styles.emergencyTitle}>When to Contact Your Doctor</Text>
        </View>
        <Text style={styles.emergencyText}>{medicationDetails.sideEffects.whenToCall}</Text>
      </Card>
    </ScrollView>
  );

  const renderInteractionsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Drug Interactions */}
      <Card style={styles.section}>
        <View style={styles.interactionHeader}>
          <MaterialCommunityIcons name="pill" size={24} color="#E85D5B" />
          <Text style={styles.sectionTitle}>Drug Interactions</Text>
        </View>
        <Text style={styles.sideEffectSubtitle}>
          These medications may interact with {medication.name}. Always inform your doctor of all medications you take.
        </Text>
        {medicationDetails.interactions.drugs.map((drug, index) => (
          <View key={index} style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{drug}</Text>
          </View>
        ))}
      </Card>

      {/* Food Interactions */}
      <Card style={styles.section}>
        <View style={styles.interactionHeader}>
          <Ionicons name="restaurant" size={24} color="#F4C03A" />
          <Text style={styles.sectionTitle}>Food & Drink Interactions</Text>
        </View>
        {medicationDetails.interactions.food.map((food, index) => (
          <View key={index} style={styles.bulletPoint}>
            <View style={[styles.bullet, { backgroundColor: '#F4C03A' }]} />
            <Text style={styles.bulletText}>{food}</Text>
          </View>
        ))}
      </Card>

      {/* Medical Conditions */}
      <Card style={[styles.section, styles.lastSection]}>
        <View style={styles.interactionHeader}>
          <Ionicons name="medical" size={24} color="#5BA4D6" />
          <Text style={styles.sectionTitle}>Medical Conditions</Text>
        </View>
        <Text style={styles.sideEffectSubtitle}>
          Inform your doctor if you have any of these conditions:
        </Text>
        {medicationDetails.interactions.conditions.map((condition, index) => (
          <View key={index} style={styles.bulletPoint}>
            <View style={[styles.bullet, { backgroundColor: '#5BA4D6' }]} />
            <Text style={styles.bulletText}>{condition}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );

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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#2C2C2C" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={[styles.medicationIcon, { backgroundColor: `${medication.color}20` }]}>
              <MaterialCommunityIcons name="pill" size={32} color={medication.color} />
            </View>
            <Text style={styles.medicationName}>{medication.name}</Text>
            <Text style={styles.medicationStrength}>{medication.strength}</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'overview' && styles.tabButtonActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'overview' && styles.tabButtonTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'sideEffects' && styles.tabButtonActive]}
            onPress={() => setActiveTab('sideEffects')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'sideEffects' && styles.tabButtonTextActive]}>
              Side Effects
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'interactions' && styles.tabButtonActive]}
            onPress={() => setActiveTab('interactions')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'interactions' && styles.tabButtonTextActive]}>
              Interactions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'sideEffects' && renderSideEffectsTab()}
        {activeTab === 'interactions' && renderInteractionsTab()}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color="#999" />
          <Text style={styles.disclaimerText}>
            This information is for educational purposes only. Always consult your healthcare provider.
          </Text>
        </View>
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
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 8,
  },
  medicationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  medicationName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  medicationStrength: {
    fontSize: 16,
    color: '#777',
    fontWeight: '500',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#E85D5B',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  tabButtonTextActive: {
    color: '#E85D5B',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 16,
    padding: 20,
  },
  lastSection: {
    marginBottom: 80,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 16,
    letterSpacing: -0.3,
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoLabel: {
    fontSize: 15,
    color: '#777',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#2C2C2C',
    fontWeight: '600',
  },
  scheduleInfo: {
    gap: 16,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scheduleText: {
    fontSize: 15,
    color: '#2C2C2C',
    flex: 1,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E85D5B',
    marginTop: 7,
    marginRight: 12,
  },
  warningBullet: {
    backgroundColor: '#E85D5B',
  },
  bulletText: {
    fontSize: 15,
    color: '#2C2C2C',
    flex: 1,
    lineHeight: 22,
  },
  bodyText: {
    fontSize: 15,
    color: '#2C2C2C',
    lineHeight: 22,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sideEffectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sideEffectSubtitle: {
    fontSize: 14,
    color: '#777',
    marginBottom: 16,
    lineHeight: 20,
  },
  sideEffectItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  emergencyCard: {
    backgroundColor: '#E85D5B',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  emergencyText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  interactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  disclaimer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#999',
    flex: 1,
    lineHeight: 16,
  },
});