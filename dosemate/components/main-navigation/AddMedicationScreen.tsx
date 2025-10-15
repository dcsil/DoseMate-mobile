import { View, TextInput, FlatList, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet, Modal } from "react-native";
import React, { useState, useEffect } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Card from './Card';
import MedicineOCRScanner from "./OCR";
import MedicationListScreen from "./MedicationList";

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

type MedicineDetails = {
  brand_name?: string;
  purpose?: string;
  dosage?: string;
  generic_name?: string;
  manufacturer?: string;
  indications?: string;
};

import { useNavigation } from '@react-navigation/native';

export default function AddMedicationScreen({ visible, onClose }: AddMedicationScreenProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);

  const [step, setStep] = useState(1); // 1: Search, 2: Info Display, 3: Details, 4: Schedule
  const [medDetails, setMedDetails] = useState<MedicationDetails>({
    strength: '',
    quantity: '',
    frequency: '',
    times: [],
    asNeeded: false,
    foodInstructions: ''
  });
  const [scannerVisible, setScannerVisible] = useState(false);

  // Dropdown states
  const [showStrengthPicker, setShowStrengthPicker] = useState(false);
  const [showQuantityPicker, setShowQuantityPicker] = useState(false);
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (text: string) => {
    if (text.length < 1) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/medicines/autocomplete?prefix=${text}`);
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.log("Error fetching suggestions:", err);
      setSuggestions([]);
    }
  };

  
  useEffect(() => {
    const delay = setTimeout(() => fetchSuggestions(query), 300);
    return () => clearTimeout(delay);
  }, [query]);


  const handleSelect = async (item: string) => {
    setQuery(item);
    setSuggestions([]);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/medicines/search?query=${item}`);
      const data = await res.json();
      console.log("Fetched medicine details:", data);
      setSelectedMedicine(data);
      setStep(2); 
    } catch (err) {
      console.log("Error fetching details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      setQuery('');
      setSuggestions([]);
      setSelectedMedicine(null);
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
    console.log('Saving medication:', { selectedMedicine, medDetails });
    // Reset everything
    setStep(1);
    setQuery('');
    setSuggestions([]);
    setSelectedMedicine(null);
    setMedDetails({
      strength: '',
      quantity: '',
      frequency: '',
      times: [],
      asNeeded: false,
      foodInstructions: ''
    });
    onClose();
    setShowList(true); //nav to list screen
  };

  // Generate strength options based on dosage info
  const getStrengthOptions = () => {
    if (!selectedMedicine?.dosage) return ['Low', 'Medium', 'High'];

    const dosageStr = selectedMedicine.dosage;
    const matches = dosageStr.match(/\d+\s*(?:mg|mcg|g|ml)/gi);
    return matches && matches.length > 0 ? matches : ['Standard dosage'];
  };

  // Quantity options
  const quantityOptions = ['1 tablet', '2 tablets', '1/2 tablet', '1 capsule', '2 capsules', '5ml', '10ml'];

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
          placeholderTextColor="#999"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setSelectedMedicine(null);
          }}
        />
      </View>
    {/* Barcode Scanner */}
    <TouchableOpacity style={styles.scanButton} onPress={() => setScannerVisible(true)}>
      <MaterialCommunityIcons name="camera-iris" size={24} color="#E85D5B" />
      <Text style={styles.scanButtonText}>Take Photo</Text>
    </TouchableOpacity>
    {/* Scanner Modal */}
    <Modal visible={scannerVisible} animationType="slide" onRequestClose={() => setScannerVisible(false)}>
      <MedicineOCRScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onMedicineDetected={(detectedName: string) => {
          setQuery(detectedName);
          setScannerVisible(false);
        }}
      />
    </Modal>

      {/* Loading spinner */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E85D5B" />
        </View>
      )}

      {/* Autocomplete Suggestions */}
      {!loading && suggestions.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>Suggestions</Text>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSelect(suggestion)}
            >
              <Card style={styles.medicationCard}>
                <View style={styles.medCardContent}>
                  <View style={styles.medIcon}>
                    <MaterialCommunityIcons name="pill" size={24} color="#E85D5B" />
                  </View>
                  <View style={styles.medInfo}>
                    <Text style={styles.medName}>{suggestion}</Text>
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

  const renderInfoStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <View style={styles.stepHeader}>
        <View style={styles.selectedMedIcon}>
          <MaterialCommunityIcons name="pill" size={32} color="#E85D5B" />
        </View>
        <Text style={styles.stepTitle}>{selectedMedicine?.brand_name || 'Medicine Details'}</Text>
        {selectedMedicine?.generic_name && (
          <Text style={styles.stepSubtitle}>{selectedMedicine.generic_name}</Text>
        )}
      </View>

      <View style={styles.infoSection}>
        {selectedMedicine?.manufacturer && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons name="factory" size={20} color="#E85D5B" />
              <Text style={styles.infoLabel}>Manufacturer</Text>
            </View>
            <Text style={styles.infoValue}>{selectedMedicine.manufacturer}</Text>
          </View>
        )}

        {selectedMedicine?.dosage && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons name="flask" size={20} color="#E85D5B" />
              <Text style={styles.infoLabel}>Dosage</Text>
            </View>
            <Text style={styles.infoValue}>{selectedMedicine.dosage}</Text>
          </View>
        )}

        {selectedMedicine?.purpose && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons name="information" size={20} color="#E85D5B" />
              <Text style={styles.infoLabel}>Purpose</Text>
            </View>
            <Text style={styles.infoValue}>{selectedMedicine.purpose}</Text>
          </View>
        )}

        {selectedMedicine?.indications && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons name="file-document" size={20} color="#E85D5B" />
              <Text style={styles.infoLabel}>Indications</Text>
            </View>
            <Text style={styles.infoValue}>{selectedMedicine.indications}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setStep(3)}
      >
        <Text style={styles.primaryButtonText}>Continue to Details</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderDetailsStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <View style={styles.stepHeader}>
        <View style={styles.selectedMedIcon}>
          <MaterialCommunityIcons name="pill" size={32} color="#E85D5B" />
        </View>
        <Text style={styles.stepTitle}>{selectedMedicine?.brand_name}</Text>
        <Text style={styles.stepSubtitle}>{selectedMedicine?.generic_name || 'Generic name not available'}</Text>
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
              {getStrengthOptions().map((option: string) => (
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
              {quantityOptions.map((option: string) => (
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
        onPress={() => setStep(4)}
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

  if (showList) {
  return <MedicationListScreen onAddNew={() => {}} />;
}

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
            {step === 1 ? 'Add Medication' : step === 2 ? 'Medicine Information' : step === 3 ? 'Medication Details' : 'Set Schedule'}
          </Text>
          <Text style={styles.stepIndicator}>{step}/4</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
          </View>
        </View>

        {/* Content */}
        {step === 1 && renderSearchStep()}
        {step === 2 && renderInfoStep()}
        {step === 3 && renderDetailsStep()}
        {step === 4 && renderScheduleStep()}
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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
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
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#2C2C2C',
    lineHeight: 22,
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