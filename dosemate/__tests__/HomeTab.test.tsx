// __tests__/HomeTab.test.tsx
import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import HomeTab from "@/components/main-navigation/tabs/HomeTab";
import * as SecureStore from "expo-secure-store";
import { Alert, Linking } from "react-native";

declare const global: any;
const globalAny: any = global as any;

// --- Child component mocks to keep tests focused on logic/UI wiring ---

jest.mock("@/components/main-navigation/StatsCard", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  const Mock = ({ label, value }: any) => (
    <View testID={`stats-${label}`}>
      <Text>{label}</Text>
      <Text>{value}</Text>
    </View>
  );
  return Mock;
});

jest.mock("@/components/main-navigation/NextReminderCard", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return ({ name, strength, time, onViewPress }: any) => (
    <View testID="next-reminder-card">
      <Text>{name}</Text>
      <Text>{strength}</Text>
      <Text>{time}</Text>
      <TouchableOpacity testID="next-reminder-view" onPress={onViewPress}>
        <Text>View</Text>
      </TouchableOpacity>
    </View>
  );
});

jest.mock("@/components/main-navigation/AdherenceProgressCard", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return ({ todayData, weekData, monthData }: any) => (
    <View testID="adherence-progress-card">
      <Text>{todayData?.label}</Text>
      <Text>{weekData?.label}</Text>
      <Text>{monthData?.label}</Text>
    </View>
  );
});

jest.mock("@/components/main-navigation/MotivationalCard", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return ({ title, message, badgeText }: any) => (
    <View testID="motivational-card">
      <Text>{title}</Text>
      <Text>{badgeText}</Text>
      <Text>{message}</Text>
    </View>
  );
});

jest.mock("@/components/main-navigation/OverviewChartCard", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return ({ data, timeRange, onViewDetails }: any) => (
    <View testID="overview-chart-card">
      <Text>{timeRange}</Text>
      <Text>Points: {data?.length ?? 0}</Text>
      <TouchableOpacity testID="overview-view-details" onPress={onViewDetails}>
        <Text>View Details</Text>
      </TouchableOpacity>
    </View>
  );
});

jest.mock("@/components/main-navigation/RecentActivityCard", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return ({ activities }: any) => (
    <View testID="recent-activity-card">
      {activities.map((a: any) => (
        <Text key={a.id}>{a.name}</Text>
      ))}
    </View>
  );
});

jest.mock("@/components/main-navigation/ShareHealthcareCard", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return ({ onWeeklyReport, onMonthlyReport, onGenerateShare }: any) => (
    <View testID="share-healthcare-card">
      <TouchableOpacity testID="share-weekly-button" onPress={onWeeklyReport}>
        <Text>Weekly</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="share-monthly-button" onPress={onMonthlyReport}>
        <Text>Monthly</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="share-generate-button"
        onPress={onGenerateShare}
      >
        <Text>Share</Text>
      </TouchableOpacity>
    </View>
  );
});

// --- SecureStore mock ---
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
}));

// --- Helpers ---

const renderHomeTab = (overrides?: {
  onViewReminder?: () => void;
  onViewDetails?: () => void;
}) =>
  render(
    <HomeTab
      onViewReminder={overrides?.onViewReminder ?? jest.fn()}
      onViewDetails={overrides?.onViewDetails ?? jest.fn()}
    />,
  );

const setupFullDataFetchMock = () => {
  (globalAny.fetch as jest.Mock)
    // /reminders/today
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: "1",
          name: "Morning Med",
          strength: "50 mg",
          quantity: "1 tab",
          time: "8:00 AM",
          status: "pending",
          overdue: false,
          instructions: "With water",
        },
      ],
    })
    // /reminders/adherence/today
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        taken: 1,
        missed: 0,
        pending: 0,
        total: 1,
        percentage: 100,
      }),
    })
    // /reminders/adherence/week
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        days: [
          {
            date: "2025-01-01",
            day: "M",
            taken: 1,
            total: 1,
            percentage: 100,
            is_today: true,
          },
        ],
        summary: {
          taken: 1,
          total: 1,
          percentage: 100,
          perfect_days: 1,
          current_streak: 1,
        },
      }),
    })
    // /reminders/adherence/month
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        summary: {
          taken: 25,
          missed: 0,
          total: 25,
          percentage: 100,
        },
      }),
    })
    // /reminders/recent-activity
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: "ra1",
          medication_name: "Morning Med",
          strength: "50 mg",
          taken_at: "2025-01-01T08:00:00Z",
          display_time: "8:00 AM",
          status: "taken",
        },
      ],
    });
};

