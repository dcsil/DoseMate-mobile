import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import DetailedProgressScreen from "@/components/main-navigation/DetailedProgressScreen";

// Mock Card as a simple container View to avoid layout complexity
jest.mock("@/components/main-navigation/Card", () => {
  const React = require("react");
  const { View } = require("react-native");

  return ({ children, ...rest }: any) => (
    <View {...rest} testID="mock-card">
      {children}
    </View>
  );
});

// Mock OverviewChartCard to keep render simple but covered
jest.mock("@/components/main-navigation/OverviewChartCard", () => {
  const React = require("react");
  const { View, Text } = require("react-native");

  return ({ timeRange }: any) => (
    <View testID="overview-chart-card">
      <Text>OverviewChartCard</Text>
      <Text>{timeRange}</Text>
    </View>
  );
});

// Mock Ionicons → just render icon name as text
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

describe("DetailedProgressScreen", () => {
  it("renders the main dashboard sections when visible", () => {
    const { getByText, getByTestId, getAllByText } = render(
      <DetailedProgressScreen visible={true} onClose={jest.fn()} />,
    );

    // Header
    expect(getByText("Progress Dashboard")).toBeTruthy();

    // Time range selector buttons
    expect(getByText("Week")).toBeTruthy();
    expect(getByText("Month")).toBeTruthy();
    expect(getByText("Year")).toBeTruthy();

    // Overview stats card / weekly stats
    expect(getByText("This Week's Progress")).toBeTruthy();
    expect(getByText("Taken")).toBeTruthy();
    expect(getByText("Missed")).toBeTruthy();
    expect(getByText("Total")).toBeTruthy();

    // Weekly stats numbers from the component
    // 92% appears multiple times → use getAllByText
    const ninetyTwoPercents = getAllByText("92%");
    expect(ninetyTwoPercents.length).toBeGreaterThan(0);

    expect(getByText("5")).toBeTruthy(); // streak text
    expect(getByText("28")).toBeTruthy(); // total
    expect(getByText("26")).toBeTruthy(); // taken
    expect(getByText("2")).toBeTruthy(); // missed

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
    
    const achievedBadges = getAllByText("Achieved");
    expect(achievedBadges.length).toBeGreaterThan(0);

    const lockedBadges = getAllByText("Locked");
    expect(lockedBadges.length).toBeGreaterThan(0);

    // Export & share card
    expect(getByText("Share Your Progress")).toBeTruthy();
    expect(getByText("Export PDF")).toBeTruthy();
    expect(getByText("Share Report")).toBeTruthy();

    // Motivational block
    expect(getByText("Great job this week!")).toBeTruthy();
    expect(getByText("Goal: 90% adherence rate")).toBeTruthy();

    // Chart mock
    expect(getByTestId("overview-chart-card")).toBeTruthy();
    expect(getByText("OverviewChartCard")).toBeTruthy();
    expect(getByText("week")).toBeTruthy();
  });

  it("switches time range buttons without crashing", () => {
    const { getByText } = render(
      <DetailedProgressScreen visible={true} onClose={jest.fn()} />,
    );

    const weekBtn = getByText("Week");
    const monthBtn = getByText("Month");
    const yearBtn = getByText("Year");

    fireEvent.press(monthBtn);
    fireEvent.press(yearBtn);
    fireEvent.press(weekBtn);
    // No explicit assertions – just hitting the setTimeRange handlers
  });

  it("calls onClose when the back button is pressed", () => {
    const onClose = jest.fn();

    const { getByText } = render(
      <DetailedProgressScreen visible={true} onClose={onClose} />,
    );

    // From mocked Ionicons → text is the icon name
    fireEvent.press(getByText("arrow-back"));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders share-related Ionicons text from the mock", () => {
    const { getAllByText } = render(
      <DetailedProgressScreen visible={true} onClose={jest.fn()} />,
    );

    // Icons mocked as text, some appear multiple times → use getAllByText
    expect(getAllByText("share-outline").length).toBeGreaterThan(0);
    expect(getAllByText("trending-up").length).toBeGreaterThan(0);
    expect(getAllByText("trophy").length).toBeGreaterThan(0);
  });
});
