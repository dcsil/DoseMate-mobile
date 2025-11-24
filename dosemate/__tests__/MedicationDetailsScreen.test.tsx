import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import MedicationDetailsScreen from "@/components/main-navigation/MedicationsDetailsScreen";
import { BACKEND_BASE_URL } from "@/config";

// Mock config base URL
jest.mock("@/config", () => ({
  BACKEND_BASE_URL: "http://test-base",
}));

// Mock Card to avoid layout noise
jest.mock("@/components/main-navigation/Card", () => {
  const React = require("react");
  const { View } = require("react-native");
  return ({ children, ...props }: any) => <View {...props}>{children}</View>;
});

const globalAny: any = global;

const mockMedication = {
  id: 1,
  name: "Lipitor",
  strength: "10 mg",
  quantity: "1 tablet",
  frequency: "Once daily",
  times: ["8:00 AM"],
  color: "#2196F3",
  nextDose: "8:00 AM",
  adherence: 95,
  foodInstructions: "Take with or without food",
  purpose: "Lower cholesterol",
};

const mockDetailsResponse = {
  genericName: "atorvastatin",
  drugClass: "Statin",
  manufacturer: "Pfizer",
  description: "Used to lower cholesterol and reduce risk of heart disease.",
  usage: {
    instructions: [
      "Take at the same time each day.",
      "Swallow whole with water.",
    ],
    missedDose:
      "Take it as soon as you remember unless it's close to the next dose.",
    storage: "Store at room temperature away from moisture.",
  },
  sideEffects: {
    common: ["Headache", "Muscle pain"],
    serious: ["Severe muscle weakness", "Dark-colored urine"],
    whenToCall:
      "Call your doctor if you notice unexplained muscle pain or weakness.",
  },
  interactions: {
    drugs: ["Certain antibiotics", "Some antifungal medications"],
    food: ["Grapefruit juice"],
    conditions: ["Liver disease", "Kidney problems"],
  },
  warnings: [
    "Do not use during pregnancy.",
    "Regular liver function tests may be required.",
  ],
};

describe("MedicationDetailsScreen", () => {
  beforeEach(() => {
    globalAny.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns null when medication is null", () => {
    const { queryByText } = render(
      <MedicationDetailsScreen
        visible={true}
        onClose={jest.fn()}
        medication={null}
      />,
    );

    // Header text shouldn't appear because component returns null
    expect(queryByText("Lipitor")).toBeNull();
  });

  it("fetches medication details and shows overview content on success", async () => {
    (globalAny.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockDetailsResponse,
    });

    const { getByText, queryByText } = render(
      <MedicationDetailsScreen
        visible={true}
        onClose={jest.fn()}
        medication={mockMedication}
      />,
    );

    // Header should show immediately
    expect(getByText("Lipitor")).toBeTruthy();
    expect(getByText("10 mg")).toBeTruthy();

    // Loading state appears
    expect(getByText("Loading medication information...")).toBeTruthy();

    // Wait for fetch + content
    await waitFor(() => {
      expect(globalAny.fetch).toHaveBeenCalledWith(
        "http://test-base/medication-requests/1/details?name=Lipitor&strength=10mg",
        expect.objectContaining({
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
      );
    });

    // After load, loading text disappears and overview appears
    await waitFor(() => {
      expect(queryByText("Loading medication information...")).toBeNull();
      expect(getByText("Basic Information")).toBeTruthy();
    });

    // A few key fields from the response
    expect(getByText("atorvastatin")).toBeTruthy(); // genericName
    expect(getByText("Statin")).toBeTruthy(); // drugClass
    expect(
      getByText("Used to lower cholesterol and reduce risk of heart disease."),
    ).toBeTruthy();

    // Your schedule block
    expect(getByText("Your Schedule")).toBeTruthy();
    expect(getByText("Once daily")).toBeTruthy();
    expect(getByText("8:00 AM")).toBeTruthy();
    expect(getByText("1 tablet")).toBeTruthy();
    expect(getByText("Take with or without food")).toBeTruthy();

    // Disclaimer always at bottom
    expect(
      getByText(/This information is for educational purposes only/i),
    ).toBeTruthy();
  });

  it("shows error state and allows retry when fetch fails", async () => {
    (globalAny.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const { getByText } = render(
      <MedicationDetailsScreen
        visible={true}
        onClose={jest.fn()}
        medication={mockMedication}
      />,
    );

    // Wait for error UI
    await waitFor(() => {
      expect(
        getByText("Failed to load medication information. Please try again."),
      ).toBeTruthy();
    });

    // Retry should trigger another fetch
    const retryButton = getByText("Retry");
    fireEvent.press(retryButton);

    expect(globalAny.fetch).toHaveBeenCalledTimes(2);
  });

  it("allows switching between Overview, Side Effects, and Interactions tabs", async () => {
    (globalAny.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockDetailsResponse,
    });

    const { getByText, queryByText } = render(
      <MedicationDetailsScreen
        visible={true}
        onClose={jest.fn()}
        medication={mockMedication}
      />,
    );

    // Wait until overview content is loaded
    await waitFor(() => {
      expect(getByText("Basic Information")).toBeTruthy();
    });

    // Default tab: Overview
    expect(getByText("Your Schedule")).toBeTruthy();
    expect(getByText("How to Use")).toBeTruthy();
    expect(getByText("Important Warnings")).toBeTruthy();

    // Switch to Side Effects
    fireEvent.press(getByText("Side Effects"));

    await waitFor(() => {
      expect(getByText("Common Side Effects")).toBeTruthy();
      expect(getByText("Serious Side Effects")).toBeTruthy();
      expect(getByText("When to Contact Your Doctor")).toBeTruthy();
    });

    // Overview-specific label should no longer be visible in this view
    expect(queryByText("Your Schedule")).toBeNull();

    // Switch to Interactions
    fireEvent.press(getByText("Interactions"));

    await waitFor(() => {
      expect(getByText("Drug Interactions")).toBeTruthy();
      expect(getByText("Food & Drink Interactions")).toBeTruthy();
      expect(getByText("Medical Conditions")).toBeTruthy();
    });

    // Side effects label should now be absent
    expect(queryByText("Common Side Effects")).toBeNull();
  });
});