// --- Spies for Alert + Linking ---

const alertMock = jest.spyOn(Alert, "alert");
const openUrlMock = jest.spyOn(Linking, "openURL");

beforeEach(() => {
  jest.clearAllMocks();

  (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("fake-jwt");

  globalAny.fetch = jest.fn();

  alertMock.mockImplementation(() => {});
  openUrlMock.mockResolvedValue(undefined as any);
});

// --- Tests ---

describe("HomeTab", () => {
  it("shows error state when user is not logged in (no JWT)", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

    const { getByText } = renderHomeTab();

    await waitFor(() => {
      expect(getByText("Not logged in")).toBeTruthy();
    });

    expect(getByText("Pull down to retry")).toBeTruthy();
    expect(globalAny.fetch).not.toHaveBeenCalled();
  });

  it("shows generic error when data load fails (fetch throws)", async () => {
    (globalAny.fetch as jest.Mock).mockImplementation(() => {
      throw new Error("network fail");
    });

    const { getByText } = renderHomeTab();

    await waitFor(() => {
      expect(getByText("Failed to load data")).toBeTruthy();
    });
    expect(getByText("Pull down to retry")).toBeTruthy();
  });

  it("shows empty state when there are no medications scheduled for today", async () => {
    (globalAny.fetch as jest.Mock)
      // /reminders/today
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      // /reminders/adherence/today
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          taken: 0,
          missed: 0,
          pending: 0,
          total: 0,
          percentage: 0,
        }),
      })
      // /reminders/adherence/week
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          days: [],
          summary: {
            taken: 0,
            total: 0,
            percentage: 0,
            perfect_days: 0,
            current_streak: 0,
          },
        }),
      })
      // /reminders/adherence/month
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          summary: {
            taken: 0,
            missed: 0,
            total: 0,
            percentage: 0,
          },
        }),
      })
      // /reminders/recent-activity
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { getByText } = renderHomeTab();

    await waitFor(() => {
      expect(getByText("No medications scheduled for today")).toBeTruthy();
    });

    expect(
      getByText("Add medications to start tracking your adherence"),
    ).toBeTruthy();
  });

  it("renders main dashboard with stats, next reminder, chart, activity and share card when data is available", async () => {
    setupFullDataFetchMock();

    const onViewReminder = jest.fn();
    const onViewDetails = jest.fn();

    const { getByTestId, getByText, getAllByText } = renderHomeTab({
      onViewReminder,
      onViewDetails,
    });

    // Stats
    await waitFor(() => {
      expect(getByTestId("stats-Today's Meds")).toBeTruthy();
      expect(getByTestId("stats-Today")).toBeTruthy();
    });

    expect(getByText("Today's Meds")).toBeTruthy();

    // "Today" appears both as stats label and maybe elsewhere, so use getAllByText
    const todayNodes = getAllByText("Today");
    expect(todayNodes.length).toBeGreaterThan(0);

    // Streak badge (1 day streak)
    expect(getByText("1 Day Streak")).toBeTruthy();
    expect(getByText("Keep it going!")).toBeTruthy();

    // Next reminder
    expect(getByTestId("next-reminder-card")).toBeTruthy();

    // "Morning Med" appears in both next reminder and recent activity
    const morningNodes = getAllByText("Morning Med");
    expect(morningNodes.length).toBeGreaterThan(0);

    expect(getByText("50 mg")).toBeTruthy();
    expect(getByText("8:00 AM")).toBeTruthy();

    // Adherence progress
    expect(getByTestId("adherence-progress-card")).toBeTruthy();

    // Motivational card – Perfect Day branch
    expect(getByTestId("motivational-card")).toBeTruthy();
    expect(getByText("Perfect Day!")).toBeTruthy();
    expect(getByText("100% Today")).toBeTruthy();

    // Weekly chart
    expect(getByTestId("overview-chart-card")).toBeTruthy();
    expect(getByText("week")).toBeTruthy();

    // Recent activity
    expect(getByTestId("recent-activity-card")).toBeTruthy();

    const morningActivityNodes = getAllByText("Morning Med");
    expect(morningActivityNodes.length).toBeGreaterThan(0);

    // Share healthcare card
    expect(getByTestId("share-healthcare-card")).toBeTruthy();

    // Wiring: tapping "View Details" on chart calls onViewDetails
    fireEvent.press(getByTestId("overview-view-details"));
    expect(onViewDetails).toHaveBeenCalled();

    // Wiring: tapping "View" on next reminder calls onViewReminder
    fireEvent.press(getByTestId("next-reminder-view"));
    expect(onViewReminder).toHaveBeenCalled();
  });

  it("does not render chart when weekly adherence has no day data", async () => {
    (globalAny.fetch as jest.Mock)
      // reminders
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "1",
            name: "AnyMed",
            strength: "10 mg",
            quantity: "1",
            time: "9:00 AM",
            status: "pending",
            overdue: false,
            instructions: "",
          },
        ],
      })
      // today adherence
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          taken: 1,
          missed: 0,
          pending: 0,
          total: 1,
          percentage: 100,
        }),
      })
      // weekly adherence: no days
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          days: [],
          summary: {
            taken: 1,
            total: 1,
            percentage: 100,
            perfect_days: 1,
            current_streak: 1,
          },
        }),
      })
      // monthly adherence
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          summary: {
            taken: 10,
            missed: 0,
            total: 10,
            percentage: 100,
          },
        }),
      })
      // recent activity
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { queryByTestId, getByTestId } = renderHomeTab();

    await waitFor(() => {
      expect(getByTestId("adherence-progress-card")).toBeTruthy();
    });

    // chartData.length === 0, so card hidden
    expect(queryByTestId("overview-chart-card")).toBeNull();
  });

  it("shows welcome motivational card when weekly adherence is missing", async () => {
    (globalAny.fetch as jest.Mock)
      // reminders
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "1",
            name: "AnyMed",
            strength: "10 mg",
            quantity: "1",
            time: "9:00 AM",
            status: "pending",
            overdue: false,
            instructions: "",
          },
        ],
      })
      // today adherence (non-zero total)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          taken: 1,
          missed: 0,
          pending: 0,
          total: 1,
          percentage: 100,
        }),
      })
      // weekly adherence NOT ok => remains null
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      })
      // monthly adherence
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          summary: {
            taken: 5,
            missed: 0,
            total: 5,
            percentage: 100,
          },
        }),
      })
      // recent activity
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { getByTestId, getByText } = renderHomeTab();

    await waitFor(() => {
      expect(getByTestId("motivational-card")).toBeTruthy();
    });

    expect(getByText("Welcome to DoseMate!")).toBeTruthy();
    expect(getByText("Start tracking your medications today")).toBeTruthy();
  });

  it("shows 'Great Streak' motivational card and 'You're on fire!' badge for 3-day streak", async () => {
    (globalAny.fetch as jest.Mock)
      // reminders
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      // today adherence (non-perfect to avoid Perfect Day branch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          taken: 2,
          missed: 1,
          pending: 0,
          total: 3,
          percentage: 66,
        }),
      })
      // weekly adherence with streak 3
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          days: [
            {
              date: "2025-01-01",
              day: "M",
              taken: 1,
              total: 1,
              percentage: 100,
              is_today: false,
            },
          ],
          summary: {
            taken: 7,
            total: 10,
            percentage: 70,
            perfect_days: 3,
            current_streak: 3,
          },
        }),
      })
      // monthly adherence
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          summary: {
            taken: 20,
            missed: 5,
            total: 25,
            percentage: 80,
          },
        }),
      })
      // recent activity
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { getByTestId, getByText, getAllByText } = renderHomeTab();

    await waitFor(() => {
      expect(getByTestId("motivational-card")).toBeTruthy();
    });

    // Motivation branch: streak >= 3 && < 7
    expect(getByText("🌟 Great Streak!")).toBeTruthy();

    // "3 Day Streak" appears in both streak badge and motivational badge
    const nodes = getAllByText("3 Day Streak");
    expect(nodes.length).toBeGreaterThan(0);

    // Streak badge subtext for >1 day
    expect(getByText("You're on fire!")).toBeTruthy();
  });

  it("shows 'Incredible Streak' motivational card for 7-day streak", async () => {
    (globalAny.fetch as jest.Mock)
      // reminders
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      // today adherence
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          taken: 3,
          missed: 0,
          pending: 0,
          total: 3,
          percentage: 100,
        }),
      })
      // weekly adherence with streak 7
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          days: [],
          summary: {
            taken: 21,
            total: 21,
            percentage: 100,
            perfect_days: 7,
            current_streak: 7,
          },
        }),
      })
      // monthly adherence
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          summary: {
            taken: 30,
            missed: 0,
            total: 30,
            percentage: 100,
          },
        }),
      })
      // recent activity
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { getByTestId, getByText, getAllByText } = renderHomeTab();

    await waitFor(() => {
      expect(getByTestId("motivational-card")).toBeTruthy();
    });

    expect(getByText("🔥 Incredible Streak!")).toBeTruthy();

    // Again, text appears in multiple places
    const nodes = getAllByText("7 Day Streak");
    expect(nodes.length).toBeGreaterThan(0);
  });

  it("shows 'Excellent Week' motivational card when weekPct >= 90", async () => {
    (globalAny.fetch as jest.Mock)
      // reminders
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      // today adherence (not perfect)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          taken: 2,
          missed: 1,
          pending: 0,
          total: 3,
          percentage: 66,
        }),
      })
      // weekly adherence, high pct, no streak
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          days: [],
          summary: {
            taken: 9,
            total: 10,
            percentage: 90,
            perfect_days: 0,
            current_streak: 0,
          },
        }),
      })
      // monthly adherence
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          summary: {
            taken: 25,
            missed: 3,
            total: 28,
            percentage: 89,
          },
        }),
      })
      // recent activity
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { getByTestId, getByText } = renderHomeTab();

    await waitFor(() => {
      expect(getByTestId("motivational-card")).toBeTruthy();
    });

    expect(getByText("Excellent Week!")).toBeTruthy();
    expect(getByText("Above Target")).toBeTruthy();
  });

  it("shows 'Good Progress' motivational card when weekPct is between 70 and 89", async () => {
    (globalAny.fetch as jest.Mock)
      // reminders
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      // today adherence
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          taken: 2,
          missed: 1,
          pending: 0,
          total: 3,
          percentage: 66,
        }),
      })
      // weekly adherence mid range
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          days: [],
          summary: {
            taken: 7,
            total: 10,
            percentage: 70,
            perfect_days: 0,
            current_streak: 0,
          },
        }),
      })
      // monthly adherence
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          summary: {
            taken: 15,
            missed: 5,
            total: 20,
            percentage: 75,
          },
        }),
      })
      // recent activity
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { getByTestId, getByText } = renderHomeTab();

    await waitFor(() => {
      expect(getByTestId("motivational-card")).toBeTruthy();
    });

    expect(getByText("Good Progress!")).toBeTruthy();
    expect(getByText("On Track")).toBeTruthy();
  });

  it("shows 'Let's Get Back on Track' motivational card for low adherence", async () => {
    (globalAny.fetch as jest.Mock)
      // reminders
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      // today adherence with pending
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          taken: 1,
          missed: 2,
          pending: 3,
          total: 6,
          percentage: 50,
        }),
      })
      // weekly adherence low
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          days: [],
          summary: {
            taken: 3,
            total: 10,
            percentage: 30,
            perfect_days: 0,
            current_streak: 0,
          },
        }),
      })
      // monthly adherence
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          summary: {
            taken: 10,
            missed: 20,
            total: 30,
            percentage: 33,
          },
        }),
      })
      // recent activity
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { getByTestId, getByText } = renderHomeTab();

    await waitFor(() => {
      expect(getByTestId("motivational-card")).toBeTruthy();
    });

    expect(getByText("Let's Get Back on Track")).toBeTruthy();
    expect(getByText("Needs Attention")).toBeTruthy();
    expect(getByText(/3 medications still pending today/)).toBeTruthy();
  });

  it("handles weekly report generation: alerts and opens URL with token", async () => {
    setupFullDataFetchMock();

    const { getByTestId } = renderHomeTab();

    await waitFor(() => {
      expect(getByTestId("share-healthcare-card")).toBeTruthy();
    });

    fireEvent.press(getByTestId("share-weekly-button"));

    // Alert is async, so use waitFor + search through calls
    await waitFor(() => {
      expect(
        alertMock.mock.calls.some(
          (c) =>
            c[0] === "Generating Report" &&
            c[1] === "Your weekly report is being prepared..." &&
            Array.isArray(c[2]) &&
            c[2].length === 1 &&
            c[2][0].text === "OK",
        ),
      ).toBe(true);
    });

    expect(openUrlMock).toHaveBeenCalled();
    const url = openUrlMock.mock.calls[0][0] as string;
    expect(url).toContain("/reminders/reports/weekly");
    expect(url).toContain("token=fake-jwt");
  });

  it("handles monthly report generation with missing token by showing error alert", async () => {
    setupFullDataFetchMock();

    const getItemMock = SecureStore.getItemAsync as jest.Mock;
    getItemMock.mockReset();
    // First call (loadAllData) -> jwt, second (monthly report) -> null
    getItemMock.mockResolvedValueOnce("fake-jwt").mockResolvedValue(null);

    const { getByTestId } = renderHomeTab();

    await waitFor(() => {
      expect(getByTestId("share-healthcare-card")).toBeTruthy();
    });

    fireEvent.press(getByTestId("share-monthly-button"));

    await waitFor(() => {
      expect(
        alertMock.mock.calls.some(
          (c) => c[0] === "Error" && c[1] === "You're not logged in",
        ),
      ).toBe(true);
    });

    expect(openUrlMock).not.toHaveBeenCalled();
  });

  it("shows error alert if opening monthly report URL fails", async () => {
    setupFullDataFetchMock();
    openUrlMock.mockRejectedValueOnce(new Error("open fail"));

    const { getByTestId } = renderHomeTab();

    await waitFor(() => {
      expect(getByTestId("share-healthcare-card")).toBeTruthy();
    });

    fireEvent.press(getByTestId("share-monthly-button"));

    await waitFor(() => {
      expect(
        alertMock.mock.calls.some(
          (c) => c[0] === "Error" && c[1] === "Failed to generate report",
        ),
      ).toBe(true);
    });
  });

  it("handleGenerateShare shows share options alert and can trigger weekly/monthly handlers", async () => {
    setupFullDataFetchMock();

    const { getByTestId } = renderHomeTab();

    await waitFor(() => {
      expect(getByTestId("share-healthcare-card")).toBeTruthy();
    });

    // Open the share chooser alert
    fireEvent.press(getByTestId("share-generate-button"));

    expect(alertMock).toHaveBeenCalled();
    const lastCall = alertMock.mock.calls[alertMock.mock.calls.length - 1];
    const [title, message, buttons] = lastCall as any;

    expect(title).toBe("Share Report");
    expect(message).toBe("Which report would you like to share?");
    expect(buttons).toHaveLength(3);
    expect(buttons.map((b: any) => b.text)).toEqual([
      "Weekly Report",
      "Monthly Report",
      "Cancel",
    ]);

    // Trigger Weekly via alert button
    openUrlMock.mockClear();
    await buttons[0].onPress?.();
    expect(openUrlMock).toHaveBeenCalled();
    const weeklyUrl = openUrlMock.mock.calls[0][0] as string;
    expect(weeklyUrl).toContain("/reminders/reports/weekly");

    // Trigger Monthly via alert button
    openUrlMock.mockClear();
    await buttons[1].onPress?.();
    expect(openUrlMock).toHaveBeenCalled();
    const monthlyUrl = openUrlMock.mock.calls[0][0] as string;
    expect(monthlyUrl).toContain("/reminders/reports/monthly");
  });
});
