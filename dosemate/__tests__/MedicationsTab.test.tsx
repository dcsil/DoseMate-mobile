import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import MedicationsTab from "@/components/main-navigation/tabs/MedicationsTab";
import * as SecureStore from "expo-secure-store";
import { notificationService } from "@/components/services/notificationService";

// --- Router mock with shared mockReplace we can assert on ---
const mockReplace = jest.fn();
const globalAny = global as any;

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// --- Mocks ---

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("expo-notifications", () => ({
  scheduleNotificationAsync: jest.fn().mockResolvedValue("notif-id"),
  SchedulableTriggerInputTypes: {
    TIME_INTERVAL: "timeInterval",
  },
}));

jest.mock("react-native-calendars", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");
  return {
    Calendar: ({ onDayPress }: any) => (
      <TouchableOpacity
        testID="calendar"
        onPress={() => onDayPress({ dateString: "2025-01-01" })}
      >
        <Text>Calendar</Text>
      </TouchableOpacity>
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
  const { View, Text, TouchableOpacity } = require("react-native");
  return ({ visible, onClose }: any) =>
    visible ? (
      <View testID="mock-add-med-screen">
        <Text>AddMedication Mock</Text>
        <TouchableOpacity testID="close-add-med" onPress={onClose}>
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    ) : null;
});

jest.mock("@/components/main-navigation/MedicationsDetailsScreen", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return ({ visible, onClose, medication }: any) =>
    visible ? (
      <View testID="mock-med-details">
        <Text>Details for {medication?.name}</Text>
        <TouchableOpacity testID="close-med-details" onPress={onClose}>
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    ) : null;
});

jest.mock("@/components/services/notificationService", () => ({
  notificationService: {
    requestPermissions: jest.fn(),
    scheduleMedicationNotifications: jest.fn(),
    cancelAllNotifications: jest.fn(),
    cancelMedicationNotifications: jest.fn(),
    getNotificationsSummary: jest.fn(),
    setupNotificationListeners: jest.fn(() => jest.fn()),
  },
}));

// --- Single Alert spy that also auto-presses useful buttons ---

const alertMock = jest
  .spyOn(Alert, "alert")
  .mockImplementation((title: any, message?: any, buttons?: any) => {
    if (!buttons || !Array.isArray(buttons)) return;

    // Prefer destructive / Delete / Morning/Afternoon/Evening/Schedule
    let btn =
      buttons.find((b: any) => b.style === "destructive") ||
      buttons.find((b: any) => b.text?.toLowerCase?.() === "delete") ||
      buttons.find((b: any) => b.text?.includes?.("Morning")) ||
      buttons.find((b: any) => b.text?.includes?.("Afternoon")) ||
      buttons.find((b: any) => b.text?.includes?.("Evening")) ||
      buttons.find((b: any) => b.text === "Schedule") ||
      buttons[0];

    btn?.onPress?.();
  });

// --- Setup ---

beforeEach(() => {
  jest.clearAllMocks();
  alertMock.mockClear();

  // Default: token present unless overridden in a specific test
  (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("fake-jwt");

  globalAny.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => [],
  });

  (notificationService.requestPermissions as jest.Mock).mockResolvedValue(
    false,
  );
  (notificationService.cancelAllNotifications as jest.Mock).mockResolvedValue(
    undefined,
  );
  (notificationService.scheduleMedicationNotifications as jest.Mock)
    .mockResolvedValue(undefined);
  (notificationService.cancelMedicationNotifications as jest.Mock)
    .mockResolvedValue(undefined);
  (notificationService.getNotificationsSummary as jest.Mock).mockResolvedValue({
    total: 0,
  });

  mockReplace.mockReset();
});

// Let RTL handle act() for render, but wait for the async effects to run
const renderMedicationsTab = async () => {
  const utils = render(<MedicationsTab />);

  // This ensures async state updates from requestPermissions + initial effects
  await waitFor(() => {
    expect(notificationService.requestPermissions).toHaveBeenCalled();
  });

  return utils;
};

// --- Tests ---

