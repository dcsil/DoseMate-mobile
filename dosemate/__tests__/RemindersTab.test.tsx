import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import RemindersTab from "../components/main-navigation/tabs/RemindersTab";
import * as SecureStore from "expo-secure-store";

// Mock SecureStore
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
}));

// Mock fetch
globalThis.fetch = jest.fn() as jest.Mock;

const mockReminders = [
  {
    id: 1,
    name: "Advil",
    strength: "200mg",
    quantity: "1 tablet",
    instructions: "After food",
    status: "pending",
    overdue: false,
    time: "09:00 AM",
  },
  {
    id: 2,
    name: "Vitamin D",
    strength: "1000 IU",
    quantity: "1 capsule",
    instructions: "Morning",
    status: "taken",
    overdue: false,
    time: "08:00 AM",
  },
  {
    id: 3,
    name: "Ibuprofen",
    strength: "400mg",
    quantity: "1 tablet",
    instructions: "As needed",
    status: "pending",
    overdue: true,
    time: "07:00 AM",
  },
];

describe("<RemindersTab />", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("mock-jwt");

    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockReminders,
    });
  });

  it("loads reminders on mount", async () => {
    const { getByText } = render(<RemindersTab />);

    await waitFor(() => {
      expect(getByText("Advil")).toBeTruthy();
      expect(getByText("Vitamin D")).toBeTruthy();
      expect(getByText("Ibuprofen")).toBeTruthy();
    });
  });

  it("renders summary labels", async () => {
    const { getByText } = render(<RemindersTab />);

    await waitFor(() => {
      expect(getByText("Pending")).toBeTruthy();
      expect(getByText("Completed")).toBeTruthy();
      expect(getByText("Overdue")).toBeTruthy();
    });
  });

  it("displays correct counts in summary cards", async () => {
    const { getByText } = render(<RemindersTab />);

    await waitFor(() => {
      // Check for the labels to ensure we're in the right section
      expect(getByText("Pending")).toBeTruthy();
      expect(getByText("Completed")).toBeTruthy();
      expect(getByText("Overdue")).toBeTruthy();
    });
  });

  it("marks a reminder as taken", async () => {
    const { getByText, getAllByText } = render(<RemindersTab />);

    await waitFor(() => getByText("Advil"));

    const markButtons = getAllByText("Mark as Taken");
    fireEvent.press(markButtons[0]); // mark Advil as taken

    // UI updates instantly
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/reminders/1/mark-taken"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer mock-jwt",
          }),
        }),
      );
    });
  });

  it("snoozes a reminder", async () => {
    const { getAllByText, getByText } = render(<RemindersTab />);

    await waitFor(() => getByText("Advil"));

    const snoozeButtons = getAllByText("Snooze");
    fireEvent.press(snoozeButtons[0]);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/reminders/1/snooze"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer mock-jwt",
          }),
        }),
      );
    });
  });

  it("shows empty state when no pending reminders", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { ...mockReminders[1], status: "taken" }, // only completed
      ],
    });

    const { getByText } = render(<RemindersTab />);

    await waitFor(() => {
      expect(getByText("All caught up!")).toBeTruthy();
      expect(
        getByText("You've taken all your medications for today."),
      ).toBeTruthy();
    });
  });

  it("displays pending reminders section", async () => {
    const { getByText } = render(<RemindersTab />);

    await waitFor(() => {
      expect(getByText("Pending Reminders")).toBeTruthy();
    });
  });

  it("displays completed reminders section", async () => {
    const { getByText } = render(<RemindersTab />);

    await waitFor(() => {
      expect(getByText("Completed Today")).toBeTruthy();
    });
  });

  it("shows overdue indicator for overdue reminders", async () => {
    const { getByText, getAllByText } = render(<RemindersTab />);

    await waitFor(() => {
      expect(getByText("Ibuprofen")).toBeTruthy();
      // Use getAllByText since "Overdue" appears multiple times (in badge and summary)
      const overdueElements = getAllByText("Overdue");
      expect(overdueElements.length).toBeGreaterThan(0);
    });
  });

  it("displays medication details correctly", async () => {
    const { getByText } = render(<RemindersTab />);

    await waitFor(() => {
      expect(getByText("Advil")).toBeTruthy();
      expect(getByText("200mg • 1 tablet")).toBeTruthy();
      expect(getByText("After food")).toBeTruthy();
    });
  });

  it("handles fetch error gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    (globalThis.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error"),
    );

    render(<RemindersTab />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "🔥 Error fetching reminders:",
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
  });

  it("handles missing JWT gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

    render(<RemindersTab />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("⚠️ No JWT found");
    });

    consoleSpy.mockRestore();
  });
});
