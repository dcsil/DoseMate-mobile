import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AddMedicationScreen from "@/components/main-navigation//AddMedicationScreen";
import * as SecureStore from "expo-secure-store";

const globalAny: any = globalThis as any;

// --- Mocks ---

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
}));

jest.mock("@react-native-community/datetimepicker", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return ({ value, onChange }: any) => (
    <View testID="time-picker">
      <Text>DateTimePicker</Text>
    </View>
  );
});

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

// Simple Card mock
jest.mock("@/components/main-navigation/Card", () => {
  const React = require("react");
  const { View } = require("react-native");
  return ({ children, ...props }: any) => <View {...props}>{children}</View>;
});

// OCR scanner mock: visible -> renders a test element
jest.mock("@/components/main-navigation/OCR", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return ({ visible, onClose, onMedicineDetected }: any) =>
    visible ? (
      <View testID="ocr-scanner">
        <Text>OCR Scanner</Text>
        <TouchableOpacity
          testID="ocr-detect-button"
          onPress={() => onMedicineDetected("DetectedMed")}
        >
          <Text>Detect</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="ocr-close" onPress={onClose}>
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    ) : null;
});

// --- Setup ---

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();

  // Default SecureStore mock
  (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("fake-jwt");

  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  // Default fetch mock: no suggestions, generic OK response
  globalAny.fetch = jest.fn((url: string, options?: any) =>
    Promise.resolve({
      ok: true,
      json: async () => [],
    }),
  );
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});


// --- Core tests ---

