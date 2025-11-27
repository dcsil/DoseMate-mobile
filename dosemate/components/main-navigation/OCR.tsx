import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { BACKEND_BASE_URL } from "@/config";

interface MedicineOCRScannerProps {
  visible: boolean;
  onClose: () => void;
  onMedicineDetected: (medicineName: string) => void;
}

export default function MedicineOCRScanner({
  visible,
  onClose,
  onMedicineDetected,
}: MedicineOCRScannerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [detectedMedicines, setDetectedMedicines] = useState<string[]>([]);

  // Open camera
  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Camera access is needed to take photos.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
      processImage(uri);
    }
  };

  // Pick image from gallery
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
      processImage(uri);
    }
  };

  // Process image via OCR endpoint
  const processImage = async (imageUri: string) => {
    setLoading(true);
    setExtractedText(null);
    setDetectedMedicines([]);

    try {
      let formData = new FormData();

      if (Platform.OS === "web") {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const file = new File([blob], "medicine.jpg", { type: blob.type });
        formData.append("file", file);
      } else {
        const uriParts = imageUri.split(".");
        const fileType = uriParts[uriParts.length - 1] || "jpg";
        formData.append("file", {
          uri: imageUri,
          name: `medicine.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      const headers: any = {};
      if (Platform.OS !== "web")
        headers["Content-Type"] = "multipart/form-data";

      const response = await fetch(`${BACKEND_BASE_URL}/ocr/extract`, {
        method: "POST",
        body: formData,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (data.extracted_text) setExtractedText(data.extracted_text);
      if (data.detected_medicines?.length > 0)
        setDetectedMedicines(data.detected_medicines);
      else
        Alert.alert("No Medicine Detected", "Try again with a clearer image.");
    } catch (error: any) {
      console.error("Error processing image:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to process image. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMedicine = (medicineName: string) => {
    try {
      onMedicineDetected(medicineName);
    } finally {
      setSelectedImage(null);
      setExtractedText(null);
      setDetectedMedicines([]);
      setLoading(false);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setExtractedText(null);
    setDetectedMedicines([]);
    setLoading(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#2C2C2C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Medicine</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {!selectedImage ? (
            <View style={styles.optionsContainer}>
              <View style={styles.instructionContainer}>
                <MaterialCommunityIcons
                  name="camera-iris"
                  size={80}
                  color="#E85D5B"
                />
                <Text style={styles.instructionTitle}>Scan Medicine Label</Text>
                <Text style={styles.instructionText}>
                  Take a clear photo or upload an existing one to detect the
                  medicine name
                </Text>
              </View>

              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={handleTakePhoto}
                >
                  <Ionicons name="camera" size={32} color="#E85D5B" />
                  <Text style={styles.optionTitle}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={handlePickImage}
                >
                  <Ionicons name="images" size={32} color="#4CAF50" />
                  <Text style={styles.optionTitle}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>📸 Tips:</Text>
                <Text style={styles.tipText}>• Good lighting</Text>
                <Text style={styles.tipText}>• Focus on name</Text>
                <Text style={styles.tipText}>• Avoid blur</Text>
              </View>
            </View>
          ) : (
            <View style={styles.resultsContainer}>
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.imagePreview}
                />
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={() => {
                    setSelectedImage(null);
                    setExtractedText(null);
                    setDetectedMedicines([]);
                  }}
                >
                  <Ionicons name="camera-reverse" size={20} color="#FFF" />
                  <Text style={styles.retakeButtonText}>Retake</Text>
                </TouchableOpacity>
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#E85D5B" />
                  <Text style={styles.loadingText}>Analyzing image...</Text>
                </View>
              ) : (
                <>
                  {detectedMedicines.length > 0 && (
                    <View style={styles.detectedContainer}>
                      <Text style={styles.detectedTitle}>
                        Detected Medicines:
                      </Text>

                      {/* ✅ SCROLLABLE LIST */}
                      <ScrollView
                        style={styles.detectedScroll}
                        contentContainerStyle={{ paddingBottom: 20 }}
                      >
                        {detectedMedicines.map((medicine, i) => (
                          <TouchableOpacity
                            key={i}
                            style={styles.medicineOption}
                            onPress={() => handleSelectMedicine(medicine)}
                          >
                            <MaterialCommunityIcons
                              name="pill"
                              size={24}
                              color="#E85D5B"
                            />
                            <Text style={styles.medicineOptionText}>
                              {medicine}
                            </Text>
                            <Ionicons
                              name="chevron-forward"
                              size={20}
                              color="#999"
                            />
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {extractedText && (
                    <View style={styles.extractedTextContainer}>
                      <Text style={styles.extractedTextTitle}>
                        Extracted Text:
                      </Text>
                      <Text style={styles.extractedText}>{extractedText}</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  closeButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#2C2C2C" },
  content: { flex: 1, padding: 20 },
  optionsContainer: { flex: 1, justifyContent: "space-between" },
  instructionContainer: { alignItems: "center", marginTop: 40 },
  instructionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C2C2C",
    marginTop: 24,
  },
  instructionText: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  buttonsContainer: { gap: 16 },
  optionButton: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F0F0F0",
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C2C2C",
    marginTop: 8,
  },
  tipsContainer: {
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFE5E5",
  },
  tipsTitle: { fontSize: 14, fontWeight: "600", color: "#2C2C2C" },
  tipText: { fontSize: 13, color: "#777", marginTop: 4 },
  resultsContainer: { flex: 1 },
  imagePreviewContainer: { marginBottom: 24, position: "relative" },
  imagePreview: {
    width: "100%",
    height: 300,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
  },
  retakeButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retakeButtonText: { color: "#FFF", fontSize: 14, marginLeft: 6 },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: { fontSize: 16, color: "#777", marginTop: 16 },
  detectedContainer: { marginBottom: 24 },
  detectedTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 12,
  },

  /** ⭐️ Scrollable list */
  detectedScroll: {
    maxHeight: 200,
  },

  medicineOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  medicineOptionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: "#2C2C2C",
  },
  extractedTextContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  extractedTextTitle: { fontSize: 14, fontWeight: "600", color: "#999" },
  extractedText: { fontSize: 13, color: "#777", marginTop: 6 },
});
