import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Modal,
  Platform,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar } from "react-native-calendars";
import Card from "./Card";
import MedicineOCRScanner from "./OCR";
import { BACKEND_BASE_URL } from "../../config";
import * as SecureStore from "expo-secure-store";

interface AddMedicationScreenProps {
  visible: boolean;
  onClose: () => void;
}

// User-entered details
interface MedicationDetails {
  strength: string;
  quantity: string;
  frequency: string;
  times: string[];
  days: string[]; // Selected days of the week
  startDate?: string; // Optional start date
  endDate?: string; // Optional end date
  timesPerDay: number; // How many times per day
  asNeeded: boolean;
  foodInstructions: string;
}

// Backend medicine info
type MedicineDetails = {
  id?: string;
  brand_name?: string;
  purpose?: string;
  dosage?: string;
  generic_name?: string;
  manufacturer?: string;
  indications?: string;
};

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AddMedicationScreen({
  visible,
  onClose,
}: AddMedicationScreenProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedMedicine, setSelectedMedicine] =
    useState<MedicineDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Search, 2: Info, 3: Details, 4: Schedule
  const [medDetails, setMedDetails] = useState<MedicationDetails>({
    strength: "",
    quantity: "",
    frequency: "Daily",
    times: [],
    days: [],
    timesPerDay: 1,
    asNeeded: false,
    foodInstructions: "",
  });
  const [scannerVisible, setScannerVisible] = useState(false);

  // Dropdown states
  const [showStrengthPicker, setShowStrengthPicker] = useState(false);
  const [showQuantityPicker, setShowQuantityPicker] = useState(false);
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [showTimesPerDayPicker, setShowTimesPerDayPicker] = useState(false);

  // Date/Time Picker States
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarMode, setCalendarMode] = useState<"start" | "end">("start");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [tempTime, setTempTime] = useState(new Date());

  const skipAutocomplete = useRef(false);

  // --- Fetch suggestions ---
  const fetchSuggestions = async (text: string) => {
    if (text.length < 1 || skipAutocomplete.current) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `${BACKEND_BASE_URL}/medicines/autocomplete?prefix=${text}`,
      );
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

  // --- Select medicine ---
  const handleSelect = async (item: string) => {
    setQuery(item);
    setSuggestions([]);
    setLoading(true);
    skipAutocomplete.current = true;

    try {
      const res = await fetch(
        `${BACKEND_BASE_URL}/medicines/search?query=${item}`,
      );
      const data: MedicineDetails = await res.json();
      setSelectedMedicine(data);
      setStep(2);
    } catch (err) {
      console.log("Error fetching details:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Back navigation ---
  const handleBack = () => {
    if (step === 1) {
      setQuery("");
      setSuggestions([]);
      setSelectedMedicine(null);
      setMedDetails({
        strength: "",
        quantity: "",
        frequency: "Daily",
        times: [],
        days: [],
        timesPerDay: 1,
        asNeeded: false,
        foodInstructions: "",
      });
      skipAutocomplete.current = false;
      onClose();
    } else {
      setStep(step - 1);
    }
  };

  // --- Save medication ---
  const handleSave = async () => {
    console.log("Saving medication:", { selectedMedicine, medDetails });

    try {
      // Get JWT from SecureStore
      const token = await SecureStore.getItemAsync("jwt");
      if (!token) throw new Error("No JWT token found");

      // Prepare payload
      const payload = {
        selectedMedicine,
        medDetails,
      };

      // Call backend API
      const response = await fetch(`${BACKEND_BASE_URL}/user/medications/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to save medication");
      }

      const data = await response.json();
      console.log("Medication saved:", data);

      // Reset UI state
      setStep(1);
      setQuery("");
      setSuggestions([]);
      setSelectedMedicine(null);
      setMedDetails({
        strength: "",
        quantity: "",
        frequency: "Daily",
        times: [],
        days: [],
        timesPerDay: 1,
        asNeeded: false,
        foodInstructions: "",
      });
      skipAutocomplete.current = false;
      onClose();
    } catch (err: any) {
      console.error("Error saving medication:", err.message);
    }
  };

  // --- OCR detected ---
  const handleMedicineDetected = (detectedName: string) => {
    console.log("Medicine detected from OCR:", detectedName);
    
    setScannerVisible(false);
    setQuery(detectedName);
    setSuggestions([]);
    setLoading(true); // Show loading while fetching
    
    fetch(`${BACKEND_BASE_URL}/medicines/search?query=${detectedName}`)
      .then((res) => res.json())
      .then((data: MedicineDetails) => {
        console.log("Medicine data fetched:", data);
        setSelectedMedicine(data);
        setLoading(false);
        setStep(2); // Move to info step
      })
      .catch((err) => {
        console.error("Error fetching medicine details:", err);
        setLoading(false);
        //Alert.alert("Error", "Failed to fetch medicine details. Please try again.");
      });
  };

  // --- Strength options based on backend dosage ---
  const getStrengthOptions = () => {
    if (!selectedMedicine?.dosage) return ["Low", "Medium", "High"];
    const matches = selectedMedicine.dosage.match(/\d+\s*(?:mg|mcg|g|ml)/gi);
    if (matches && matches.length > 0) {
      // Remove duplicates by converting to Set and back to array
      const uniqueMatches = Array.from(new Set(matches));
      return uniqueMatches;
    }
    return ["Standard dosage"];
  };

  // Quantity options
  const quantityOptions = [
    "1 tablet",
    "2 tablets",
    "1/2 tablet",
    "1 capsule",
    "2 capsules",
    "5ml",
    "10ml",
  ];

  // Frequency options
  const frequencyOptions = [
    "Daily",
    "Specific Days",
    "Every Other Day",
    "As Needed",
  ];

  // Times per day options
  const timesPerDayOptions = [1, 2, 3, 4, 5, 6];

  // Toggle day selection
  const toggleDay = (day: string) => {
    if (medDetails.days.includes(day)) {
      setMedDetails((prev) => ({
        ...prev,
        days: prev.days.filter((d) => d !== day),
      }));
    } else {
      setMedDetails((prev) => ({
        ...prev,
        days: [...prev.days, day],
      }));
    }
  };

  // Handle time selection
  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (selectedDate) {
      const timeString = selectedDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      const newTimes = [...medDetails.times];
      newTimes[currentTimeIndex] = timeString;
      setMedDetails((prev) => ({ ...prev, times: newTimes }));

      if (Platform.OS === "ios") {
        setShowTimePicker(false);
      }
    }
  };

  // Handle date selection from calendar
  const handleCalendarDateSelect = (date: string) => {
    if (calendarMode === "start") {
      setMedDetails((prev) => ({
        ...prev,
        startDate: date,
      }));
    } else {
      setMedDetails((prev) => ({
        ...prev,
        endDate: date,
      }));
    }
    setShowCalendarModal(false);
  };

  // Get marked dates for calendar
  const getMarkedDates = () => {
    const marked: any = {};
    
    if (medDetails.startDate) {
      marked[medDetails.startDate] = {
        startingDay: true,
        color: "#4CAF50",
        textColor: "#FFFFFF",
      };
    }
    
    if (medDetails.endDate) {
      marked[medDetails.endDate] = {
        endingDay: true,
        color: "#FF9800",
        textColor: "#FFFFFF",
      };
    }
    
    // Mark dates in between if both start and end are selected
    if (medDetails.startDate && medDetails.endDate) {
      const start = new Date(medDetails.startDate);
      const end = new Date(medDetails.endDate);
      const current = new Date(start);
      current.setDate(current.getDate() + 1);
      
      while (current < end) {
        const dateString = current.toISOString().split("T")[0];
        marked[dateString] = {
          color: "#E8F5E9",
          textColor: "#2C2C2C",
        };
        current.setDate(current.getDate() + 1);
      }
      
      // Update start and end to show connected range
      if (medDetails.startDate && medDetails.endDate !== medDetails.startDate) {
        marked[medDetails.startDate] = {
          startingDay: true,
          color: "#4CAF50",
          textColor: "#FFFFFF",
        };
        marked[medDetails.endDate] = {
          endingDay: true,
          color: "#FF9800",
          textColor: "#FFFFFF",
        };
      }
    }
    
    return marked;
  };

  // Initialize times array when timesPerDay changes
  useEffect(() => {
    if (medDetails.timesPerDay !== medDetails.times.length) {
      const newTimes = Array(medDetails.timesPerDay).fill("");
      setMedDetails((prev) => ({ ...prev, times: newTimes }));
    }
  }, [medDetails.timesPerDay, medDetails.times.length]);

  const renderSearchStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Add Medication</Text>
        <Text style={styles.stepSubtitle}>
          Search for your medication or scan the barcode
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search medication name..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setSelectedMedicine(null);
            skipAutocomplete.current = false;
          }}
        />
      </View>
      {/* Barcode Scanner */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => setScannerVisible(true)}
      >
        <MaterialCommunityIcons name="camera-iris" size={24} color="#E85D5B" />
        <Text style={styles.scanButtonText}>Use Image</Text>
      </TouchableOpacity>
      
      {/* Scanner Modal */}
      <MedicineOCRScanner
        visible={scannerVisible}
        onClose={() => {
          console.log("Closing scanner from AddMedicationScreen");
          setScannerVisible(false);
        }}
        onMedicineDetected={handleMedicineDetected}
      />

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
                    <MaterialCommunityIcons
                      name="pill"
                      size={24}
                      color="#E85D5B"
                    />
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
        <Text style={styles.stepTitle}>
          {selectedMedicine?.brand_name || "Medicine Details"}
        </Text>
        {selectedMedicine?.generic_name && (
          <Text style={styles.stepSubtitle}>
            {selectedMedicine.generic_name}
          </Text>
        )}
      </View>

      <View style={styles.infoSection}>
        {selectedMedicine?.manufacturer && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons
                name="factory"
                size={20}
                color="#E85D5B"
              />
              <Text style={styles.infoLabel}>Manufacturer</Text>
            </View>
            <Text style={styles.infoValue}>
              {selectedMedicine.manufacturer}
            </Text>
          </View>
        )}
        {selectedMedicine?.dosage && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons name="flask" size={20} color="#E85D5B" />
              <Text style={styles.infoLabel}>Dosage Instructions</Text>
            </View>
            <Text style={styles.infoValue}>{selectedMedicine.dosage}</Text>
          </View>
        )}
        {selectedMedicine?.purpose && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons
                name="information"
                size={20}
                color="#E85D5B"
              />
              <Text style={styles.infoLabel}>Purpose</Text>
            </View>
            <Text style={styles.infoValue}>{selectedMedicine.purpose}</Text>
          </View>
        )}
        {selectedMedicine?.indications && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons
                name="file-document"
                size={20}
                color="#E85D5B"
              />
              <Text style={styles.infoLabel}>Indications</Text>
            </View>
            <Text style={styles.infoValue}>{selectedMedicine.indications}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(3)}>
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
        <Text style={styles.stepSubtitle}>
          {selectedMedicine?.generic_name || "Generic name not available"}
        </Text>
      </View>

      <View style={styles.formSection}>
        {/* Strength */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Strength/Dosage</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowStrengthPicker(!showStrengthPicker)}
          >
            <Text
              style={
                medDetails.strength
                  ? styles.selectButtonTextActive
                  : styles.selectButtonText
              }
            >
              {medDetails.strength || "Select strength"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
          {showStrengthPicker && (
            <View style={styles.picker}>
              {getStrengthOptions().map((option: string, index: number) => (
                <TouchableOpacity
                  key={`strength-${index}-${option}`}
                  style={styles.pickerOption}
                  onPress={() => {
                    setMedDetails((prev) => ({ ...prev, strength: option }));
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
            <Text
              style={
                medDetails.quantity
                  ? styles.selectButtonTextActive
                  : styles.selectButtonText
              }
            >
              {medDetails.quantity || "How many pills?"}
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
                    setMedDetails((prev) => ({ ...prev, quantity: option }));
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
            <Text
              style={
                medDetails.foodInstructions
                  ? styles.selectButtonTextActive
                  : styles.selectButtonText
              }
            >
              {medDetails.foodInstructions || "With or without food?"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
          {showFoodPicker && (
            <View style={styles.picker}>
              {["Take with food", "Take without food", "No preference"].map(
                (option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.pickerOption}
                    onPress={() => {
                      setMedDetails((prev) => ({
                        ...prev,
                        foodInstructions: option,
                      }));
                      setShowFoodPicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{option}</Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          (!medDetails.strength || !medDetails.quantity) &&
            styles.primaryButtonDisabled,
        ]}
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
        <Text style={styles.stepSubtitle}>
          Customize when you take this medication
        </Text>
      </View>

      <View style={styles.formSection}>
        {/* Frequency Type */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Frequency</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowFrequencyPicker(!showFrequencyPicker)}
          >
            <Text style={styles.selectButtonTextActive}>
              {medDetails.frequency}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
          {showFrequencyPicker && (
            <View style={styles.picker}>
              {frequencyOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.pickerOption}
                  onPress={() => {
                    setMedDetails((prev) => ({ 
                      ...prev, 
                      frequency: option,
                      days: option === "Daily" ? DAYS_OF_WEEK : [],
                    }));
                    setShowFrequencyPicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Day Selection for Specific Days or Every Other Day */}
        {(medDetails.frequency === "Specific Days" || 
          medDetails.frequency === "Daily") && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {medDetails.frequency === "Daily" 
                ? "Active Days (Select all for daily)" 
                : "Select Days"}
            </Text>
            <View style={styles.daysContainer}>
              {DAYS_OF_WEEK.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayChip,
                    medDetails.days.includes(day) && styles.dayChipActive,
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      medDetails.days.includes(day) &&
                        styles.dayChipTextActive,
                    ]}
                  >
                    {day.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Times Per Day */}
        {medDetails.frequency !== "As Needed" && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>How many times per day?</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowTimesPerDayPicker(!showTimesPerDayPicker)}
            >
              <Text style={styles.selectButtonTextActive}>
                {medDetails.timesPerDay} {medDetails.timesPerDay === 1 ? "time" : "times"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
            {showTimesPerDayPicker && (
              <View style={styles.picker}>
                {timesPerDayOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.pickerOption}
                    onPress={() => {
                      setMedDetails((prev) => ({ ...prev, timesPerDay: option }));
                      setShowTimesPerDayPicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>
                      {option} {option === 1 ? "time" : "times"} per day
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Time Inputs */}
        {medDetails.frequency !== "As Needed" && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Set reminder times</Text>
            <View style={styles.timeInputsContainer}>
              {Array.from({ length: medDetails.timesPerDay }).map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.timeInputButton}
                  onPress={() => {
                    setCurrentTimeIndex(index);
                    setTempTime(new Date());
                    setShowTimePicker(true);
                  }}
                >
                  <Ionicons name="time-outline" size={20} color="#E85D5B" />
                  <Text
                    style={
                      medDetails.times[index]
                        ? styles.timeInputTextActive
                        : styles.timeInputText
                    }
                  >
                    {medDetails.times[index] || `Set time ${index + 1}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Date Range (Optional) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Duration (Optional)</Text>
          <View style={styles.dateRangeContainer}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                setCalendarMode("start");
                setShowCalendarModal(true);
              }}
            >
              <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
              <View style={styles.dateButtonTextContainer}>
                <Text style={styles.dateButtonLabel}>Start</Text>
                <Text style={styles.dateButtonText}>
                  {medDetails.startDate || "Today"}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.dateArrow}>
              <Ionicons name="arrow-forward" size={20} color="#999" />
            </View>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                setCalendarMode("end");
                setShowCalendarModal(true);
              }}
            >
              <Ionicons name="calendar-outline" size={20} color="#FF9800" />
              <View style={styles.dateButtonTextContainer}>
                <Text style={styles.dateButtonLabel}>End</Text>
                <Text style={styles.dateButtonText}>
                  {medDetails.endDate || "Ongoing"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>
            Leave end date empty for ongoing medication
          </Text>
        </View>

        {/* As Needed Toggle */}
        {medDetails.frequency === "As Needed" && (
          <View style={styles.asNeededCard}>
            <Ionicons name="alert-circle" size={24} color="#FF9800" />
            <View style={styles.asNeededTextContainer}>
              <Text style={styles.asNeededTitle}>As Needed Medication</Text>
              <Text style={styles.asNeededSubtitle}>
                No regular schedule. Take only when required.
              </Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={[
          styles.saveButton,
          (medDetails.frequency !== "As Needed" && 
           (medDetails.days.length === 0 || medDetails.times.some(t => !t))) &&
           styles.primaryButtonDisabled
        ]}
        onPress={handleSave}
        disabled={
          medDetails.frequency !== "As Needed" && 
          (medDetails.days.length === 0 || medDetails.times.some(t => !t))
        }
      >
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
            {step === 1
              ? "Add Medication"
              : step === 2
                ? "Medicine Information"
                : step === 3
                  ? "Medication Details"
                  : "Set Schedule"}
          </Text>
          <Text style={styles.stepIndicator}>{step}/4</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]}
            />
          </View>
        </View>

        {/* Content */}
        {step === 1 && renderSearchStep()}
        {step === 2 && renderInfoStep()}
        {step === 3 && renderDetailsStep()}
        {step === 4 && renderScheduleStep()}

        {/* Date/Time Pickers */}
        {showTimePicker && (
          <Modal
            transparent={true}
            animationType="fade"
            visible={showTimePicker}
            onRequestClose={() => setShowTimePicker(false)}
          >
            <View style={styles.pickerModal}>
              <View style={styles.pickerModalContent}>
                <View style={styles.pickerModalHeader}>
                  <Text style={styles.pickerModalTitle}>
                    Select Time {currentTimeIndex + 1}
                  </Text>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.pickerModalDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempTime}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                  style={styles.dateTimePicker}
                />
              </View>
            </View>
          </Modal>
        )}

        {/* Calendar Modal */}
        {showCalendarModal && (
          <Modal
            visible={showCalendarModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowCalendarModal(false)}
          >
            <View style={styles.calendarModalOverlay}>
              <View style={styles.calendarModalContent}>
                <View style={styles.calendarModalHeader}>
                  <Text style={styles.calendarModalTitle}>
                    {calendarMode === "start" ? "Select Start Date" : "Select End Date"}
                  </Text>
                  <TouchableOpacity onPress={() => setShowCalendarModal(false)}>
                    <Ionicons name="close" size={28} color="#2C2C2C" />
                  </TouchableOpacity>
                </View>

                <Calendar
                  onDayPress={(day) => handleCalendarDateSelect(day.dateString)}
                  markedDates={getMarkedDates()}
                  markingType="period"
                  minDate={
                    calendarMode === "end" && medDetails.startDate
                      ? medDetails.startDate
                      : new Date().toISOString().split("T")[0]
                  }
                  theme={{
                    todayTextColor: "#E85D5B",
                    arrowColor: "#E85D5B",
                    monthTextColor: "#2C2C2C",
                    textMonthFontWeight: "700",
                    textDayFontSize: 16,
                    textMonthFontSize: 18,
                  }}
                />

                <View style={styles.calendarLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#4CAF50" }]} />
                    <Text style={styles.legendText}>Start Date</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#FF9800" }]} />
                    <Text style={styles.legendText}>End Date</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#E8F5E9" }]} />
                    <Text style={styles.legendText}>Duration</Text>
                  </View>
                </View>

                {calendarMode === "end" && (
                  <TouchableOpacity
                    style={styles.clearEndDateButton}
                    onPress={() => {
                      setMedDetails((prev) => ({ ...prev, endDate: undefined }));
                      setShowCalendarModal(false);
                    }}
                  >
                    <Text style={styles.clearEndDateText}>Clear End Date (Ongoing)</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Modal>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C2C2C",
    flex: 1,
    marginLeft: 12,
  },
  stepIndicator: {
    fontSize: 14,
    color: "#999",
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepHeader: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  stepSubtitle: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
  },
  selectedMedIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF5F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  scheduleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0FFF4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  searchContainer: {
    position: "relative",
    marginBottom: 16,
  },
  searchIcon: {
    position: "absolute",
    left: 16,
    top: 18,
    zIndex: 1,
  },
  searchInput: {
    height: 56,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#F0F0F0",
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFD4D4",
    borderStyle: "dashed",
    marginBottom: 24,
  },
  scanButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#E85D5B",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  resultsSection: {
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 12,
  },
  medicationCard: {
    marginBottom: 12,
    padding: 16,
  },
  medCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  medIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF5F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 4,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    marginLeft: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: "#2C2C2C",
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
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 12,
  },
  selectButton: {
    height: 56,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F0F0F0",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectButtonText: {
    fontSize: 16,
    color: "#999",
  },
  selectButtonTextActive: {
    fontSize: 16,
    color: "#2C2C2C",
    fontWeight: "500",
  },
  picker: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    maxHeight: 250,
  },
  pickerOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  pickerOptionText: {
    fontSize: 16,
    color: "#2C2C2C",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  dayChipActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  dayChipTextActive: {
    color: "#FFFFFF",
  },
  timeInputsContainer: {
    gap: 12,
  },
  timeInputButton: {
    height: 56,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F0F0F0",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timeInputText: {
    fontSize: 16,
    color: "#999",
  },
  timeInputTextActive: {
    fontSize: 16,
    color: "#2C2C2C",
    fontWeight: "500",
  },
  dateRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateButton: {
    flex: 1,
    height: 72,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F0F0F0",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateButtonTextContainer: {
    flex: 1,
  },
  dateButtonLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#2C2C2C",
    fontWeight: "500",
  },
  dateArrow: {
    paddingHorizontal: 4,
  },
  helperText: {
    fontSize: 13,
    color: "#999",
    marginTop: 8,
    fontStyle: "italic",
  },
  asNeededCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF9E6",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFE0B2",
    gap: 12,
  },
  asNeededTextContainer: {
    flex: 1,
  },
  asNeededTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F57C00",
    marginBottom: 4,
  },
  asNeededSubtitle: {
    fontSize: 14,
    color: "#F57C00",
  },
  pickerModal: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  pickerModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  pickerModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C2C2C",
  },
  pickerModalDone: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  dateTimePicker: {
    height: 200,
  },
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  calendarModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  calendarModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  calendarModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C2C2C",
  },
  calendarLegend: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    color: "#777",
  },
  clearEndDateButton: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    backgroundColor: "#FFF9E6",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  clearEndDateText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#F57C00",
  },
  primaryButton: {
    height: 56,
    backgroundColor: "#E85D5B",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 100,
    shadowColor: "#E85D5B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonDisabled: {
    backgroundColor: "#CCC",
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  saveButton: {
    height: 56,
    backgroundColor: "#4CAF50",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 100,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
});