describe("AddMedicationScreen", () => {
  it("renders the search step and opens the OCR scanner when 'Use Image' is pressed", async () => {
    const { getAllByText, getByText, queryByTestId } = render(
      <AddMedicationScreen visible={true} onClose={jest.fn()} />,
    );

    expect(getAllByText("Add Medication").length).toBeGreaterThan(0);
    expect(
      getByText("Search for your medication or scan the barcode"),
    ).toBeTruthy();

    expect(queryByTestId("ocr-scanner")).toBeNull();

    const scanButton = getByText("Use Image");
    fireEvent.press(scanButton);

    expect(queryByTestId("ocr-scanner")).toBeTruthy();
  });

  it("shows autocomplete suggestions and moves to info step when a suggestion is selected", async () => {
    (globalAny.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/medicines/autocomplete")) {
        return Promise.resolve({
          ok: true,
          json: async () => ["Amoxicillin"],
        });
      }
      if (url.includes("/medicines/search")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            brand_name: "Amoxicillin",
            generic_name: "Amoxicillin generic",
            dosage: "Take 1 tablet daily",
            manufacturer: "TestPharma",
            indications: "Antibiotic",
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    const { getByPlaceholderText, getByText } = render(
      <AddMedicationScreen visible={true} onClose={jest.fn()} />,
    );

    const input = getByPlaceholderText("Search medication name...");

    fireEvent.changeText(input, "Amox");

    await waitFor(() => {
      expect(globalAny.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/medicines/autocomplete"),
      );
    });

    fireEvent.press(getByText("Amoxicillin"));

    await waitFor(() => {
      expect(getByText("Medicine Information")).toBeTruthy();
      expect(getByText("Amoxicillin")).toBeTruthy();
      expect(getByText("Continue to Details")).toBeTruthy();
    });
  });

  it("shows manual entry option when there are no suggestions and continues to details step", async () => {
    (globalAny.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/medicines/autocomplete")) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    const { getByPlaceholderText, getByText } = render(
      <AddMedicationScreen visible={true} onClose={jest.fn()} />,
    );

    const input = getByPlaceholderText("Search medication name...");

    fireEvent.changeText(input, "MyNewMed");

    await waitFor(() => {
      expect(globalAny.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/medicines/autocomplete"),
      );
    });

    const manualButton = getByText("Continue with Manual Entry");
    fireEvent.press(manualButton);

    await waitFor(() => {
      expect(getByText("Medication Details")).toBeTruthy();
      expect(getByText("User-entered medication")).toBeTruthy();
    });
  });

  it("enables saving only when schedule is valid and calls backend + onClose", async () => {
    const onClose = jest.fn();

    (globalAny.fetch as jest.Mock).mockImplementation(
      (url: string, options?: any) => {
        if (url.includes("/medicines/autocomplete")) {
          return Promise.resolve({
            ok: true,
            json: async () => [],
          });
        }
        if (url.includes("/user/medications/")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ id: 123 }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      },
    );

    const { getByPlaceholderText, getByText } = render(
      <AddMedicationScreen visible={true} onClose={onClose} />,
    );

    const input = getByPlaceholderText("Search medication name...");

    fireEvent.changeText(input, "MyManualMed");

    await waitFor(() => {
      expect(getByText("Medicine not found?")).toBeTruthy();
    });

    fireEvent.press(getByText("Continue with Manual Entry"));

    await waitFor(() => {
      expect(getByText("Medication Details")).toBeTruthy();
      expect(getByText("MyManualMed")).toBeTruthy();
    });

    // Strength
    const strengthSelect = getByText("Select strength");
    fireEvent.press(strengthSelect);
    fireEvent.press(getByText("Low"));

    // Quantity
    const quantitySelect = getByText("How many pills?");
    fireEvent.press(quantitySelect);
    fireEvent.press(getByText("1 tablet"));

    // To schedule
    const toScheduleBtn = getByText("Continue to Schedule");
    fireEvent.press(toScheduleBtn);

    await waitFor(() => {
      expect(getByText("Set Reminder Schedule")).toBeTruthy();
    });

    const mondayChip = getByText("Mon");
    fireEvent.press(mondayChip);

    const timeButton = getByText("Set time 1");
    fireEvent.press(timeButton);

    const doneButton = getByText("Done");
    fireEvent.press(doneButton);

    const saveButton = getByText("Save Medication");
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(globalAny.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/user/medications/"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer fake-jwt",
          }),
        }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  // --- Edge-case tests ---

  it("navigates back from manual entry details (step 3) to search (step 1) without closing modal", async () => {
    const onClose = jest.fn();

    (globalAny.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/medicines/autocomplete")) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    const { getByPlaceholderText, getByText, getByTestId, getAllByText } = render(
    <AddMedicationScreen visible={true} onClose={onClose} />,
    );

    const input = getByPlaceholderText("Search medication name...");
    fireEvent.changeText(input, "ManualBackMed");

    await waitFor(() => {
      expect(getByText("Medicine not found?")).toBeTruthy();
    });

    fireEvent.press(getByText("Continue with Manual Entry"));

    await waitFor(() => {
      expect(getByText("Medication Details")).toBeTruthy();
      expect(getByText("ManualBackMed")).toBeTruthy();
      expect(getByText("3/4")).toBeTruthy();
    });

    // Press header back button (requires testID="back-button" in component)
    fireEvent.press(getByTestId("back-button"));

    await waitFor(() => {
    expect(getAllByText("Add Medication").length).toBeGreaterThan(0);
    expect(
        getByText("Search for your medication or scan the barcode"),
    ).toBeTruthy();
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when back is pressed on step 1", async () => {
    const onClose = jest.fn();

    const { getByTestId } = render(
      <AddMedicationScreen visible={true} onClose={onClose} />,
    );

    // We're on step 1 ("1/4") by default – pressing back should close
    fireEvent.press(getByTestId("back-button"));

    expect(onClose).toHaveBeenCalled();
  });

  it("goes to info step when medicine is detected via OCR scanner", async () => {
    (globalAny.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/medicines/search?query=DetectedMed")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            brand_name: "DetectedMed",
            generic_name: "Detected Generic",
            dosage: "1 tab daily",
            manufacturer: "OCR Pharma",
            indications: "Some indication",
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => [],
      });
    });

    const { getByText, getByTestId, queryByTestId } = render(
      <AddMedicationScreen visible={true} onClose={jest.fn()} />,
    );

    fireEvent.press(getByText("Use Image"));

    expect(getByTestId("ocr-scanner")).toBeTruthy();

    fireEvent.press(getByTestId("ocr-detect-button"));

    await waitFor(() => {
      expect(queryByTestId("ocr-scanner")).toBeNull();
      expect(getByText("Medicine Information")).toBeTruthy();
      expect(getByText("DetectedMed")).toBeTruthy();
    });
  });

  it("allows 'As Needed' frequency to save without days or times", async () => {
    const onClose = jest.fn();

    (globalAny.fetch as jest.Mock).mockImplementation(
      (url: string, options?: any) => {
        if (url.includes("/medicines/autocomplete")) {
          return Promise.resolve({
            ok: true,
            json: async () => [],
          });
        }
        if (url.includes("/user/medications/")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ id: 456 }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      },
    );

    const { getByPlaceholderText, getByText } = render(
      <AddMedicationScreen visible={true} onClose={onClose} />,
    );

    const input = getByPlaceholderText("Search medication name...");
    fireEvent.changeText(input, "AsNeededMed");

    await waitFor(() => {
      expect(getByText("Medicine not found?")).toBeTruthy();
    });

    fireEvent.press(getByText("Continue with Manual Entry"));

    await waitFor(() => {
      expect(getByText("Medication Details")).toBeTruthy();
    });

    // Strength & quantity
    fireEvent.press(getByText("Select strength"));
    fireEvent.press(getByText("Low"));

    fireEvent.press(getByText("How many pills?"));
    fireEvent.press(getByText("1 tablet"));

    fireEvent.press(getByText("Continue to Schedule"));

    await waitFor(() => {
      expect(getByText("Set Reminder Schedule")).toBeTruthy();
    });

    // Frequency -> As Needed
    fireEvent.press(getByText("Daily")); // default label in frequency select
    fireEvent.press(getByText("As Needed"));

    await waitFor(() => {
      expect(getByText("As Needed Medication")).toBeTruthy();
    });

    const saveButton = getByText("Save Medication");
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(globalAny.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/user/medications/"),
        expect.objectContaining({
          method: "POST",
        }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("sets start and end dates with calendar and clears end date", async () => {
    (globalAny.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/medicines/autocomplete")) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    const {
      getByPlaceholderText,
      getByText,
      getByTestId,
      queryByText,
      getAllByText,
    } = render(<AddMedicationScreen visible={true} onClose={jest.fn()} />);

    const input = getByPlaceholderText("Search medication name...");
    fireEvent.changeText(input, "CalendarMed");

    await waitFor(() => {
      expect(getByText("Medicine not found?")).toBeTruthy();
    });

    fireEvent.press(getByText("Continue with Manual Entry"));

    await waitFor(() => {
      expect(getByText("Medication Details")).toBeTruthy();
    });

    fireEvent.press(getByText("Select strength"));
    fireEvent.press(getByText("Low"));

    fireEvent.press(getByText("How many pills?"));
    fireEvent.press(getByText("1 tablet"));

    fireEvent.press(getByText("Continue to Schedule"));

    await waitFor(() => {
      expect(getByText("Set Reminder Schedule")).toBeTruthy();
    });

    // Open start date calendar
    const startButton = getByText("Start").parent?.parent ?? getByText("Start");
    fireEvent.press(startButton);

    await waitFor(() => {
      expect(getByText("Select Start Date")).toBeTruthy();
    });

    fireEvent.press(getByTestId("calendar"));

    await waitFor(() => {
      // Calendar modal should close; start date text should update to 2025-01-01
      expect(queryByText("Select Start Date")).toBeNull();
      const startDates = getAllByText("2025-01-01");
      expect(startDates.length).toBeGreaterThan(0);
    });

    // Open end date calendar
    const endButton = getByText("End").parent?.parent ?? getByText("End");
    fireEvent.press(endButton);

    await waitFor(() => {
      expect(getByText("Select End Date")).toBeTruthy();
    });

    fireEvent.press(getByTestId("calendar"));

    await waitFor(() => {
      expect(queryByText("Select End Date")).toBeNull();
      const endDates = getAllByText("2025-01-01");
      expect(endDates.length).toBeGreaterThan(0);
    });

    // Open end date again and clear
    fireEvent.press(endButton);

    await waitFor(() => {
      expect(getByText("Select End Date")).toBeTruthy();
    });

    fireEvent.press(getByText("Clear End Date (Ongoing)"));

    await waitFor(() => {
      expect(queryByText("Select End Date")).toBeNull();
      expect(getByText("Ongoing")).toBeTruthy();
    });
  });

  it("shows multiple time inputs when timesPerDay is changed", async () => {
    (globalAny.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/medicines/autocomplete")) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    const { getByPlaceholderText, getByText, getAllByText } = render(
      <AddMedicationScreen visible={true} onClose={jest.fn()} />,
    );

    const input = getByPlaceholderText("Search medication name...");
    fireEvent.changeText(input, "TimesPerDayMed");

    await waitFor(() => {
      expect(getByText("Medicine not found?")).toBeTruthy();
    });

    fireEvent.press(getByText("Continue with Manual Entry"));

    await waitFor(() => {
      expect(getByText("Medication Details")).toBeTruthy();
    });

    fireEvent.press(getByText("Select strength"));
    fireEvent.press(getByText("Low"));

    fireEvent.press(getByText("How many pills?"));
    fireEvent.press(getByText("1 tablet"));

    fireEvent.press(getByText("Continue to Schedule"));

    await waitFor(() => {
      expect(getByText("Set Reminder Schedule")).toBeTruthy();
    });

    // Default: 1 time per day
    expect(getByText("Set time 1")).toBeTruthy();

    // Change timesPerDay to 3
    fireEvent.press(getByText("1 time"));
    fireEvent.press(getByText("3 times per day"));

    await waitFor(() => {
      const timeButtons = getAllByText(/Set time \d/);
      expect(timeButtons.length).toBe(3);
    });
  });

  it("does not call backend when saving without a JWT token", async () => {
    const onClose = jest.fn();

    // No token
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    (globalAny.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/medicines/autocomplete")) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }
      if (url.includes("/user/medications/")) {
        // This should NOT be hit
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: 999 }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    const { getByPlaceholderText, getByText } = render(
      <AddMedicationScreen visible={true} onClose={onClose} />,
    );

    const input = getByPlaceholderText("Search medication name...");
    fireEvent.changeText(input, "NoTokenMed");

    await waitFor(() => {
      expect(getByText("Medicine not found?")).toBeTruthy();
    });

    fireEvent.press(getByText("Continue with Manual Entry"));

    await waitFor(() => {
      expect(getByText("Medication Details")).toBeTruthy();
    });

    fireEvent.press(getByText("Select strength"));
    fireEvent.press(getByText("Low"));

    fireEvent.press(getByText("How many pills?"));
    fireEvent.press(getByText("1 tablet"));

    fireEvent.press(getByText("Continue to Schedule"));

    await waitFor(() => {
      expect(getByText("Set Reminder Schedule")).toBeTruthy();
    });

    const mondayChip = getByText("Mon");
    fireEvent.press(mondayChip);

    const timeButton = getByText("Set time 1");
    fireEvent.press(timeButton);
    fireEvent.press(getByText("Done"));

    const saveButton = getByText("Save Medication");
    fireEvent.press(saveButton);

    await waitFor(() => {
      // No POST should be made
      expect(
        (globalAny.fetch as jest.Mock).mock.calls.find((call: any[]) =>
          String(call[0]).includes("/user/medications/"),
        ),
      ).toBeUndefined();
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