describe("MedicationsTab", () => {
  it("shows warning banner and empty state when notifications disabled and no meds", async () => {
    (notificationService.requestPermissions as jest.Mock).mockResolvedValue(
      false,
    );

    const { getByText } = await renderMedicationsTab();

    await waitFor(() => {
      expect(
        getByText("Notifications disabled. Enable in settings."),
      ).toBeTruthy();
    });

    await waitFor(() => {
      expect(getByText("No medicine yet")).toBeTruthy();
      expect(
        getByText("Tap Add Medicine to get started"),
      ).toBeTruthy();
    });

    expect(
      notificationService.scheduleMedicationNotifications,
    ).not.toHaveBeenCalled();
  });

  it("shows auth error when no JWT on initial fetch and does not call backend", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

    await renderMedicationsTab();

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        "Authentication Error",
        "Please log in again",
      );
    });

    expect(globalAny.fetch).not.toHaveBeenCalled();
  });

  it("handles 401 token expiry by clearing token and navigating to onboarding", async () => {
    (notificationService.requestPermissions as jest.Mock).mockResolvedValue(
      false,
    );

    (globalAny.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    });

    await renderMedicationsTab();

    await waitFor(() => {
      expect(
        alertMock.mock.calls.some(
          (c) =>
            c[0] === "Session Expired" &&
            c[1] === "Your session has expired. Please log in again.",
        ),
      ).toBe(true);
    });

    // The OK button is auto-pressed by alertMock, so we just assert side effects
    await waitFor(() => {
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("jwt");
      expect(mockReplace).toHaveBeenCalledWith("/onboarding/create-account");
    });
  });

  it("fetches medications, hides warning banner, and schedules notifications when enabled", async () => {
    (notificationService.requestPermissions as jest.Mock).mockResolvedValue(
      true,
    );

    (globalAny.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          id: 1,
          brand_name: "Amoxicillin",
          adherence_score: 80,
          purpose: "Antibiotic",
          schedules: [
            {
              strength: "500 mg",
              quantity: "1 tablet",
              frequency: "Daily",
              time_of_day: ["8:00 AM"],
              days: ["Monday"],
              food_instructions: "With food",
              start_date: undefined,
              end_date: undefined,
              times_per_day: 1,
            },
          ],
        },
      ],
    });

    const { getByText, queryByText } = await renderMedicationsTab();

    await waitFor(() => {
      expect(globalAny.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/user/medications/"),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer fake-jwt",
          }),
        }),
      );
    });

    await waitFor(() => {
      expect(getByText("Amoxicillin")).toBeTruthy();
    });

    await waitFor(() => {
      expect(
        queryByText("Notifications disabled. Enable in settings."),
      ).toBeNull();
    });

    await waitFor(() => {
      expect(notificationService.cancelAllNotifications).toHaveBeenCalled();
      expect(
        notificationService.scheduleMedicationNotifications,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          medicationId: 1,
          name: "Amoxicillin",
          strength: "500 mg",
          quantity: "1 tablet",
          times: ["8:00 AM"],
          days: ["Monday"],
          frequency: "Daily",
        }),
      );
    });
  });

  it("opens AddMedicationScreen and refetches meds when it closes", async () => {
    (notificationService.requestPermissions as jest.Mock).mockResolvedValue(
      false,
    );

    (globalAny.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [
          {
            id: 2,
            brand_name: "Ibuprofen",
            adherence_score: 95,
            purpose: "Pain relief",
            schedules: [
              {
                strength: "200 mg",
                quantity: "1 tablet",
                frequency: "Daily",
                time_of_day: ["9:00 AM"],
                days: [],
              },
            ],
          },
        ],
      });

    const { getByText, getByTestId } = await renderMedicationsTab();

    await waitFor(() => {
      expect(getByText("No medicine yet")).toBeTruthy();
    });

    const before = (globalAny.fetch as jest.Mock).mock.calls.filter(
      (c: any[]) =>
        typeof c[0] === "string" &&
        c[0].includes("/user/medications/"),
    ).length;

    fireEvent.press(getByText("Add Medicine"));

    await waitFor(() => {
      expect(getByTestId("mock-add-med-screen")).toBeTruthy();
    });

    fireEvent.press(getByTestId("close-add-med"));

    await waitFor(() => {
      const after = (globalAny.fetch as jest.Mock).mock.calls.filter(
        (c: any[]) =>
          typeof c[0] === "string" &&
          c[0].includes("/user/medications/"),
      ).length;

      expect(after).toBeGreaterThan(before);
    });
  });

  it("opens calendar via edit and shows time selection alert", async () => {
    (notificationService.requestPermissions as jest.Mock).mockResolvedValue(
      false,
    );

    (globalAny.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          id: 3,
          brand_name: "TestMed",
          adherence_score: 90,
          purpose: "Test purpose",
          schedules: [
            {
              strength: "10 mg",
              quantity: "1 tablet",
              frequency: "Daily",
              time_of_day: ["8:00 AM"],
              days: ["Monday"],
            },
          ],
        },
      ],
    });

    const { getByText, getByTestId } = await renderMedicationsTab();

    await waitFor(() => {
      expect(getByText("TestMed")).toBeTruthy();
    });

    fireEvent.press(getByTestId("edit-3"));

    await waitFor(() => {
      expect(getByTestId("calendar")).toBeTruthy();
    });

    const beforeCalls = alertMock.mock.calls.length;

    fireEvent.press(getByTestId("calendar"));

    await waitFor(() => {
      expect(alertMock.mock.calls.length).toBeGreaterThan(beforeCalls);
    });

    const [title, message] = alertMock.mock.calls[beforeCalls] as any;
    expect(title).toBe("Select Time");
    expect(message).toContain("TestMed");
  });

  it("deletes a medication successfully and removes it from the list", async () => {
    (notificationService.requestPermissions as jest.Mock).mockResolvedValue(
      false,
    );

    let deleted = false;

    (globalAny.fetch as jest.Mock).mockImplementation(
      (url: string, options?: any) => {
        if (typeof url === "string" && url.includes("/user/medications/")) {
          // All GETs before delete → return DeleteMed
          // All GETs after delete → return empty list
          if (!options || options.method === "GET") {
            const meds = deleted
              ? []
              : [
                  {
                    id: 5,
                    brand_name: "DeleteMed",
                    adherence_score: 70,
                    purpose: "Test delete",
                    schedules: [
                      {
                        strength: "5 mg",
                        quantity: "1 tablet",
                        frequency: "Daily",
                        time_of_day: ["8:00 AM"],
                        days: [],
                      },
                    ],
                  },
                ];

            return Promise.resolve({
              ok: true,
              status: 200,
              json: async () => meds,
            });
          }

          // DELETE for this medication
          if (options.method === "DELETE") {
            deleted = true;
            return Promise.resolve({
              ok: true,
              text: async () => "",
            });
          }
        }

        // Default for any other endpoint
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => [],
        });
      },
    );

    const { getByTestId, queryByText } = await renderMedicationsTab();

    // Wait until the delete button for this medication is actually rendered
    await waitFor(() => {
      expect(getByTestId("delete-5")).toBeTruthy();
    });

    // Trigger delete
    fireEvent.press(getByTestId("delete-5"));

    // Alert is auto-confirmed by the Alert mock you already set up
    await waitFor(() => {
      expect(
        notificationService.cancelMedicationNotifications,
      ).toHaveBeenCalledWith(5);

      expect(globalAny.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/user/medications/5"),
        expect.objectContaining({
          method: "DELETE",
        }),
      );

      // After delete, the follow-up GET returns [], so DeleteMed should be gone
      expect(queryByText("DeleteMed")).toBeNull();
    });

    // Success alert was shown
    expect(
      alertMock.mock.calls.some(
        (c) =>
          c[0] === "Success" &&
          c[1] === "Medication deleted successfully",
      ),
    ).toBe(true);
  });

  it("shows error and does not call backend when deleting medication without token", async () => {
    (notificationService.requestPermissions as jest.Mock).mockResolvedValue(
      false,
    );

    // Reset and reconfigure getItemAsync:
    //  - first call (initial fetch) -> token
    //  - subsequent calls (delete path) -> null
    const getItemMock = SecureStore.getItemAsync as jest.Mock;
    getItemMock.mockReset();
    getItemMock.mockResolvedValueOnce("fake-jwt").mockResolvedValue(null);

    (globalAny.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          id: 6,
          brand_name: "TokenLessMed",
          adherence_score: 60,
          purpose: "Test no token delete",
          schedules: [
            {
              strength: "5 mg",
              quantity: "1 tablet",
              frequency: "Daily",
              time_of_day: ["8:00 AM"],
              days: [],
            },
          ],
        },
      ],
    });

    const { getByText, getByTestId } = await renderMedicationsTab();

    await waitFor(() => {
      expect(getByText("TokenLessMed")).toBeTruthy();
    });

    fireEvent.press(getByTestId("delete-6"));

    await waitFor(() => {
      expect(
        alertMock.mock.calls.some(
          (c) =>
            c[0] === "Delete Medication" &&
            c[1] ===
              "This will remove all recurring and specific date reminders.",
        ),
      ).toBe(true);
    });

    // Delete button is auto-pressed by alertMock, which now sees no token
    await waitFor(() => {
      expect(
        alertMock.mock.calls.some(
          (c) =>
            c[0] === "Error" &&
            c[1] === "Authentication token not found",
        ),
      ).toBe(true);
    });

    // Only the initial GET should have been made (no DELETE)
    const medFetchCalls = (globalAny.fetch as jest.Mock).mock.calls.filter(
      (c: any[]) =>
        typeof c[0] === "string" &&
        c[0].includes("/user/medications/"),
    );
    expect(medFetchCalls.length).toBe(1);
  });

  it("opens and closes medication details modal via MedicationCard", async () => {
    (notificationService.requestPermissions as jest.Mock).mockResolvedValue(
      false,
    );

    (globalAny.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          id: 7,
          brand_name: "DetailMed",
          adherence_score: 99,
          purpose: "Show details",
          schedules: [
            {
              strength: "50 mg",
              quantity: "1 tablet",
              frequency: "Daily",
              time_of_day: ["10:00 AM"],
              days: [],
            },
          ],
        },
      ],
    });

    const { getByText, getByTestId, queryByTestId } =
      await renderMedicationsTab();

    await waitFor(() => {
      expect(getByText("DetailMed")).toBeTruthy();
    });

    fireEvent.press(getByTestId("details-7"));

    await waitFor(() => {
      expect(getByTestId("mock-med-details")).toBeTruthy();
      expect(getByText("Details for DetailMed")).toBeTruthy();
    });

    fireEvent.press(getByTestId("close-med-details"));

    await waitFor(() => {
      expect(queryByTestId("mock-med-details")).toBeNull();
    });
  });
});
