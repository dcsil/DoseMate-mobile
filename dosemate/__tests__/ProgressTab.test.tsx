// __tests__/ProgressTab.test.tsx
import React from "react";
import {
  render,
  waitFor,
} from "@testing-library/react-native";
import ProgressTab from "@/components/main-navigation/tabs/ProgressTab";
import {
  registerTestUser,
  getTodaysReminders,
} from "@/components/services/backend";

// Mock the backend service
jest.mock("@/components/services/backend", () => ({
  registerTestUser: jest.fn(),
  getTodaysReminders: jest.fn(),
}));

// Mock icons to simple text to make querying easier
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name }: any) => <Text>{name}</Text>,
    MaterialCommunityIcons: ({ name }: any) => <Text>{name}</Text>,
  };
});

const mockRegisterTestUser = registerTestUser as jest.Mock;
const mockGetTodaysReminders = getTodaysReminders as jest.Mock;

describe("ProgressTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading text initially while fetching reminders", async () => {
    mockRegisterTestUser.mockResolvedValue("fake-token");
    mockGetTodaysReminders.mockResolvedValue([]);

    const { getByText, queryByText } = render(<ProgressTab />);

    // Initial loading state
    expect(getByText("Loading recent activity...")).toBeTruthy();

    await waitFor(() => {
      expect(mockRegisterTestUser).toHaveBeenCalledTimes(1);
      expect(mockGetTodaysReminders).toHaveBeenCalledWith("fake-token");
    });

    // After load finishes, loading text disappears
    expect(queryByText("Loading recent activity...")).toBeNull();
  });

  it("renders main progress, stats, and recent activity when data is available", async () => {
    mockRegisterTestUser.mockResolvedValue("fake-token");
    mockGetTodaysReminders.mockResolvedValue([
      {
        id: 1,
        name: "Morning Med",
        status: "taken",
        time: "08:00 AM",
      },
      {
        id: 2,
        name: "Noon Med",
        status: "taken",
        time: "12:00 PM",
      },
      {
        id: 3,
        name: "Evening Med",
        status: "pending",
        time: "08:00 PM",
      },
    ]);

    const { getByText, queryByText, getAllByText } = render(<ProgressTab />);

    await waitFor(() => {
      expect(mockRegisterTestUser).toHaveBeenCalledTimes(1);
      expect(mockGetTodaysReminders).toHaveBeenCalledTimes(1);
    });

    // No loading / error / empty text now
    expect(queryByText("Loading recent activity...")).toBeNull();
    expect(queryByText("No reminders for today.")).toBeNull();

    // Progress calculation: 2 taken / 3 total → 66.666… → 67%
    expect(getByText("67%")).toBeTruthy();

    // Stat card shows doses taken "2/3"
    expect(getByText("2/3")).toBeTruthy();
    expect(getByText("Doses taken today")).toBeTruthy();

    // Recent Activity section
    expect(getByText("Recent Activity")).toBeTruthy();

    // Each reminder name rendered
    expect(getByText("Morning Med")).toBeTruthy();
    expect(getByText("Noon Med")).toBeTruthy();
    expect(getByText("Evening Med")).toBeTruthy();

    // Times / subtitles (time field in our mock)
    expect(getByText("08:00 AM")).toBeTruthy();
    expect(getByText("12:00 PM")).toBeTruthy();
    expect(getByText("08:00 PM")).toBeTruthy();

    // MaterialCommunityIcons are mocked as text → check / clock-outline
    const checkIcons = getAllByText("check");
    expect(checkIcons.length).toBeGreaterThan(0);

    const clockIcons = getAllByText("clock-outline");
    expect(clockIcons.length).toBeGreaterThan(0);
  });

  it("shows empty state when there are no reminders", async () => {
    mockRegisterTestUser.mockResolvedValue("fake-token");
    mockGetTodaysReminders.mockResolvedValue([]);

    const { getByText, queryByText } = render(<ProgressTab />);

    await waitFor(() => {
      expect(mockRegisterTestUser).toHaveBeenCalledTimes(1);
      expect(mockGetTodaysReminders).toHaveBeenCalledTimes(1);
    });

    // Loading done, no error, empty state shown
    expect(queryByText("Loading recent activity...")).toBeNull();
    expect(queryByText(/Error/i)).toBeNull();
    expect(getByText("No reminders for today.")).toBeTruthy();

    // With 0 reminders, percentage should be 0%
    expect(getByText("0%")).toBeTruthy();
    expect(getByText("0/0")).toBeTruthy();
  });

  it("shows error message when fetching reminders fails", async () => {
    mockRegisterTestUser.mockResolvedValue("fake-token");
    mockGetTodaysReminders.mockRejectedValue(new Error("Network error"));

    const { getByText, queryByText } = render(<ProgressTab />);

    await waitFor(() => {
      expect(mockRegisterTestUser).toHaveBeenCalledTimes(1);
      expect(mockGetTodaysReminders).toHaveBeenCalledTimes(1);
    });

    // No loading text now
    expect(queryByText("Loading recent activity...")).toBeNull();

    // Error message from thrown Error
    expect(getByText("Network error")).toBeTruthy();

    // Empty text should not appear because error takes precedence
    expect(queryByText("No reminders for today.")).toBeNull();
  });

  it("handles reminders without name/time by falling back to defaults", async () => {
    mockRegisterTestUser.mockResolvedValue("fake-token");
    mockGetTodaysReminders.mockResolvedValue([
      {
        id: 10,
        status: "taken",
        // no name, no time, overdue false → should show "Medication" + "Pending"
        overdue: false,
      },
      {
        id: 11,
        status: "pending",
        overdue: true,
        // no explicit time → should show "Overdue"
      },
    ]);

    const { getByText, getAllByText } = render(<ProgressTab />);

    await waitFor(() => {
      expect(mockGetTodaysReminders).toHaveBeenCalledTimes(1);
    });

    // Fallback title for missing name/title
    const fallbackTitles = getAllByText("Medication");
    expect(fallbackTitles.length).toBeGreaterThan(0);


    // Fallback subtitles from status flags
    expect(getByText("Pending")).toBeTruthy();
    expect(getByText("Overdue")).toBeTruthy();
  });
});
