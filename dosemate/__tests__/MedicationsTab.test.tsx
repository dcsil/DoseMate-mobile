import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import MedicationsTab from "@/components/main-navigation/tabs/MedicationsTab";
import { notificationService } from "@/components/services/notificationService";

const globalAny: any = global;

// ---- Mocks ----
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("expo-notifications", () => ({
  scheduleNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: {
    TIME_INTERVAL: "timeInterval",
  },
}));

jest.mock("react-native-calendars", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    Calendar: ({ onDayPress }: any) => (
      <View testID="calendar">
        <Text>Calendar</Text>
      </View>
    ),
  };
});

jest.mock("@/components/main-navigation/MedicationCard", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return ({ medication, onEdit, onDelete, onViewDetails }: any) => (
    <View testID={`med-card-${medication.id}`}>
      <Text>{medication.name}</Text>
      <TouchableOpacity testID={`edit-${medication.id}`} onPress={onEdit}>
        <Text>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity testID={`delete-${medication.id}`} onPress={onDelete}>
        <Text>Delete</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID={`details-${medication.id}`}
        onPress={onViewDetails}
      >
        <Text>Details</Text>
      </TouchableOpacity>
    </View>
  );
});

jest.mock("@/components/main-navigation/AddMedicationScreen", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return ({ visible }: any) =>
    visible ? (
      <View testID="add-medication-modal">
        <Text>Add Medication Modal</Text>
      </View>
    ) : null;
});

jest.mock("@/components/main-navigation/MedicationsDetailsScreen", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return ({ visible }: any) =>
    visible ? (
      <View testID="medication-details-modal">
        <Text>Medication Details Modal</Text>
      </View>
    ) : null;
});

jest.mock("@/components/services/notificationService", () => ({
  notificationService: {
    cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
    scheduleMedicationNotifications: jest.fn().mockResolvedValue(undefined),
    getNotificationsSummary: jest.fn().mockResolvedValue({ total: 0 }),
    requestPermissions: jest.fn().mockResolvedValue(false),
    setupNotificationListeners: jest.fn().mockReturnValue(jest.fn()),
    cancelMedicationNotifications: jest.fn().mockResolvedValue(undefined),
  },
}));

// ---- Setup ----

beforeAll(() => {
  // Avoid actual alerts popping during tests
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

beforeEach(() => {
  jest.clearAllMocks();
  (require("expo-secure-store").getItemAsync as jest.Mock).mockResolvedValue(
    "fake-jwt",
  );

  globalAny.fetch = jest.fn();
});

afterAll(() => {
  jest.restoreAllMocks();
});

// ---- Tests ----

describe("MedicationsTab", () => {
  it("renders empty state when no medications are returned", async () => {
    (globalAny.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    });

    const { getByText, queryByTestId } = render(<MedicationsTab />);

    await waitFor(() => {
      expect(getByText("All Medications")).toBeTruthy();
    });

    expect(getByText("No medicine yet")).toBeTruthy();
    expect(getByText("Tap Add Medicine to get started")).toBeTruthy();
    expect(queryByTestId("med-card-1")).toBeNull();
  });

  it("renders medications returned from backend", async () => {
    (globalAny.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          id: 1,
          brand_name: "Amoxicillin",
          purpose: "Antibiotic",
          adherence_score: 95,
          schedules: [
            {
              strength: "500 mg",
              quantity: "1",
              frequency: "Daily",
              time_of_day: ["8:00 AM"],
              days: [],
            },
          ],
        },
      ],
    });

    const { getByText, getByTestId } = render(<MedicationsTab />);

    await waitFor(() => {
      expect(getByText("All Medications")).toBeTruthy();
    });

    expect(getByTestId("med-card-1")).toBeTruthy();
    expect(getByText("Amoxicillin")).toBeTruthy();
  });

  it("opens AddMedicationScreen when 'Add Medicine' is pressed", async () => {
    (globalAny.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    });

    const { getByText, getByTestId } = render(<MedicationsTab />);

    await waitFor(() => {
      expect(getByText("All Medications")).toBeTruthy();
    });

    const addButton = getByText("Add Medicine");
    fireEvent.press(addButton);

    expect(getByTestId("add-medication-modal")).toBeTruthy();
  });

  it("calls notificationService.requestPermissions on mount", async () => {
    (globalAny.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    });

    render(<MedicationsTab />);

    await waitFor(() => {
      expect(
        notificationService.requestPermissions as jest.Mock,
      ).toHaveBeenCalled();
    });
  });

  it("shows warning banner when notifications are disabled", async () => {
    (globalAny.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    });

    // requestPermissions mock returns false by default in our jest.mock
    const { getByText } = render(<MedicationsTab />);

    await waitFor(() => {
      expect(
        getByText("Notifications disabled. Enable in settings."),
      ).toBeTruthy();
    });
  });
});
