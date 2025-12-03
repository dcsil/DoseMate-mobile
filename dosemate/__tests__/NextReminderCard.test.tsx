import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import NextReminderCard from "@/components/main-navigation/NextReminderCard";

describe("NextReminderCard", () => {
  const baseProps = {
    name: "Amoxicillin",
    strength: "50 mg",
    time: "Today at 10:00 AM",
  };

  it("renders label, medication text, time, and View button", () => {
    const { getByText } = render(
      <NextReminderCard
        name={baseProps.name}
        strength={baseProps.strength}
        time={baseProps.time}
      />,
    );

    // Label
    expect(getByText("Next reminder")).toBeTruthy();

    // Combined multiline medication text (name + strength + newline + time)
    expect(getByText(/Amoxicillin 50 mg\s*Today at 10:00 AM/)).toBeTruthy();

    // View button text
    expect(getByText("View")).toBeTruthy();
  });

  it("renders different medication name, strength, and time correctly", () => {
    const { getByText, queryByText } = render(
      <NextReminderCard
        name="Ibuprofen"
        strength="200 mg"
        time="Tomorrow at 9:00 PM"
      />,
    );

    // Old text should not be there
    expect(queryByText(/Amoxicillin 50 mg/)).toBeNull();

    // New combined text
    expect(getByText(/Ibuprofen 200 mg\s*Tomorrow at 9:00 PM/)).toBeTruthy();
  });

  it("renders the notifications icon (from Ionicons mock)", () => {
    // In your environment, Ionicons are mocked to render their name as text
    const { getByTestId } = render(
      <NextReminderCard
        name={baseProps.name}
        strength={baseProps.strength}
        time={baseProps.time}
      />,
    );

    // Icon name from <Ionicons name="notifications" ... />
    expect(getByTestId("next-reminder-icon")).toBeTruthy();
  });

  it("calls onViewPress when the View button is pressed", () => {
    const onViewPress = jest.fn();

    const { getByText } = render(
      <NextReminderCard
        name={baseProps.name}
        strength={baseProps.strength}
        time={baseProps.time}
        onViewPress={onViewPress}
      />,
    );

    const viewButtonText = getByText("View");

    fireEvent.press(viewButtonText);
    expect(onViewPress).toHaveBeenCalledTimes(1);

    // Press again to make sure handler is stable
    fireEvent.press(viewButtonText);
    expect(onViewPress).toHaveBeenCalledTimes(2);
  });

  it("does not throw and does nothing special when View is pressed without onViewPress", () => {
    const { getByText } = render(
      <NextReminderCard
        name={baseProps.name}
        strength={baseProps.strength}
        time={baseProps.time}
      />,
    );

    const viewButtonText = getByText("View");

    // If this throws, the test fails
    fireEvent.press(viewButtonText);
  });

  it("updates displayed content when rerendered with new props", () => {
    const { getByText, queryByText, rerender } = render(
      <NextReminderCard
        name={baseProps.name}
        strength={baseProps.strength}
        time={baseProps.time}
      />,
    );

    expect(getByText(/Amoxicillin 50 mg\s*Today at 10:00 AM/)).toBeTruthy();

    rerender(
      <NextReminderCard
        name="Metformin"
        strength="500 mg"
        time="Tonight at 8:30 PM"
      />,
    );

    expect(queryByText(/Amoxicillin 50 mg/)).toBeNull();
    expect(getByText(/Metformin 500 mg\s*Tonight at 8:30 PM/)).toBeTruthy();
  });
});
