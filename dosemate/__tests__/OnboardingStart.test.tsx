import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import OnboardingStart from "@/app/index";
import { useRouter } from "expo-router";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

describe("OnboardingStart", () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders without crashing", () => {
      const { getByText } = render(<OnboardingStart />);
      expect(getByText("DoseMate")).toBeTruthy();
    });

    it("displays the app title", () => {
      const { getByText } = render(<OnboardingStart />);
      expect(getByText("DoseMate")).toBeTruthy();
    });

    it("displays the subtitle", () => {
      const { getByText } = render(<OnboardingStart />);
      expect(getByText("Your partner in staying on track")).toBeTruthy();
    });

    it("displays the description text", () => {
      const { getByText } = render(<OnboardingStart />);
      expect(
        getByText(
          "Never miss your medication again with smart reminders and tracking.",
        ),
      ).toBeTruthy();
    });

    it("displays the Get Started button", () => {
      const { getByText } = render(<OnboardingStart />);
      expect(getByText("Get Started")).toBeTruthy();
    });
  });

  describe("Features Section", () => {
    it("displays all three feature items", () => {
      const { getByText } = render(<OnboardingStart />);

      expect(getByText("Secure & Private")).toBeTruthy();
      expect(getByText("Smart Reminders")).toBeTruthy();
      expect(getByText("Health Tracking")).toBeTruthy();
    });

    it("renders the security feature with correct text", () => {
      const { getByText } = render(<OnboardingStart />);
      const secureFeature = getByText("Secure & Private");
      expect(secureFeature).toBeTruthy();
    });

    it("renders the reminders feature with correct text", () => {
      const { getByText } = render(<OnboardingStart />);
      const remindersFeature = getByText("Smart Reminders");
      expect(remindersFeature).toBeTruthy();
    });

    it("renders the health tracking feature with correct text", () => {
      const { getByText } = render(<OnboardingStart />);
      const healthFeature = getByText("Health Tracking");
      expect(healthFeature).toBeTruthy();
    });
  });

  describe("Navigation", () => {
    it("navigates to create-account screen when Get Started is pressed", () => {
      const { getByText } = render(<OnboardingStart />);
      const button = getByText("Get Started");

      fireEvent.press(button);

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/onboarding/create-account");
    });

    it("calls router.push with correct path", () => {
      const { getByText } = render(<OnboardingStart />);
      const button = getByText("Get Started");

      fireEvent.press(button);

      expect(mockPush).toHaveBeenCalledWith("/onboarding/create-account");
    });
  });

  describe("Component Structure", () => {
    it("renders all major sections", () => {
      const { getByText } = render(<OnboardingStart />);

      // Header section
      expect(getByText("DoseMate")).toBeTruthy();
      expect(getByText("Your partner in staying on track")).toBeTruthy();

      // Description
      expect(getByText(/Never miss your medication/)).toBeTruthy();

      // Features
      expect(getByText("Secure & Private")).toBeTruthy();

      // CTA
      expect(getByText("Get Started")).toBeTruthy();
    });
  });

  describe("Accessibility", () => {
    it("button is accessible and pressable", () => {
      const { getByText } = render(<OnboardingStart />);
      const button = getByText("Get Started");

      // Should be able to find and press the button
      expect(button).toBeTruthy();
      fireEvent.press(button);
      expect(mockPush).toHaveBeenCalled();
    });
  });
});
