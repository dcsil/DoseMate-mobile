import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { TouchableOpacity, ScrollView } from "react-native";
import PrivacyScreen from "@/app/onboarding/privacy";
import { useRouter } from "expo-router";

jest.mock("expo-router");

describe("PrivacyScreen", () => {
  let mockRouter: {
    back: jest.Mock;
    push: jest.Mock;
    replace: jest.Mock;
  };

  beforeEach(() => {
    mockRouter = {
      back: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders without crashing", () => {
      const { getByText } = render(<PrivacyScreen />);
      expect(getByText("Privacy & Security")).toBeTruthy();
    });

    it("displays the header title", () => {
      const { getByText } = render(<PrivacyScreen />);
      expect(getByText("Privacy & Security")).toBeTruthy();
    });

    it("displays the main title", () => {
      const { getByText } = render(<PrivacyScreen />);
      expect(getByText("Your Privacy Matters")).toBeTruthy();
    });

    it("displays the main subtitle", () => {
      const { getByText } = render(<PrivacyScreen />);
      expect(
        getByText("Please review our privacy policy before continuing"),
      ).toBeTruthy();
    });

    it("displays Data Security section", () => {
      const { getByText } = render(<PrivacyScreen />);
      expect(getByText("Data Security")).toBeTruthy();
      expect(
        getByText(/All your health information is encrypted/),
      ).toBeTruthy();
    });

    it("displays What We Collect section", () => {
      const { getByText } = render(<PrivacyScreen />);
      expect(getByText("What We Collect")).toBeTruthy();
      expect(
        getByText(/We only collect the information necessary/),
      ).toBeTruthy();
    });

    it("displays all bullet points in What We Collect", () => {
      const { getByText } = render(<PrivacyScreen />);
      expect(getByText("• Medication names and schedules")).toBeTruthy();
      expect(getByText("• Health conditions (optional)")).toBeTruthy();
      expect(getByText("• Reminder preferences")).toBeTruthy();
      expect(getByText("• Usage analytics (anonymous)")).toBeTruthy();
    });

    it("displays Privacy Policy section", () => {
      const { getByText } = render(<PrivacyScreen />);
      expect(getByText("Privacy Policy")).toBeTruthy();
      expect(getByText(/At DoseMate, we are committed/)).toBeTruthy();
    });

    it("displays medical disclaimer", () => {
      const { getByText } = render(<PrivacyScreen />);
      expect(getByText(/DoseMate is not a substitute/)).toBeTruthy();
    });
  });

  describe("Initial State", () => {
    it("shows scroll hint initially", () => {
      const { getByText } = render(<PrivacyScreen />);
      expect(getByText("↓ Scroll to continue ↓")).toBeTruthy();
    });

    it("button is disabled initially", () => {
      const { getByText } = render(<PrivacyScreen />);
      const button = getByText("Please read the full policy");
      expect(button).toBeTruthy();
    });

    it("button shows correct initial text", () => {
      const { getByText } = render(<PrivacyScreen />);
      expect(getByText("Please read the full policy")).toBeTruthy();
    });
  });

  describe("Navigation", () => {
    it("calls router.back when back button is pressed", () => {
      const { UNSAFE_getAllByType } = render(<PrivacyScreen />);
      const touchables = UNSAFE_getAllByType(TouchableOpacity);

      fireEvent.press(touchables[0]);

      expect(mockRouter.back).toHaveBeenCalledTimes(1);
    });

    it("does not navigate when accept button is pressed while disabled", () => {
      const { getByText } = render(<PrivacyScreen />);
      const button = getByText("Please read the full policy");

      fireEvent.press(button.parent!);

      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  describe("Scroll Behavior", () => {
    it("hides scroll hint when user scrolls down slightly", () => {
      const { getByText, queryByText, UNSAFE_getByType } = render(
        <PrivacyScreen />,
      );
      const scrollView = UNSAFE_getByType(ScrollView);

      // Initially hint is visible
      expect(getByText("↓ Scroll to continue ↓")).toBeTruthy();

      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: 15 },
          layoutMeasurement: { height: 600 },
          contentSize: { height: 1000 },
        },
      });

      // Hint should be hidden
      expect(queryByText("↓ Scroll to continue ↓")).toBeNull();
    });

    it("enables button when scrolled to end", () => {
      const { getByText, UNSAFE_getByType } = render(<PrivacyScreen />);
      const scrollView = UNSAFE_getByType(ScrollView);

      // Initially button is disabled
      expect(getByText("Please read the full policy")).toBeTruthy();

      // Simulate scrolling to the end
      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: 400 },
          layoutMeasurement: { height: 600 },
          contentSize: { height: 1000 },
        },
      });

      expect(getByText("Accept Terms")).toBeTruthy();
    });

    it("changes button text when scrolled to end", () => {
      const { getByText, queryByText, UNSAFE_getByType } = render(
        <PrivacyScreen />,
      );
      const scrollView = UNSAFE_getByType(ScrollView);

      // Simulate scrolling to the end
      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: 400 },
          layoutMeasurement: { height: 600 },
          contentSize: { height: 1000 },
        },
      });

      expect(getByText("Accept Terms")).toBeTruthy();
      expect(queryByText("Please read the full policy")).toBeNull();
    });

    it("keeps hint hidden after initial scroll even when scrolling back up", () => {
      const { queryByText, UNSAFE_getByType } = render(<PrivacyScreen />);
      const scrollView = UNSAFE_getByType(ScrollView);

      // Scroll down to hide hint
      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: 50 },
          layoutMeasurement: { height: 600 },
          contentSize: { height: 1000 },
        },
      });

      expect(queryByText("↓ Scroll to continue ↓")).toBeNull();

      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: 0 },
          layoutMeasurement: { height: 600 },
          contentSize: { height: 1000 },
        },
      });

      // Hint should still be hidden
      expect(queryByText("↓ Scroll to continue ↓")).toBeNull();
    });

    it("keeps button enabled after scrolling to end once", () => {
      const { getByText, UNSAFE_getByType } = render(<PrivacyScreen />);
      const scrollView = UNSAFE_getByType(ScrollView);

      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: 400 },
          layoutMeasurement: { height: 600 },
          contentSize: { height: 1000 },
        },
      });

      expect(getByText("Accept Terms")).toBeTruthy();

      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: 100 },
          layoutMeasurement: { height: 600 },
          contentSize: { height: 1000 },
        },
      });

      expect(getByText("Accept Terms")).toBeTruthy();
    });
  });

  describe("Button Functionality", () => {
    it("navigates to profile-setup when accept button is pressed after scrolling to end", () => {
      const { getByText, UNSAFE_getByType } = render(<PrivacyScreen />);
      const scrollView = UNSAFE_getByType(ScrollView);

      // Scroll to end to enable button
      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: 400 },
          layoutMeasurement: { height: 600 },
          contentSize: { height: 1000 },
        },
      });

      const acceptButton = getByText("Accept Terms");
      fireEvent.press(acceptButton.parent!);

      expect(mockRouter.push).toHaveBeenCalledWith("/onboarding/profile-setup");
    });

    it("button is disabled attribute when not scrolled to end", () => {
      const { UNSAFE_getAllByType } = render(<PrivacyScreen />);
      const touchables = UNSAFE_getAllByType(TouchableOpacity);

      const acceptButton = touchables[touchables.length - 1];

      expect(acceptButton.props.disabled).toBe(true);
    });

    it("button is not disabled after scrolling to end", () => {
      const { UNSAFE_getAllByType, UNSAFE_getByType } = render(
        <PrivacyScreen />,
      );
      const scrollView = UNSAFE_getByType(ScrollView);

      // Scroll to end
      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: 400 },
          layoutMeasurement: { height: 600 },
          contentSize: { height: 1000 },
        },
      });

      const touchables = UNSAFE_getAllByType(TouchableOpacity);
      const acceptButton = touchables[touchables.length - 1];

      expect(acceptButton.props.disabled).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("handles scroll within threshold (within 20px of end)", () => {
      const { getByText, UNSAFE_getByType } = render(<PrivacyScreen />);
      const scrollView = UNSAFE_getByType(ScrollView);

      // Scroll to within 20px of the end
      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: 385 },
          layoutMeasurement: { height: 600 },
          contentSize: { height: 1000 },
        },
      });

      // Should still enable the button (within threshold)
      expect(getByText("Accept Terms")).toBeTruthy();
    });

    it("does not enable button if not close enough to end", () => {
      const { getByText, queryByText, UNSAFE_getByType } = render(
        <PrivacyScreen />,
      );
      const scrollView = UNSAFE_getByType(ScrollView);

      // Scroll but not close to end
      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: 350 },
          layoutMeasurement: { height: 600 },
          contentSize: { height: 1000 },
        },
      });

      // Button should still be disabled
      expect(getByText("Please read the full policy")).toBeTruthy();
      expect(queryByText("Accept Terms")).toBeNull();
    });
  });

  describe("Component Structure", () => {
    it("renders all major sections in correct order", () => {
      const { getByText } = render(<PrivacyScreen />);

      // Header
      expect(getByText("Privacy & Security")).toBeTruthy();

      // Main content
      expect(getByText("Your Privacy Matters")).toBeTruthy();
      expect(getByText("Data Security")).toBeTruthy();
      expect(getByText("What We Collect")).toBeTruthy();
      expect(getByText("Privacy Policy")).toBeTruthy();

      // Button
      expect(getByText("Please read the full policy")).toBeTruthy();
    });
  });
});
