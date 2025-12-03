// __tests__/OCR.test.tsx
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MedicineOCRScanner from "@/components/main-navigation/OCR";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

declare const global: any;
const globalAny: any = global as any;

// ---- Mocks ----

// Mock expo-image-picker
jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: "Images" },
}));

// Mock icons to simple text so we can still query labels if needed
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name }: any) => <Text>{name}</Text>,
    MaterialCommunityIcons: ({ name }: any) => <Text>{name}</Text>,
  };
});

// Mock global fetch
(global as any).fetch = jest.fn();

// Minimal FormData mock so `new FormData()` + `append` works
class MockFormData {
  private _fields: any[] = [];
  append(key: string, value: any) {
    this._fields.push({ key, value });
  }
}
(global as any).FormData = MockFormData;

// Mock Alert.alert to avoid native calls
jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

// ---- Tests ----

describe("MedicineOCRScanner", () => {
  const onClose = jest.fn();
  const onMedicineDetected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders initial instructions and actions when visible and no image selected", () => {
    const { getByText } = render(
      <MedicineOCRScanner
        visible={true}
        onClose={onClose}
        onMedicineDetected={onMedicineDetected}
      />,
    );

    // Header
    expect(getByText("Scan Medicine")).toBeTruthy();

    // Main instruction
    expect(getByText("Scan Medicine Label")).toBeTruthy();
    expect(
      getByText(
        "Take a clear photo or upload an existing one to detect the medicine name",
      ),
    ).toBeTruthy();

    // Action buttons
    expect(getByText("Take Photo")).toBeTruthy();
    expect(getByText("Choose from Gallery")).toBeTruthy();

    // Tips section
    expect(getByText("📸 Tips:")).toBeTruthy();
    expect(getByText("• Good lighting")).toBeTruthy();
    expect(getByText("• Focus on name")).toBeTruthy();
    expect(getByText("• Avoid blur")).toBeTruthy();
  });

  it("calls onClose when close icon is pressed", () => {
    const { getByText } = render(
      <MedicineOCRScanner
        visible={true}
        onClose={onClose}
        onMedicineDetected={onMedicineDetected}
      />,
    );

    // Close icon from Ionicons mock is rendered as "close"
    fireEvent.press(getByText("close"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("requests camera permission and uses camera when Take Photo is pressed", async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: true,
    });
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "test://photo.jpg" }],
    });

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        extracted_text: "Amoxicillin 500mg",
        detected_medicines: ["Amoxicillin"],
      }),
    });

    const { getByText } = render(
      <MedicineOCRScanner
        visible={true}
        onClose={onClose}
        onMedicineDetected={onMedicineDetected}
      />,
    );

    fireEvent.press(getByText("Take Photo"));

    await waitFor(() => {
      expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalledTimes(
        1,
      );
      expect(ImagePicker.launchCameraAsync).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    // After processing, detected medicines should be listed
    await waitFor(() => {
      expect(getByText("Detected Medicines:")).toBeTruthy();
      expect(getByText("Amoxicillin")).toBeTruthy();
    });
  });

  it("shows permission alert if camera permission is denied", async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: false,
    });

    const { getByText } = render(
      <MedicineOCRScanner
        visible={true}
        onClose={onClose}
        onMedicineDetected={onMedicineDetected}
      />,
    );

    fireEvent.press(getByText("Take Photo"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Permission required",
        "Camera access is needed to take photos.",
      );
    });
  });

  it("picks image from gallery and lists detected medicines", async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "test://gallery.jpg" }],
    });

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        extracted_text: "Metformin 500mg",
        detected_medicines: ["Metformin"],
      }),
    });

    const { getByText } = render(
      <MedicineOCRScanner
        visible={true}
        onClose={onClose}
        onMedicineDetected={onMedicineDetected}
      />,
    );

    fireEvent.press(getByText("Choose from Gallery"));

    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(getByText("Detected Medicines:")).toBeTruthy();
      expect(getByText("Metformin")).toBeTruthy();
    });
  });

  it("calls onMedicineDetected and closes when user taps a detected medicine", async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "test://gallery-selected.jpg" }],
    });

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        extracted_text: "Lisinopril 10mg",
        detected_medicines: ["Lisinopril"],
      }),
    });

    const { getByText } = render(
      <MedicineOCRScanner
        visible={true}
        onClose={onClose}
        onMedicineDetected={onMedicineDetected}
      />,
    );

    fireEvent.press(getByText("Choose from Gallery"));

    const medicineButton = await waitFor(() => getByText("Lisinopril"));
    fireEvent.press(medicineButton);

    expect(onMedicineDetected).toHaveBeenCalledWith("Lisinopril");
    expect(onClose).toHaveBeenCalled();
  });

  it("shows error alert when OCR endpoint responds with non-ok", async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "test://gallery-error.jpg" }],
    });

    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal error",
    });

    const { getByText } = render(
      <MedicineOCRScanner
        visible={true}
        onClose={onClose}
        onMedicineDetected={onMedicineDetected}
      />,
    );

    fireEvent.press(getByText("Choose from Gallery"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        expect.stringContaining("Server returned 500"),
      );
    });
  });

  it("shows 'No Medicine Detected' alert when response has no detected_medicines", async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "test://gallery-nomed.jpg" }],
    });

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        extracted_text: "Some blurry label text",
        detected_medicines: [],
      }),
    });

    const { getByText } = render(
      <MedicineOCRScanner
        visible={true}
        onClose={onClose}
        onMedicineDetected={onMedicineDetected}
      />,
    );

    fireEvent.press(getByText("Choose from Gallery"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "No Medicine Detected",
        "Try again with a clearer image.",
      );
    });
  });

  it("shows extracted text box when extracted_text is returned", async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "test://gallery-text.jpg" }],
    });

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        extracted_text: "AMOXICILLIN 500MG CAPSULES",
        detected_medicines: ["Amoxicillin"],
      }),
    });

    const { getByText } = render(
      <MedicineOCRScanner
        visible={true}
        onClose={onClose}
        onMedicineDetected={onMedicineDetected}
      />,
    );

    fireEvent.press(getByText("Choose from Gallery"));

    await waitFor(() => {
      expect(getByText("Extracted Text:")).toBeTruthy();
      expect(getByText("AMOXICILLIN 500MG CAPSULES")).toBeTruthy();
    });
  });
});
