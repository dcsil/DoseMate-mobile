import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import React, { useState } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Card from './Card';

interface SavedMedication {
  id: string;
  medicineName: string;
  genericName?: string;
  strength: string;
  quantity: string;
  frequency: string;
  times: string[];
  asNeeded: boolean;
  foodInstructions: string;
  addedDate: string;
}

interface MedicationListScreenProps {
  onAddNew: () => void;
}

export default function MedicationListScreen({ onAddNew }: MedicationListScreenProps) {
  // Sample data - replace with actual data from your backend/storage
  const [medications, setMedications] = useState<SavedMedication[]>([
    {
      id: '1',
      medicineName: 'Metformin',
      genericName: 'Metformin HCl',
      strength: '500mg',
      quantity: '1 tablet',
      frequency: 'Twice daily',
      times: ['8:00 AM', '8:00 PM'],
      asNeeded: false,
      foodInstructions: 'Take with food',
      addedDate: '2024-01-15'
    },
    {
      id: '2',
      medicineName: 'Lisinopril',
      genericName: 'Lisinopril',
      strength: '10mg',
      quantity: '1 tablet',
      frequency: 'Once daily',
      times: ['9:00 AM'],
      asNeeded: false,
      foodInstructions: 'No preference',
      addedDate: '2024-01-10'
    },
    {
      id: '3',
      medicineName: 'Ibuprofen',
      genericName: 'Ibuprofen',
      strength: '200mg',
      quantity: '1 tablet',
      frequency: 'As needed',
      times: [],
      asNeeded: true,
      foodInstructions: 'Take with food',
      addedDate: '2024-01-05'
    }
  ]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Medication',
      `Are you sure you want to delete ${name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMedications(medications.filter(med => med.id !== id));
            // Add your API call here to delete from backend
            console.log('Deleting medication:', id);
          }
        }
      ]
    );
  };

  const getFrequencyIcon = (frequency: string) => {
    if (frequency === 'Once daily') return '1';
    if (frequency === 'Twice daily') return '2';
    if (frequency === 'Three times daily') return '3';
    return '?';
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons name="pill-off" size={64} color="#CCC" />
      </View>
      <Text style={styles.emptyTitle}>No Medications Added</Text>
      <Text style={styles.emptySubtitle}>
        Start by adding your first medication to keep track of your prescriptions
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={onAddNew}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Medication</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Medications</Text>
          <Text style={styles.headerSubtitle}>{medications.length} active medication{medications.length !== 1 ? 's' : ''}</Text>
        </View>
        {medications.length > 0 && (
          <TouchableOpacity style={styles.addIconButton} onPress={onAddNew}>
            <Ionicons name="add" size={28} color="#E85D5B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {medications.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.medicationsList}>
            {medications.map((med) => (
              <Card key={med.id} style={styles.medicationCard}>
                <View style={styles.cardContent}>
                  {/* Left Section - Icon and Info */}
                  <View style={styles.leftSection}>
                    <View style={styles.medIconContainer}>
                      <MaterialCommunityIcons name="pill" size={28} color="#E85D5B" />
                      {!med.asNeeded && (
                        <View style={styles.frequencyBadge}>
                          <Text style={styles.frequencyBadgeText}>
                            {getFrequencyIcon(med.frequency)}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.medDetails}>
                      <Text style={styles.medName}>{med.medicineName}</Text>
                      {med.genericName && (
                        <Text style={styles.medGeneric}>{med.genericName}</Text>
                      )}
                      <View style={styles.dosageContainer}>
                        <Text style={styles.dosageText}>
                          {med.strength} • {med.quantity}
                        </Text>
                      </View>
                      
                      {/* Schedule Info */}
                      <View style={styles.scheduleInfo}>
                        <Ionicons name="time-outline" size={14} color="#777" />
                        <Text style={styles.scheduleText}>
                          {med.asNeeded ? 'As needed' : `${med.frequency} - ${med.times.join(', ')}`}
                        </Text>
                      </View>
                      
                      {/* Food Instructions */}
                      {med.foodInstructions && (
                        <View style={styles.foodInfo}>
                          <Ionicons name="restaurant-outline" size={14} color="#777" />
                          <Text style={styles.foodText}>{med.foodInstructions}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Right Section - Delete Button */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(med.id, med.medicineName)}
                  >
                    <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>

          {/* Add Button at Bottom */}
          <TouchableOpacity style={styles.bottomAddButton} onPress={onAddNew}>
            <Ionicons name="add-circle" size={24} color="#E85D5B" />
            <Text style={styles.bottomAddButtonText}>Add Another Medication</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
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
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C2C2C',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  addIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  medicationsList: {
    padding: 20,
  },
  medicationCard: {
    marginBottom: 16,
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    flex: 1,
  },
  medIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  frequencyBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  frequencyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  medDetails: {
    flex: 1,
  },
  medName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  medGeneric: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  dosageContainer: {
    marginBottom: 8,
  },
  dosageText: {
    fontSize: 14,
    color: '#E85D5B',
    fontWeight: '500',
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scheduleText: {
    fontSize: 13,
    color: '#777',
    marginLeft: 6,
    flex: 1,
  },
  foodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodText: {
    fontSize: 13,
    color: '#777',
    marginLeft: 6,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  bottomAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD4D4',
    borderStyle: 'dashed',
    marginHorizontal: 20,
    marginBottom: 40,
  },
  bottomAddButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#E85D5B',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: '#E85D5B',
    borderRadius: 14,
    paddingHorizontal: 32,
    shadowColor: '#E85D5B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});