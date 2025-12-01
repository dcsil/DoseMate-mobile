// __tests__/MedicationCard.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MedicationCard from "../components/main-navigation/MedicationCard";

// Mock expo vector icons so they don't blow up in tests
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");

  const MockIcon = (props: any) =>
    React.createElement(Text, props, props.name || "icon");

  return {
    Ionicons: MockIcon,
    MaterialCommunityIcons: MockIcon,
  };
});

const baseMedication = {
  id: 1,
  name: "Amoxicillin",
  strength: "50 mg",
  quantity: "1 tablet",
  frequency: "Daily",
  times: ["10:00 AM", "10:00 PM"],
  color: "#3498DB",
  nextDose: "Today at 10:00 AM",
  adherence: 95,
  foodInstructions: "Take with food",
  purpose: "Infection",
};

describe("MedicationCard", () => {
  it("renders medication info, times, next dose, adherence, purpose and instructions", () => {
    const { getByText } = render(
      <MedicationCard medication={baseMedication} />,
    );

    // Header info
    expect(getByText("Amoxicillin")).toBeTruthy();
    expect(getByText("50 mg • 1 tablet")).toBeTruthy();

    // Frequency & times
    expect(getByText("Daily")).toBeTruthy();
    expect(getByText("10:00 AM")).toBeTruthy();
    expect(getByText("10:00 PM")).toBeTruthy();

    // Next dose & adherence
    expect(getByText("Today at 10:00 AM")).toBeTruthy();
    expect(getByText("95%")).toBeTruthy();

    // Purpose & instructions text
    expect(getByText(/Purpose:/)).toBeTruthy();
    expect(getByText(/Infection/)).toBeTruthy();
    expect(getByText(/Instructions:/)).toBeTruthy();
    expect(getByText(/Take with food/)).toBeTruthy();

    // Details button
    expect(getByText("View Details & Side Effects")).toBeTruthy();
  });

  it("uses 'Tomorrow' styling branch and mid-range adherence", () => {
    const medication = {
      ...baseMedication,
      nextDose: "Tomorrow at 9:00 AM",
      adherence: 82,
    };

    const { getByText } = render(<MedicationCard medication={medication} />);

    const nextDoseText = getByText("Tomorrow at 9:00 AM");
    const adherenceText = getByText("82%");

    // Check text is rendered
    expect(nextDoseText).toBeTruthy();
    expect(adherenceText).toBeTruthy();

    // (Optional) sanity-check the computed text colors via merged styles
    const flattenStyle = (style: any) =>
      Array.isArray(style) ? Object.assign({}, ...style) : style;

    const nextDoseStyle = flattenStyle(nextDoseText.props.style);
    const adherenceStyle = flattenStyle(adherenceText.props.style);

    // from getNextDoseColor / getAdherenceColor
    expect(nextDoseStyle.color).toBe("#666");
    expect(adherenceStyle.color).toBe("#F39C12");
  });

  it("calls onEdit, onDelete, and onViewDetails when the respective buttons are pressed", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const onViewDetails = jest.fn();

    const { getAllByRole, getByText } = render(
      <MedicationCard
        medication={baseMedication}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
      />,
    );

    // Two icon buttons in the header: [edit, delete]
    const buttons = getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(3); // edit, delete, details

    // Edit
    fireEvent.press(buttons[0]);
    expect(onEdit).toHaveBeenCalledTimes(1);

    // Delete
    fireEvent.press(buttons[1]);
    expect(onDelete).toHaveBeenCalledTimes(1);

    // View details (use text to be explicit)
    fireEvent.press(getByText("View Details & Side Effects"));
    expect(onViewDetails).toHaveBeenCalledTimes(1);
  });
});
