import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import DetailedProgressScreen from "@/components/main-navigation/DetailedProgressScreen";

// --- Mocks ---

// Mock Ionicons so we don't rely on native vector icons
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

// Mock Card to just render children in a simple container
jest.mock("@/components/main-navigation/Card", () => {
  const React = require("react");
  const { View } = require("react-native");
  return ({ children, style }: any) => (
    <View accessibilityRole="summary" style={style}>
      {children}
    </View>
  );
});

// Capture OverviewChartCard props to assert transformation logic
const mockOverviewChartCard = jest.fn(() => null);

jest.mock("@/components/main-navigation/OverviewChartCard", () => {
  const React = require("react");
  return (props: any) => mockOverviewChartCard(props);
});

describe("DetailedProgressScreen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("does not render key content when visible is false", () => {
    const { queryByText } = render(
      <DetailedProgressScreen visible={false} onClose={jest.fn()} />,
    );

    // Modal is mounted but not visible, so user-facing content should not be present
    expect(queryByText("Progress Dashboard")).toBeNull();
    expect(queryByText("This Week's Progress")).toBeNull();
  });

 it("renders the main dashboard sections when visible", () => {
    const onClose = jest.fn();

    const { getByText, getAllByText } = render(
        <DetailedProgressScreen visible={true} onClose={onClose} />,
    );

    // Header
    expect(getByText("Progress Dashboard")).toBeTruthy();

    // Time range selector
    expect(getByText("Week")).toBeTruthy();
    expect(getByText("Month")).toBeTruthy();
    expect(getByText("Year")).toBeTruthy();

    // Weekly stats cards
    expect(getByText("This Week")).toBeTruthy();
    expect(getByText("Overall Adherence")).toBeTruthy();
    expect(getByText("Streak")).toBeTruthy();
    expect(getByText("Days in a row")).toBeTruthy();

    // Numeric stats from weeklyStats
    const overallMatches = getAllByText("92%");
    expect(overallMatches.length).toBeGreaterThanOrEqual(1); // overall
    expect(getByText("5")).toBeTruthy(); // streak


    // Progress card
    expect(getByText("This Week's Progress")).toBeTruthy();
    expect(getByText("Complete")).toBeTruthy();
    expect(getByText("Taken")).toBeTruthy();
    expect(getByText("Missed")).toBeTruthy();
    expect(getByText("Total")).toBeTruthy();
    expect(getByText("26")).toBeTruthy(); // taken
    expect(getByText("2")).toBeTruthy(); // missed
    expect(getByText("28")).toBeTruthy(); // total

    // Medication adherence section
    expect(getByText("Medication Adherence")).toBeTruthy();
    expect(getByText("Metformin")).toBeTruthy();
    expect(getByText("Lisinopril")).toBeTruthy();
    expect(getByText("Atorvastatin")).toBeTruthy();
    expect(getByText("Aspirin")).toBeTruthy();

    // Achievements
    expect(getByText("Achievements")).toBeTruthy();
    expect(getByText("7-Day Streak")).toBeTruthy();
    expect(getByText("Perfect Week")).toBeTruthy();
    expect(getByText("Early Bird")).toBeTruthy();
    expect(getByText("Consistency")).toBeTruthy();

    // Export & share section
    expect(getByText("Share Your Progress")).toBeTruthy();
    expect(
      getByText(
        "Share your adherence report with your healthcare provider to help optimize your treatment.",
      ),
    ).toBeTruthy();
    expect(getByText("Export PDF")).toBeTruthy();
    expect(getByText("Share Report")).toBeTruthy();

    // Motivational card
    expect(getByText("Great job this week!")).toBeTruthy();
    expect(
      getByText(
        "You've maintained a {weeklyStats.overall}% adherence rate. Keep up the excellent work!",
      ),
    ).toBeTruthy();
    expect(getByText("Goal: 90% adherence rate")).toBeTruthy();
  });

  it("calls onClose when the back button container is pressed", () => {
    const onClose = jest.fn();

    const { getByText } = render(
      <DetailedProgressScreen visible={true} onClose={onClose} />,
    );

    // Our Ionicons mock renders <Text>arrow-back</Text> inside the TouchableOpacity
    const backIconText = getByText("arrow-back");

    // Press the icon; in practice, the test env will invoke the onPress of the wrapper
    fireEvent.press(backIconText);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("time range buttons are pressable and remain rendered", () => {
    const { getByText } = render(
      <DetailedProgressScreen visible={true} onClose={jest.fn()} />,
    );

    const weekButton = getByText("Week");
    const monthButton = getByText("Month");
    const yearButton = getByText("Year");

    fireEvent.press(monthButton);
    fireEvent.press(yearButton);
    fireEvent.press(weekButton);

    // Still rendered after state changes
    expect(getByText("Week")).toBeTruthy();
    expect(getByText("Month")).toBeTruthy();
    expect(getByText("Year")).toBeTruthy();
  });

  it("passes correct data and flags to OverviewChartCard", () => {
    render(<DetailedProgressScreen visible={true} onClose={jest.fn()} />);

    expect(mockOverviewChartCard).toHaveBeenCalledTimes(1);

    const props = mockOverviewChartCard.mock.calls[0][0];

    const expectedData = [
      { day: "Mon", score: 100 },
      { day: "Tue", score: 75 },
      { day: "Wed", score: 100 },
      { day: "Thu", score: 100 },
      { day: "Fri", score: 50 },
      { day: "Sat", score: 100 },
      { day: "Sun", score: 100 },
    ];

    expect(props.data).toEqual(expectedData);
    expect(props.timeRange).toBe("week");
    expect(props.showIcon).toBe(false);
    expect(props.showDetailsButton).toBe(false);
  });

 it("renders all medication percentages from medicationBreakdown", () => {
    const { getByText, getAllByText } = render(
        <DetailedProgressScreen visible={true} onClose={jest.fn()} />,
    );

    // Values: 95, 88, 92, 97
    expect(getByText("95%")).toBeTruthy();
    expect(getByText("88%")).toBeTruthy();

    // 92% appears both as overall and for Atorvastatin – at least one match is fine
    const ninetyTwos = getAllByText("92%");
    expect(ninetyTwos.length).toBeGreaterThanOrEqual(1);

    expect(getByText("97%")).toBeTruthy();
 });


  it("shows correct number of 'Achieved' and 'Locked' badges", () => {
    const { getAllByText } = render(
      <DetailedProgressScreen visible={true} onClose={jest.fn()} />,
    );

    // achievements: 3 achieved, 1 locked
    const achievedBadges = getAllByText("Achieved");
    const lockedBadges = getAllByText("Locked");

    expect(achievedBadges.length).toBe(3);
    expect(lockedBadges.length).toBe(1);
  });

  it("renders achievement icons and descriptions", () => {
    const { getByText } = render(
      <DetailedProgressScreen visible={true} onClose={jest.fn()} />,
    );

    // Icons (as plain text because of Ionicons/emoji)
    expect(getByText("🔥")).toBeTruthy();
    expect(getByText("⭐")).toBeTruthy();
    expect(getByText("🌅")).toBeTruthy();
    expect(getByText("🎯")).toBeTruthy();

    // Descriptions
    expect(
      getByText("Took medication 7 days in a row"),
    ).toBeTruthy();
    expect(
      getByText("100% adherence for a week"),
    ).toBeTruthy();
    expect(
      getByText("Took morning meds on time 10 times"),
    ).toBeTruthy();
    expect(
      getByText("90%+ adherence for a month"),
    ).toBeTruthy();
  });

  it("allows pressing export and share report buttons without errors", () => {
    const { getByText } = render(
      <DetailedProgressScreen visible={true} onClose={jest.fn()} />,
    );

    const exportPdfButton = getByText("Export PDF");
    const shareReportButton = getByText("Share Report");

    fireEvent.press(exportPdfButton);
    fireEvent.press(shareReportButton);

    expect(exportPdfButton).toBeTruthy();
    expect(shareReportButton).toBeTruthy();
  });

  it("renders key Ionicons names from the mock", () => {
    const { getByText, getAllByText } = render(
        <DetailedProgressScreen visible={true} onClose={jest.fn()} />,
    );

    // Header & stats icons
    expect(getByText("arrow-back")).toBeTruthy();

    const shareIcons = getAllByText("share-outline");
    expect(shareIcons.length).toBeGreaterThanOrEqual(1);

    expect(getByText("trending-up")).toBeTruthy();

    const trophyIcons = getAllByText("trophy");
    expect(trophyIcons.length).toBeGreaterThanOrEqual(1);

    // Export icons
    expect(getByText("download-outline")).toBeTruthy();
    expect(getByText("flag-outline")).toBeTruthy();
  });


 it("renders motivational goal and trophy icon", () => {
    const { getByText, getAllByText } = render(
        <DetailedProgressScreen visible={true} onClose={jest.fn()} />,
    );

    const trophyIcons = getAllByText("trophy");
    expect(trophyIcons.length).toBeGreaterThanOrEqual(1);

    expect(getByText("Great job this week!")).toBeTruthy();
    expect(
        getByText("Goal: 90% adherence rate"),
    ).toBeTruthy();
  });
});
