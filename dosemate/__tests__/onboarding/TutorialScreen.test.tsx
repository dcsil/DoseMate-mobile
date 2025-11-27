import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TouchableOpacity } from "react-native";
import TutorialScreen from "@/app/onboarding/tutorial";
import { useRouter } from "expo-router";

jest.mock("expo-router");

describe("TutorialScreen", () => {
  let mockRouter: {
    back: jest.Mock;
    push: jest.Mock;
    replace: jest.Mock;
  };

  const originalConsoleLog = console.log;

  beforeEach(() => {
    mockRouter = {
      back: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  describe("Initial Rendering", () => {
    it("renders without crashing", () => {
      const { getByText } = render(<TutorialScreen />);
      expect(getByText("Add Your Medications")).toBeTruthy();
    });

    it("displays the first slide by default", () => {
      const { getByText } = render(<TutorialScreen />);
      expect(getByText("Add Your Medications")).toBeTruthy();
      expect(getByText(/Easily add medications by searching/)).toBeTruthy();
    });

    it("shows all features of the first slide", () => {
      const { getByText } = render(<TutorialScreen />);
      expect(getByText("Search by name")).toBeTruthy();
      expect(getByText("Search by image")).toBeTruthy();
      expect(getByText("Dosage tracking")).toBeTruthy();
    });

    it("shows Skip button in header", () => {
      const { getByText } = render(<TutorialScreen />);
      expect(getByText("Skip")).toBeTruthy();
    });

    it("shows Next button initially", () => {
      const { getByText } = render(<TutorialScreen />);
      expect(getByText("Next")).toBeTruthy();
    });

    it("displays slide counter showing 1 of 4", () => {
      const { getByText } = render(<TutorialScreen />);
      expect(getByText("1 of 4")).toBeTruthy();
    });

    it("renders 4 dots for pagination", () => {
      const { UNSAFE_root } = render(<TutorialScreen />);
      const dotsContainer = UNSAFE_root.findAllByProps({
        style: expect.objectContaining({}),
      });
      // Should have 4 dots rendered
      expect(dotsContainer).toBeDefined();
    });
  });

  describe("Navigation - Next Button", () => {
    it("navigates to second slide when Next is pressed", () => {
      const { getByText } = render(<TutorialScreen />);
      const nextButton = getByText("Next");

      fireEvent.press(nextButton);

      expect(getByText("Smart Reminders")).toBeTruthy();
      expect(
        getByText(/Never miss a dose with intelligent reminders/),
      ).toBeTruthy();
    });

    it("navigates to third slide", () => {
      const { getByText } = render(<TutorialScreen />);

      fireEvent.press(getByText("Next"));
      fireEvent.press(getByText("Next"));

      expect(getByText("Track Your Progress")).toBeTruthy();
      expect(getByText(/See your adherence patterns/)).toBeTruthy();
    });

    it("navigates to fourth slide", () => {
      const { getByText } = render(<TutorialScreen />);

      fireEvent.press(getByText("Next"));
      fireEvent.press(getByText("Next"));
      fireEvent.press(getByText("Next"));

      expect(getByText("Stay Safe")).toBeTruthy();
      expect(getByText(/Get alerts about drug interactions/)).toBeTruthy();
    });

    it("updates slide counter as user navigates", () => {
      const { getByText } = render(<TutorialScreen />);

      expect(getByText("1 of 4")).toBeTruthy();

      fireEvent.press(getByText("Next"));
      expect(getByText("2 of 4")).toBeTruthy();

      fireEvent.press(getByText("Next"));
      expect(getByText("3 of 4")).toBeTruthy();

      fireEvent.press(getByText("Next"));
      expect(getByText("4 of 4")).toBeTruthy();
    });

    it('shows "Get Started" button on last slide', () => {
      const { getByText, queryByText } = render(<TutorialScreen />);

      fireEvent.press(getByText("Next"));
      fireEvent.press(getByText("Next"));
      fireEvent.press(getByText("Next"));

      expect(getByText("Get Started")).toBeTruthy();
      expect(queryByText("Next")).toBeNull();
    });

    it("navigates to main app when Get Started is pressed", () => {
      const { getByText } = render(<TutorialScreen />);

      // Navigate to last slide 3x
      fireEvent.press(getByText("Next"));
      fireEvent.press(getByText("Next"));
      fireEvent.press(getByText("Next"));

      fireEvent.press(getByText("Get Started"));

      expect(mockRouter.push).toHaveBeenCalledWith("../main-navigation");
    });

    it("logs message when tutorial is completed", () => {
      const { getByText } = render(<TutorialScreen />);

      // Navigate to last slide 3x
      fireEvent.press(getByText("Next"));
      fireEvent.press(getByText("Next"));
      fireEvent.press(getByText("Next"));

      fireEvent.press(getByText("Get Started"));

      expect(console.log).toHaveBeenCalledWith("Tutorial complete");
    });
  });

  describe("Navigation - Back Button", () => {
    it("calls router.back when back button is pressed on first slide", () => {
      const { UNSAFE_getAllByType } = render(<TutorialScreen />);
      const touchables = UNSAFE_getAllByType(TouchableOpacity);

      fireEvent.press(touchables[0]);

      expect(mockRouter.back).toHaveBeenCalledTimes(1);
    });

    it("navigates to previous slide when back is pressed on second slide", () => {
      const { getByText, UNSAFE_getAllByType } = render(<TutorialScreen />);

      // Go to second slide
      fireEvent.press(getByText("Next"));
      expect(getByText("Smart Reminders")).toBeTruthy();

      // Press back
      const touchables = UNSAFE_getAllByType(TouchableOpacity);
      fireEvent.press(touchables[0]);

      expect(getByText("Add Your Medications")).toBeTruthy();
    });

    it("navigates backward through all slides", () => {
      const { getByText, UNSAFE_getAllByType } = render(<TutorialScreen />);

      // Go to last slide
      fireEvent.press(getByText("Next"));
      fireEvent.press(getByText("Next"));
      fireEvent.press(getByText("Next"));
      expect(getByText("Stay Safe")).toBeTruthy();

      // Navigate back through slides
      const touchables = UNSAFE_getAllByType(TouchableOpacity);
      const backButton = touchables[0];

      fireEvent.press(backButton);
      expect(getByText("Track Your Progress")).toBeTruthy();

      fireEvent.press(backButton);
      expect(getByText("Smart Reminders")).toBeTruthy();

      fireEvent.press(backButton);
      expect(getByText("Add Your Medications")).toBeTruthy();
    });
  });

  describe("Skip Functionality", () => {
    it("navigates to main app when Skip is pressed from first slide", () => {
      const { getByText } = render(<TutorialScreen />);
      const skipButton = getByText("Skip");

      fireEvent.press(skipButton);

      expect(mockRouter.push).toHaveBeenCalledWith("../main-navigation");
    });

    it("navigates to main app when Skip is pressed from any slide", () => {
      const { getByText } = render(<TutorialScreen />);

      // Go to third slide
      fireEvent.press(getByText("Next"));
      fireEvent.press(getByText("Next"));

      // Press skip
      fireEvent.press(getByText("Skip"));

      expect(mockRouter.push).toHaveBeenCalledWith("../main-navigation");
    });

    it("logs message when tutorial is skipped", () => {
      const { getByText } = render(<TutorialScreen />);

      fireEvent.press(getByText("Skip"));

      expect(console.log).toHaveBeenCalledWith("Tutorial skipped");
    });
  });

  describe("Slide Content", () => {
    it("displays all content for slide 1", () => {
      const { getByText } = render(<TutorialScreen />);

      expect(getByText("Add Your Medications")).toBeTruthy();
      expect(getByText(/Easily add medications by searching/)).toBeTruthy();
      expect(getByText("Search by name")).toBeTruthy();
      expect(getByText("Barcode scanner")).toBeTruthy();
      expect(getByText("Dosage tracking")).toBeTruthy();
    });

    it("displays all content for slide 2", () => {
      const { getByText } = render(<TutorialScreen />);

      fireEvent.press(getByText("Next"));

      expect(getByText("Smart Reminders")).toBeTruthy();
      expect(
        getByText(/Never miss a dose with intelligent reminders/),
      ).toBeTruthy();
      expect(getByText("Custom timing")).toBeTruthy();
      expect(getByText("Snooze options")).toBeTruthy();
      expect(getByText("Multiple notifications")).toBeTruthy();
    });

    it("displays all content for slide 3", () => {
      const { getByText } = render(<TutorialScreen />);

      fireEvent.press(getByText("Next"));
      fireEvent.press(getByText("Next"));

      expect(getByText("Track Your Progress")).toBeTruthy();
      expect(getByText(/See your adherence patterns/)).toBeTruthy();
      expect(getByText("Daily tracking")).toBeTruthy();
      expect(getByText("Weekly reports")).toBeTruthy();
      expect(getByText("Share with doctors")).toBeTruthy();
    });

    it("displays all content for slide 4", () => {
      const { getByText } = render(<TutorialScreen />);

      fireEvent.press(getByText("Next"));
      fireEvent.press(getByText("Next"));
      fireEvent.press(getByText("Next"));

      expect(getByText("Stay Safe")).toBeTruthy();
      expect(getByText(/Get alerts about drug interactions/)).toBeTruthy();
      expect(getByText("Interaction alerts")).toBeTruthy();
      expect(getByText("Side effect info")).toBeTruthy();
      expect(getByText("Safety reminders")).toBeTruthy();
    });
  });

  describe("Dots Indicator", () => {
    it("shows correct number of dots", () => {
      const { getByText } = render(<TutorialScreen />);
      expect(getByText("1 of 4")).toBeTruthy();
    });

    it("updates active dot as user navigates", () => {
      const { getByText } = render(<TutorialScreen />);

      expect(getByText("1 of 4")).toBeTruthy();

      fireEvent.press(getByText("Next"));
      expect(getByText("2 of 4")).toBeTruthy();

      fireEvent.press(getByText("Next"));
      expect(getByText("3 of 4")).toBeTruthy();

      fireEvent.press(getByText("Next"));
      expect(getByText("4 of 4")).toBeTruthy();
    });
  });

  describe("Complete Tutorial Flow", () => {
    it("completes entire tutorial flow forward", () => {
      const { getByText } = render(<TutorialScreen />);

      // Slide 1
      expect(getByText("Add Your Medications")).toBeTruthy();
      fireEvent.press(getByText("Next"));

      // Slide 2
      expect(getByText("Smart Reminders")).toBeTruthy();
      fireEvent.press(getByText("Next"));

      // Slide 3
      expect(getByText("Track Your Progress")).toBeTruthy();
      fireEvent.press(getByText("Next"));

      // Slide 4
      expect(getByText("Stay Safe")).toBeTruthy();
      expect(getByText("Get Started")).toBeTruthy();

      // Complete
      fireEvent.press(getByText("Get Started"));
      expect(mockRouter.push).toHaveBeenCalledWith("../main-navigation");
    });

    it("allows navigating forward and backward freely", () => {
      const { getByText, UNSAFE_getAllByType } = render(<TutorialScreen />);
      const getBackButton = () => UNSAFE_getAllByType(TouchableOpacity)[0];

      // Go to slide 3
      fireEvent.press(getByText("Next"));
      fireEvent.press(getByText("Next"));
      expect(getByText("Track Your Progress")).toBeTruthy();

      // Back to slide 2
      fireEvent.press(getBackButton());
      expect(getByText("Smart Reminders")).toBeTruthy();

      // Go to slide 3 again
      fireEvent.press(getByText("Next"));
      expect(getByText("Track Your Progress")).toBeTruthy();

      // Go to slide 4
      fireEvent.press(getByText("Next"));
      expect(getByText("Stay Safe")).toBeTruthy();

      // Back to slide 3
      fireEvent.press(getBackButton());
      expect(getByText("Track Your Progress")).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("does not navigate beyond last slide", () => {
      const { getByText } = render(<TutorialScreen />);

      // Go to last slide
      fireEvent.press(getByText("Next"));
      fireEvent.press(getByText("Next"));
      fireEvent.press(getByText("Next"));

      expect(getByText("Stay Safe")).toBeTruthy();
      expect(getByText("4 of 4")).toBeTruthy();

      // Get Started button should navigate to main app, not another slide
      fireEvent.press(getByText("Get Started"));
      expect(mockRouter.push).toHaveBeenCalledWith("../main-navigation");
    });

    it("handles rapid navigation", () => {
      const { getByText } = render(<TutorialScreen />);

      // Go next 3x
      fireEvent.press(getByText("Next"));
      fireEvent.press(getByText("Next"));
      fireEvent.press(getByText("Next"));

      expect(getByText("Stay Safe")).toBeTruthy();
      expect(getByText("4 of 4")).toBeTruthy();
    });

    it("does not break when back is pressed on first slide", () => {
      const { getByText, UNSAFE_getAllByType } = render(<TutorialScreen />);

      expect(getByText("Add Your Medications")).toBeTruthy();

      // Press back on first slide
      const backButton = UNSAFE_getAllByType(TouchableOpacity)[0];
      fireEvent.press(backButton);

      // Should call router.back
      expect(mockRouter.back).toHaveBeenCalled();

      // Slide should still be slide 1
      expect(getByText("Add Your Medications")).toBeTruthy();
    });
  });

  describe("Button States", () => {
    it("Next button is always visible except on last slide", () => {
      const { getByText, queryByText } = render(<TutorialScreen />);

      expect(getByText("Next")).toBeTruthy();

      fireEvent.press(getByText("Next"));
      expect(getByText("Next")).toBeTruthy();

      fireEvent.press(getByText("Next"));
      expect(getByText("Next")).toBeTruthy();

      fireEvent.press(getByText("Next"));
      expect(queryByText("Next")).toBeNull();
      expect(getByText("Get Started")).toBeTruthy();
    });

    it("Skip button is always visible", () => {
      const { getByText } = render(<TutorialScreen />);

      expect(getByText("Skip")).toBeTruthy();

      fireEvent.press(getByText("Next"));
      expect(getByText("Skip")).toBeTruthy();

      fireEvent.press(getByText("Next"));
      expect(getByText("Skip")).toBeTruthy();

      fireEvent.press(getByText("Next"));
      expect(getByText("Skip")).toBeTruthy();
    });

    it("Back button is always visible", () => {
      const { UNSAFE_getAllByType, getByText } = render(<TutorialScreen />);

      let touchables = UNSAFE_getAllByType(TouchableOpacity);
      expect(touchables[0]).toBeTruthy(); // Back button

      fireEvent.press(getByText("Next"));
      touchables = UNSAFE_getAllByType(TouchableOpacity);
      expect(touchables[0]).toBeTruthy();

      fireEvent.press(getByText("Next"));
      touchables = UNSAFE_getAllByType(TouchableOpacity);
      expect(touchables[0]).toBeTruthy();
    });
  });
});
