import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import Card from './Card';

interface AddMedicationScreenProps {
  visible: boolean;
  onClose: () => void;
}

interface MedicationDetails {
  strength: string;
  quantity: string;
  frequency: string;
  times: string[];
  asNeeded: boolean;
  foodInstructions: string;
}

export default function AddMedicationScreen({ visible, onClose }: AddMedicationScreenProps) {
  const [step, setStep] = useState(1); // 1: Search, 2: Details, 3: Schedule
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMed, setSelectedMed] = useState<any>(null);
  const [medDetails, setMedDetails] = useState<MedicationDetails>({
    strength: '',
    quantity: '',
    frequency: '',
    times: [],
    asNeeded: false,
    foodInstructions: ''
  });

  // Dropdown states
  const [showStrengthPicker, setShowStrengthPicker] = useState(false);
  const [showQuantityPicker, setShowQuantityPicker] = useState(false);
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);

  const mockMedications = [
    {
      id: 1,
      name: 'Metformin',
      genericName: 'Metformin HCl',
      form: 'Tablet',
      purpose: 'Diabetes medication',
      availableStrengths: ['500mg', '850mg', '1000mg'],
      availableQuantities: ['1 tablet', '2 tablets']
    },
    {
      id: 2,
      name: 'Lisinopril',
      genericName: 'Lisinopril',
      form: 'Tablet',
      purpose: 'Blood pressure medication',
      availableStrengths: ['5mg', '10mg', '20mg', '40mg'],
      availableQuantities: ['1 tablet', '1/2 tablet']
    },
    {
      id: 3,
      name: 'Atorvastatin',
      genericName: 'Atorvastatin Calcium',
      form: 'Tablet',
      purpose: 'Cholesterol medication',
      availableStrengths: ['10mg', '20mg', '40mg', '80mg'],
      availableQuantities: ['1 tablet']
    },
    {
      id: 4,
      name: 'Levothyroxine',
      genericName: 'Levothyroxine Sodium',
      form: 'Tablet',
      purpose: 'Thyroid medication',
      availableStrengths: ['25mcg', '50mcg', '75mcg', '100mcg', '125mcg', '150mcg'],
      availableQuantities: ['1 tablet']
    },
    {
      id: 5,
      name: 'Amlodipine',
      genericName: 'Amlodipine Besylate',
      form: 'Tablet',
      purpose: 'Blood pressure medication',
      availableStrengths: ['2.5mg', '5mg', '10mg'],
      availableQuantities: ['1 tablet', '1/2 tablet']
    },
    {
      id: 6,
      name: 'Omeprazole',
      genericName: 'Omeprazole',
      form: 'Capsule',
      purpose: 'Acid reflux medication',
      availableStrengths: ['10mg', '20mg', '40mg'],
      availableQuantities: ['1 capsule', '2 capsules']
    }
  ];

  const filteredMeds = mockMedications.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.genericName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBack = () => {
    if (step === 1 || step === 3) {
      setStep(1);
      setSearchQuery('');
      setSelectedMed(null);
      setMedDetails({
        strength: '',
        quantity: '',
        frequency: '',
        times: [],
        asNeeded: false,
        foodInstructions: ''
      });
      onClose();
    } else {
      setStep(step - 1);
    }
  };

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving medication:', { selectedMed, medDetails });
    handleBack(); // Reset and close
  };

  const renderSearchStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Add Medication</Text>
        <Text style={styles.stepSubtitle}>Search for your medication or scan the barcode</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search medication name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Barcode Scanner */}
      <TouchableOpacity style={styles.scanButton}>
        <MaterialCommunityIcons name="barcode-scan" size={24} color="#E85D5B" />
        <Text style={styles.scanButtonText}>Scan Barcode</Text>
      </TouchableOpacity>

      {/* Results */}
      {searchQuery && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>Search Results</Text>
          {filteredMeds.map((med) => (
            <TouchableOpacity
              key={med.id}
              onPress={() => {
                setSelectedMed(med);
                setStep(2);
              }}
            >
              <Card style={styles.medicationCard}>
                <View style={styles.medCardContent}>
                  <View style={styles.medIcon}>
                    <MaterialCommunityIcons name="pill" size={24} color="#E85D5B" />
                  </View>
                  <View style={styles.medInfo}>
                    <Text style={styles.medName}>{med.name}</Text>
                    <Text style={styles.medGeneric}>{med.genericName} • {med.form}</Text>
                    <Text style={styles.medPurpose}>{med.purpose}</Text>
                  </View>
                  <Ionicons name="add-circle" size={24} color="#E85D5B" />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderDetailsStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <View style={styles.stepHeader}>
        <View style={styles.selectedMedIcon}>
          <MaterialCommunityIcons name="pill" size={32} color="#E85D5B" />
        </View>
        <Text style={styles.stepTitle}>{selectedMed?.name}</Text>
        <Text style={styles.stepSubtitle}>{selectedMed?.genericName}</Text>
      </View>

      <View style={styles.formSection}>
        {/* Strength */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Strength/Dosage</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowStrengthPicker(!showStrengthPicker)}
          >
            <Text style={medDetails.strength ? styles.selectButtonTextActive : styles.selectButtonText}>
              {medDetails.strength || 'Select strength'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
          {showStrengthPicker && (
            <View style={styles.picker}>
              {selectedMed?.availableStrengths.map((option: string) => (
                <TouchableOpacity
                  key={option}
                  style={styles.pickerOption}
                  onPress={() => {
                    setMedDetails(prev => ({ ...prev, strength: option }));
                    setShowStrengthPicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quantity */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Quantity per dose</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowQuantityPicker(!showQuantityPicker)}
          >
            <Text style={medDetails.quantity ? styles.selectButtonTextActive : styles.selectButtonText}>
              {medDetails.quantity || 'How many pills?'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
          {showQuantityPicker && (
            <View style={styles.picker}>
              {selectedMed?.availableQuantities.map((option: string) => (
                <TouchableOpacity
                  key={option}
                  style={styles.pickerOption}
                  onPress={() => {
                    setMedDetails(prev => ({ ...prev, quantity: option }));
                    setShowQuantityPicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Food Instructions */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Food Instructions</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowFoodPicker(!showFoodPicker)}
          >
            <Text style={medDetails.foodInstructions ? styles.selectButtonTextActive : styles.selectButtonText}>
              {medDetails.foodInstructions || 'With or without food?'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
          {showFoodPicker && (
            <View style={styles.picker}>
              {['Take with food', 'Take without food', 'No preference'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.pickerOption}
                  onPress={() => {
                    setMedDetails(prev => ({ ...prev, foodInstructions: option }));
                    setShowFoodPicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, (!medDetails.strength || !medDetails.quantity) && styles.primaryButtonDisabled]}
        onPress={() => setStep(3)}
        disabled={!medDetails.strength || !medDetails.quantity}
      >
        <Text style={styles.primaryButtonText}>Continue to Schedule</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderScheduleStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <View style={styles.stepHeader}>
        <View style={styles.scheduleIcon}>
          <Ionicons name="time" size={32} color="#4CAF50" />
        </View>
        <Text style={styles.stepTitle}>Set Reminder Schedule</Text>
        <Text style={styles.stepSubtitle}>When should you take this medication?</Text>
      </View>

      <View style={styles.formSection}>
        {/* Frequency */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>How often?</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowFrequencyPicker(!showFrequencyPicker)}
          >
            <Text style={medDetails.frequency ? styles.selectButtonTextActive : styles.selectButtonText}>
              {medDetails.frequency || 'Select frequency'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
          {showFrequencyPicker && (
            <View style={styles.picker}>
              {['Once daily', 'Twice daily', 'Three times daily', 'As needed'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.pickerOption}
                  onPress={() => {
                    setMedDetails(prev => ({ ...prev, frequency: option }));
                    setShowFrequencyPicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Time Inputs */}
        {medDetails.frequency && medDetails.frequency !== 'As needed' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Reminder times</Text>
            <View style={styles.timeInputsContainer}>
              {medDetails.frequency === 'Once daily' && (
                <TextInput
                  style={styles.timeInput}
                  placeholder="8:00 AM"
                  placeholderTextColor="#999"
                  value={medDetails.times[0] || ''}
                  onChangeText={(text) => {
                    const newTimes = [...medDetails.times];
                    newTimes[0] = text;
                    setMedDetails(prev => ({ ...prev, times: newTimes }));
                  }}
                />
              )}
              {medDetails.frequency === 'Twice daily' && (
                <>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="8:00 AM"
                    placeholderTextColor="#999"
                    value={medDetails.times[0] || ''}
                    onChangeText={(text) => {
                      const newTimes = [...medDetails.times];
                      newTimes[0] = text;
                      setMedDetails(prev => ({ ...prev, times: newTimes }));
                    }}
                  />
                  <TextInput
                    style={styles.timeInput}
                    placeholder="8:00 PM"
                    placeholderTextColor="#999"
                    value={medDetails.times[1] || ''}
                    onChangeText={(text) => {
                      const newTimes = [...medDetails.times];
                      newTimes[1] = text;
                      setMedDetails(prev => ({ ...prev, times: newTimes }));
                    }}
                  />
                </>
              )}
              {medDetails.frequency === 'Three times daily' && (
                <>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="8:00 AM"
                    placeholderTextColor="#999"
                    value={medDetails.times[0] || ''}
                    onChangeText={(text) => {
                      const newTimes = [...medDetails.times];
                      newTimes[0] = text;
                      setMedDetails(prev => ({ ...prev, times: newTimes }));
                    }}
                  />
                  <TextInput
                    style={styles.timeInput}
                    placeholder="2:00 PM"
                    placeholderTextColor="#999"
                    value={medDetails.times[1] || ''}
                    onChangeText={(text) => {
                      const newTimes = [...medDetails.times];
                      newTimes[1] = text;
                      setMedDetails(prev => ({ ...prev, times: newTimes }));
                    }}
                  />
                  <TextInput
                    style={styles.timeInput}
                    placeholder="8:00 PM"
                    placeholderTextColor="#999"
                    value={medDetails.times[2] || ''}
                    onChangeText={(text) => {
                      const newTimes = [...medDetails.times];
                      newTimes[2] = text;
                      setMedDetails(prev => ({ ...prev, times: newTimes }));
                    }}
                  />
                </>
              )}
            </View>
          </View>
        )}

        {/* As Needed Toggle */}
        <TouchableOpacity
          style={styles.toggleContainer}
          onPress={() => setMedDetails(prev => ({ ...prev, asNeeded: !prev.asNeeded }))}
        >
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Take as needed only</Text>
            <Text style={styles.toggleSubtitle}>No regular schedule</Text>
          </View>
          <View style={[styles.switch, medDetails.asNeeded && styles.switchActive]}>
            <View style={[styles.switchThumb, medDetails.asNeeded && styles.switchThumbActive]} />
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.primaryButtonText}>Save Medication</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleBack}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2C2C2C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 1 ? 'Add Medication' : step === 2 ? 'Medication Details' : 'Set Schedule'}
          </Text>
          <Text style={styles.stepIndicator}>{step}/3</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
          </View>
        </View>

        {/* Content */}
        {step === 1 && renderSearchStep()}
        {step === 2 && renderDetailsStep()}
        {step === 3 && renderScheduleStep()}
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
    flex: 1,
    marginLeft: 12,
  },
  stepIndicator: {
    fontSize: 14,
    color: '#999',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
  },
  selectedMedIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scheduleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FFF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 1,
  },
  searchInput: {
    height: 56,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD4D4',
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  scanButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#E85D5B',
  },
  resultsSection: {
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 12,
  },
  medicationCard: {
    marginBottom: 12,
    padding: 16,
  },
  medCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  medGeneric: {
    fontSize: 13,
    color: '#777',
    marginBottom: 2,
  },
  medPurpose: {
    fontSize: 12,
    color: '#E85D5B',
  },
  formSection: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 12,
  },
  selectButton: {
    height: 56,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#999',
  },
  selectButtonTextActive: {
    fontSize: 16,
    color: '#2C2C2C',
  },
  picker: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pickerOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#2C2C2C',
  },
  timeInputsContainer: {
    gap: 12,
  },
  timeInput: {
    height: 56,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    paddingHorizontal: 16,
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginTop: 8,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 13,
    color: '#777',
  },
  switch: {
    width: 51,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: '#4CAF50',
  },
  switchThumb: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  primaryButton: {
    height: 56,
    backgroundColor: '#E85D5B',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 100,
    shadowColor: '#E85D5B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  saveButton: {
    height: 56,
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 100,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
});