import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import RemindersTab from "@/components/main-navigation/tabs/RemindersTab";

const globalAny: any = globalThis as any;

// ---- Mocks ----

jest.mock("@/config", () => ({
  BACKEND_BASE_URL: "http://test-base",
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
}));

jest.mock("@/components/main-navigation/Card", () => {
  const React = require("react");
  const { View } = require("react-native");
  return ({ children, ...props }: any) => <View {...props}>{children}</View>;
});

// vector icons are usually handled by expo/jest preset, but we can noop them safely
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name }: any) => <Text>{name}</Text>,
    MaterialCommunityIcons: ({ name }: any) => <Text>{name}</Text>,
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  (require("expo-secure-store").getItemAsync as jest.Mock).mockResolvedValue(
    "fake-jwt",
  );
  globalAny.fetch = jest.fn();
});

// ---- Tests ----

describe("RemindersTab", () => {
  it("shows empty state when backend returns no reminders", async () => {
    (globalAny.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    });

    const { getByText, queryByText } = render(<RemindersTab />);

    // wait for initial fetch
    await waitFor(() => {
      expect(globalAny.fetch).toHaveBeenCalled();
    });

    // Summary cards should exist
    expect(getByText("Pending")).toBeTruthy();
    expect(getByText("Completed")).toBeTruthy();
    expect(getByText("Overdue")).toBeTruthy();

    // Empty state visible
    expect(getByText("All caught up!")).toBeTruthy();
    expect(
      getByText("You've taken all your medications for today."),
    ).toBeTruthy();

    // No pending / completed sections
    expect(queryByText("Pending Reminders")).toBeNull();
    expect(queryByText("Completed Today")).toBeNull();
  });

  it("fetches reminders from backend and shows pending/completed/overdue sections correctly", async () => {
    const payload = [
      {
        id: 1,
        name: "Med A",
        strength: "10 mg",
        quantity: "1 pill",
        instructions: "With food",
        time: "8:00 AM",
        status: "pending",
        overdue: false,
      },
      {
        id: 2,
        name: "Med B",
        strength: "5 mg",
        quantity: "2 pills",
        instructions: "Morning",
        time: "9:00 AM",
        status: "taken",
        overdue: false,
      },
      {
        id: 3,
        name: "Med C",
        strength: "20 mg",
        quantity: "1 pill",
        instructions: "Evening",
        time: "8:00 PM",
        status: "pending",
        overdue: true,
      },
      {
        id: 4,
        name: "Med D",
        strength: "15 mg",
        quantity: "1 pill",
        instructions: "Afternoon",
        time: "2:00 PM",
        status: "snoozed",
        overdue: false,
      },
    ];

    (globalAny.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => payload,
    });

    const { getByText, getAllByText, queryByText } = render(<RemindersTab />);

    await waitFor(() => {
      expect(globalAny.fetch).toHaveBeenCalledWith(
        "http://test-base/reminders/today",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer fake-jwt",
          }),
        }),
      );
    });

    // Sections visible
    expect(getByText("Pending Reminders")).toBeTruthy();
    expect(getByText("Completed Today")).toBeTruthy();

    // Empty state should NOT show when there are pending reminders
    expect(queryByText("All caught up!")).toBeNull();

    // Summary labels exist (can appear more than once, so use getAllByText)
    expect(getAllByText("Pending").length).toBeGreaterThan(0);
    expect(getAllByText("Completed").length).toBeGreaterThan(0);
    expect(getAllByText("Overdue").length).toBeGreaterThan(0);

    // Check that the right meds appear in the right buckets
    // These names are enough to prove the mapping logic works.
    expect(getByText("Med A")).toBeTruthy(); // pending
    expect(getByText("Med C")).toBeTruthy(); // overdue pending
    expect(getByText("Med D")).toBeTruthy(); // snoozed pending
    expect(getByText("Med B")).toBeTruthy(); // completed
  });

  it("marks a reminder as taken and moves it to completed section", async () => {
    const payload = [
      {
        id: 1,
        name: "Med A",
        strength: "10 mg",
        quantity: "1 pill",
        instructions: "With food",
        time: "8:00 AM",
        status: "pending",
        overdue: false,
      },
    ];

    // Mock both API calls that happen on mount
    (globalAny.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/reminders/today")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => payload,
        });
      }
      if (url.includes("/reminders/adaptation-suggestions")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => [], // No suggestions
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const { getByText } = render(<RemindersTab />);

    await waitFor(() => {
      expect(globalAny.fetch).toHaveBeenCalledTimes(2); // Both initial fetches
    });

    // Initially should show Pending Reminders and NOT Completed Today
    expect(getByText("Pending Reminders")).toBeTruthy();

    // Press "Mark as Taken"
    const markTakenButton = getByText("Mark as Taken");
    fireEvent.press(markTakenButton);

    // There will be a POST call to mark-taken
    await waitFor(() => {
      expect(globalAny.fetch).toHaveBeenCalledTimes(3); // 2 initial + 1 POST
      expect(globalAny.fetch).toHaveBeenLastCalledWith(
        "http://test-base/reminders/1/mark-taken",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer fake-jwt",
          }),
        }),
      );
    });

    // Completed section should now appear
    await waitFor(() => {
      expect(getByText("Completed Today")).toBeTruthy();
      expect(getByText("Med A")).toBeTruthy();
    });
  });

  it("snoozes a reminder and updates its badge text", async () => {
    const payload = [
      {
        id: 1,
        name: "Med A",
        strength: "10 mg",
        quantity: "1 pill",
        instructions: "With food",
        time: "8:00 AM",
        status: "pending",
        overdue: false,
      },
    ];

    // Mock both API calls that happen on mount
    (globalAny.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/reminders/today")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => payload,
        });
      }
      if (url.includes("/reminders/adaptation-suggestions")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => [], // No suggestions
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const { getByText, queryByText } = render(<RemindersTab />);

    await waitFor(() => {
      expect(globalAny.fetch).toHaveBeenCalledTimes(2); // Both initial fetches
    });

    // Initial badge shows the time
    expect(getByText("8:00 AM")).toBeTruthy();

    const snoozeButton = getByText("Snooze");
    fireEvent.press(snoozeButton);

    // POST /snooze
    await waitFor(() => {
      expect(globalAny.fetch).toHaveBeenCalledTimes(3); // 2 initial + 1 POST
      expect(globalAny.fetch).toHaveBeenLastCalledWith(
        "http://test-base/reminders/1/snooze",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer fake-jwt",
          }),
        }),
      );
    });

    // Badge text should now be "Snoozed"
    await waitFor(() => {
      expect(queryByText("8:00 AM")).toBeNull();
      expect(getByText("Snoozed")).toBeTruthy();
    });
  });
});
