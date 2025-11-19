import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { TouchableOpacity } from "react-native";
import ProfileSetupScreen from "@/app/onboarding/profile-setup";
import { useRouter } from "expo-router";

// Mock child components
jest.mock("@/components/profile-header", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return ({ step, handleBack }: any) => (
    <View testID="header">
      <TouchableOpacity onPress={handleBack}>
        <Text>Back</Text>
      </TouchableOpacity>
      <Text>Step {step}</Text>
    </View>
  );
});

jest.mock("@/components/progress-bar", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return ({ step, totalSteps }: any) => (
    <View testID="progress-bar">
      <Text>
        Progress: {step}/{totalSteps}
      </Text>
    </View>
  );
});

jest.mock("@/components/profile-setup", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity, TextInput } = require("react-native");

  return {
    PersonalInfo: ({ age, setAge }: any) => (
      <View testID="personal-info">
        <Text>Personal Info</Text>
        <TextInput
          testID="age-input"
          value={age}
          onChangeText={setAge}
          placeholder="Enter age"
        />
      </View>
    ),
    HealthInfo: ({
      conditions,
      selectedConditions,
      setConditions,
      allergies,
      setAllergies,
    }: any) => (
      <View testID="health-info">
        <Text>Health Info</Text>
        {conditions.map((condition: string) => (
          <TouchableOpacity
            key={condition}
            testID={`condition-${condition}`}
            onPress={() => {
              const isSelected = selectedConditions.includes(condition);
              if (isSelected) {
                setConditions(
                  selectedConditions.filter((c: string) => c !== condition),
                );
              } else {
                setConditions([...selectedConditions, condition]);
              }
            }}
          >
            <Text>
              {condition} {selectedConditions.includes(condition) ? "✓" : ""}
            </Text>
          </TouchableOpacity>
        ))}
        <TextInput
          testID="allergies-input"
          value={allergies}
          onChangeText={setAllergies}
          placeholder="Enter allergies"
        />
      </View>
    ),
    Lifestyle: ({
      sleepSchedules,
      activityLevels,
      selectedSleep,
      setSleep,
      selectedActivity,
      setActivity,
    }: any) => (
      <View testID="lifestyle">
        <Text>Lifestyle</Text>
        {sleepSchedules.map((schedule: any) => (
          <TouchableOpacity
            key={schedule.value}
            testID={`sleep-${schedule.value}`}
            onPress={() => setSleep(schedule.value)}
          >
            <Text>
              {schedule.label} {selectedSleep === schedule.value ? "✓" : ""}
            </Text>
          </TouchableOpacity>
        ))}
        {activityLevels.map((level: any) => (
          <TouchableOpacity
            key={level.value}
            testID={`activity-${level.value}`}
            onPress={() => setActivity(level.value)}
          >
            <Text>
              {level.label} {selectedActivity === level.value ? "✓" : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    ),
  };
});

jest.mock("expo-router");

describe("ProfileSetupScreen", () => {
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

  describe("Initial Rendering", () => {
    it("renders without crashing", () => {
      const { getByTestId } = render(<ProfileSetupScreen />);
      expect(getByTestId("header")).toBeTruthy();
    });

    it("starts at step 1", () => {
      const { getByText } = render(<ProfileSetupScreen />);
      expect(getByText("Step 1")).toBeTruthy();
    });

    it("shows PersonalInfo component on step 1", () => {
      const { getByTestId } = render(<ProfileSetupScreen />);
      expect(getByTestId("personal-info")).toBeTruthy();
    });

    it("shows progress bar with correct values", () => {
      const { getByText } = render(<ProfileSetupScreen />);
      expect(getByText("Progress: 1/3")).toBeTruthy();
    });

    it("shows Continue button initially", () => {
      const { getByText } = render(<ProfileSetupScreen />);
      expect(getByText("Continue")).toBeTruthy();
    });

    it("button is disabled initially on step 1", () => {
      const { UNSAFE_getAllByType } = render(<ProfileSetupScreen />);
      const touchables = UNSAFE_getAllByType(TouchableOpacity);
      const continueButton = touchables[touchables.length - 1];

      expect(continueButton.props.disabled).toBe(true);
    });
  });

  describe("Step 1 - Personal Info", () => {
    it("enables continue button when age is entered", () => {
      const { getByTestId, UNSAFE_getAllByType } = render(
        <ProfileSetupScreen />,
      );
      const ageInput = getByTestId("age-input");

      fireEvent.changeText(ageInput, "25");

      const touchables = UNSAFE_getAllByType(TouchableOpacity);
      const continueButton = touchables[touchables.length - 1];

      expect(continueButton.props.disabled).toBe(false);
    });

    it("keeps button disabled when age is empty", () => {
      const { UNSAFE_getAllByType } = render(<ProfileSetupScreen />);
      const touchables = UNSAFE_getAllByType(TouchableOpacity);
      const continueButton = touchables[touchables.length - 1];

      expect(continueButton.props.disabled).toBe(true);
    });

    it("navigates to step 2 when continue is pressed", () => {
      const { getByTestId, getByText, queryByTestId } = render(
        <ProfileSetupScreen />,
      );
      const ageInput = getByTestId("age-input");

      fireEvent.changeText(ageInput, "30");

      const continueButton = getByText("Continue");
      fireEvent.press(continueButton.parent!);

      // Should now show step 2
      expect(getByText("Step 2")).toBeTruthy();
      expect(queryByTestId("personal-info")).toBeNull();
      expect(getByTestId("health-info")).toBeTruthy();
    });
  });

  describe("Step 2 - Health Info", () => {
    beforeEach(() => {
      const { getByTestId, getByText } = render(<ProfileSetupScreen />);
      const ageInput = getByTestId("age-input");
      fireEvent.changeText(ageInput, "30");
      const continueButton = getByText("Continue");
      fireEvent.press(continueButton.parent!);
    });

    it("displays HealthInfo component", () => {
      const { getByTestId } = render(<ProfileSetupScreen />);
      const ageInput = getByTestId("age-input");
      fireEvent.changeText(ageInput, "30");
      const { getByText } = render(<ProfileSetupScreen />);
      fireEvent.press(getByText("Continue").parent!);

      const screen = render(<ProfileSetupScreen />);
      fireEvent.changeText(screen.getByTestId("age-input"), "30");
      fireEvent.press(screen.getByText("Continue").parent!);

      expect(screen.getByTestId("health-info")).toBeTruthy();
    });

    it("shows correct progress on step 2", () => {
      const screen = render(<ProfileSetupScreen />);
      fireEvent.changeText(screen.getByTestId("age-input"), "30");
      fireEvent.press(screen.getByText("Continue").parent!);

      expect(screen.getByText("Progress: 2/3")).toBeTruthy();
    });

    it("allows continuing without selecting conditions", () => {
      const screen = render(<ProfileSetupScreen />);
      fireEvent.changeText(screen.getByTestId("age-input"), "30");
      fireEvent.press(screen.getByText("Continue").parent!);

      const touchables = screen.UNSAFE_getAllByType(TouchableOpacity);
      const continueButton = touchables[touchables.length - 1];

      expect(continueButton.props.disabled).toBe(false);
    });

    it("allows selecting multiple conditions", () => {
      const screen = render(<ProfileSetupScreen />);
      fireEvent.changeText(screen.getByTestId("age-input"), "30");
      fireEvent.press(screen.getByText("Continue").parent!);

      const diabetesButton = screen.getByTestId("condition-Diabetes");
      const hypertensionButton = screen.getByTestId("condition-Hypertension");

      fireEvent.press(diabetesButton);
      fireEvent.press(hypertensionButton);

      expect(screen.getByText("Diabetes ✓")).toBeTruthy();
      expect(screen.getByText("Hypertension ✓")).toBeTruthy();
    });

    it("allows deselecting conditions", () => {
      const screen = render(<ProfileSetupScreen />);
      fireEvent.changeText(screen.getByTestId("age-input"), "30");
      fireEvent.press(screen.getByText("Continue").parent!);

      const diabetesButton = screen.getByTestId("condition-Diabetes");

      fireEvent.press(diabetesButton);
      expect(screen.getByText("Diabetes ✓")).toBeTruthy();

      fireEvent.press(diabetesButton);
      expect(screen.getByText(/^Diabetes$/)).toBeTruthy();
    });

    it("allows entering allergies", () => {
      const screen = render(<ProfileSetupScreen />);
      fireEvent.changeText(screen.getByTestId("age-input"), "30");
      fireEvent.press(screen.getByText("Continue").parent!);

      const allergiesInput = screen.getByTestId("allergies-input");
      fireEvent.changeText(allergiesInput, "Peanuts, Shellfish");

      expect(allergiesInput.props.value).toBe("Peanuts, Shellfish");
    });

    it("navigates to step 3 when continue is pressed", () => {
      const screen = render(<ProfileSetupScreen />);
      fireEvent.changeText(screen.getByTestId("age-input"), "30");
      fireEvent.press(screen.getByText("Continue").parent!);

      fireEvent.press(screen.getByText("Continue").parent!);

      expect(screen.getByText("Step 3")).toBeTruthy();
      expect(screen.getByTestId("lifestyle")).toBeTruthy();
    });
  });

  describe("Step 3 - Lifestyle", () => {
    const navigateToStep3 = (screen: any) => {
      fireEvent.changeText(screen.getByTestId("age-input"), "30");
      fireEvent.press(screen.getByText("Continue").parent!);
      fireEvent.press(screen.getByText("Continue").parent!);
    };

    it("displays Lifestyle component", () => {
      const screen = render(<ProfileSetupScreen />);
      navigateToStep3(screen);

      expect(screen.getByTestId("lifestyle")).toBeTruthy();
    });

    it("shows correct progress on step 3", () => {
      const screen = render(<ProfileSetupScreen />);
      navigateToStep3(screen);

      expect(screen.getByText("Progress: 3/3")).toBeTruthy();
    });

    it("button is disabled until both sleep and activity are selected", () => {
      const screen = render(<ProfileSetupScreen />);
      navigateToStep3(screen);

      const touchables = screen.UNSAFE_getAllByType(TouchableOpacity);
      const continueButton = touchables[touchables.length - 1];

      expect(continueButton.props.disabled).toBe(true);
    });

    it("enables button when sleep schedule is selected", () => {
      const screen = render(<ProfileSetupScreen />);
      navigateToStep3(screen);

      const sleepButton = screen.getByTestId("sleep-normal");
      fireEvent.press(sleepButton);

      // Still disabled because activity not selected
      const touchables = screen.UNSAFE_getAllByType(TouchableOpacity);
      const continueButton = touchables[touchables.length - 1];
      expect(continueButton.props.disabled).toBe(true);
    });

    it("enables button when both sleep and activity are selected", () => {
      const screen = render(<ProfileSetupScreen />);
      navigateToStep3(screen);

      fireEvent.press(screen.getByTestId("sleep-normal"));
      fireEvent.press(screen.getByTestId("activity-moderate"));

      const touchables = screen.UNSAFE_getAllByType(TouchableOpacity);
      const continueButton = touchables[touchables.length - 1];
      expect(continueButton.props.disabled).toBe(false);
    });

    it('shows "Complete Setup" button text on step 3', () => {
      const screen = render(<ProfileSetupScreen />);
      navigateToStep3(screen);

      fireEvent.press(screen.getByTestId("sleep-normal"));
      fireEvent.press(screen.getByTestId("activity-moderate"));

      expect(screen.getByText("Complete Setup")).toBeTruthy();
    });

    it("navigates to tutorial when Complete Setup is pressed", () => {
      const screen = render(<ProfileSetupScreen />);
      navigateToStep3(screen);

      fireEvent.press(screen.getByTestId("sleep-normal"));
      fireEvent.press(screen.getByTestId("activity-moderate"));

      const completeButton = screen.getByText("Complete Setup");
      fireEvent.press(completeButton.parent!);

      expect(mockRouter.replace).toHaveBeenCalledWith("/onboarding/tutorial");
    });

    it("allows selecting different sleep schedules", () => {
      const screen = render(<ProfileSetupScreen />);
      navigateToStep3(screen);

      fireEvent.press(screen.getByTestId("sleep-early"));
      expect(screen.getByText(/Early Bird.*✓/)).toBeTruthy();

      fireEvent.press(screen.getByTestId("sleep-late"));
      expect(screen.getByText(/Night Owl.*✓/)).toBeTruthy();
    });

    it("allows selecting different activity levels", () => {
      const screen = render(<ProfileSetupScreen />);
      navigateToStep3(screen);

      fireEvent.press(screen.getByTestId("activity-low"));
      expect(screen.getByText(/Low - Mostly sedentary ✓/)).toBeTruthy();

      fireEvent.press(screen.getByTestId("activity-high"));
      expect(screen.getByText(/High - Regular exercise ✓/)).toBeTruthy();
    });
  });

  describe("Back Navigation", () => {
    it("calls router.back when back is pressed on step 1", () => {
      const screen = render(<ProfileSetupScreen />);
      const backButton = screen.getByText("Back");

      fireEvent.press(backButton);

      expect(mockRouter.back).toHaveBeenCalledTimes(1);
    });

    it("goes to step 1 when back is pressed on step 2", () => {
      const screen = render(<ProfileSetupScreen />);
      fireEvent.changeText(screen.getByTestId("age-input"), "30");
      fireEvent.press(screen.getByText("Continue").parent!);

      expect(screen.getByText("Step 2")).toBeTruthy();

      const backButton = screen.getByText("Back");
      fireEvent.press(backButton);

      expect(screen.getByText("Step 1")).toBeTruthy();
      expect(screen.getByTestId("personal-info")).toBeTruthy();
    });

    it("goes to step 2 when back is pressed on step 3", () => {
      const screen = render(<ProfileSetupScreen />);
      fireEvent.changeText(screen.getByTestId("age-input"), "30");
      fireEvent.press(screen.getByText("Continue").parent!);
      fireEvent.press(screen.getByText("Continue").parent!);

      expect(screen.getByText("Step 3")).toBeTruthy();

      const backButton = screen.getByText("Back");
      fireEvent.press(backButton);

      expect(screen.getByText("Step 2")).toBeTruthy();
      expect(screen.getByTestId("health-info")).toBeTruthy();
    });

    it("preserves data when navigating back and forward", () => {
      const screen = render(<ProfileSetupScreen />);

      // Step 1: Enter age
      fireEvent.changeText(screen.getByTestId("age-input"), "35");
      fireEvent.press(screen.getByText("Continue").parent!);

      // Step 2: Go back
      fireEvent.press(screen.getByText("Back"));

      // Age should still be there
      expect(screen.getByTestId("age-input").props.value).toBe("35");

      // Go forward again
      fireEvent.press(screen.getByText("Continue").parent!);
      expect(screen.getByText("Step 2")).toBeTruthy();
    });
  });

  describe("State Persistence", () => {
    it("maintains profile data across all steps", () => {
      const screen = render(<ProfileSetupScreen />);

      // Step 1
      fireEvent.changeText(screen.getByTestId("age-input"), "28");
      fireEvent.press(screen.getByText("Continue").parent!);

      // Step 2
      fireEvent.press(screen.getByTestId("condition-Diabetes"));
      fireEvent.changeText(screen.getByTestId("allergies-input"), "Penicillin");
      fireEvent.press(screen.getByText("Continue").parent!);

      // Step 3
      fireEvent.press(screen.getByTestId("sleep-normal"));
      fireEvent.press(screen.getByTestId("activity-moderate"));

      // Go back to step 2
      fireEvent.press(screen.getByText("Back"));

      // Data should be preserved
      expect(screen.getByText("Diabetes ✓")).toBeTruthy();
      expect(screen.getByTestId("allergies-input").props.value).toBe(
        "Penicillin",
      );

      // Go back to step 1
      fireEvent.press(screen.getByText("Back"));

      expect(screen.getByTestId("age-input").props.value).toBe("28");
    });
  });

  describe("Validation Logic", () => {
    it("validates step 1 requires age", () => {
      const screen = render(<ProfileSetupScreen />);
      const touchables = screen.UNSAFE_getAllByType(TouchableOpacity);
      const continueButton = touchables[touchables.length - 1];

      expect(continueButton.props.disabled).toBe(true);

      fireEvent.changeText(screen.getByTestId("age-input"), "40");

      const updatedTouchables = screen.UNSAFE_getAllByType(TouchableOpacity);
      const updatedButton = updatedTouchables[updatedTouchables.length - 1];
      expect(updatedButton.props.disabled).toBe(false);
    });

    it("validates step 2 allows empty conditions", () => {
      const screen = render(<ProfileSetupScreen />);
      fireEvent.changeText(screen.getByTestId("age-input"), "30");
      fireEvent.press(screen.getByText("Continue").parent!);

      const touchables = screen.UNSAFE_getAllByType(TouchableOpacity);
      const continueButton = touchables[touchables.length - 1];

      // Should be enabled even with no conditions selected
      expect(continueButton.props.disabled).toBe(false);
    });

    it("validates step 3 requires both sleep and activity", () => {
      const screen = render(<ProfileSetupScreen />);
      fireEvent.changeText(screen.getByTestId("age-input"), "30");
      fireEvent.press(screen.getByText("Continue").parent!);
      fireEvent.press(screen.getByText("Continue").parent!);

      let touchables = screen.UNSAFE_getAllByType(TouchableOpacity);
      let continueButton = touchables[touchables.length - 1];
      expect(continueButton.props.disabled).toBe(true);

      // Select only sleep
      fireEvent.press(screen.getByTestId("sleep-normal"));
      touchables = screen.UNSAFE_getAllByType(TouchableOpacity);
      continueButton = touchables[touchables.length - 1];
      expect(continueButton.props.disabled).toBe(true);

      // Select activity too
      fireEvent.press(screen.getByTestId("activity-moderate"));
      touchables = screen.UNSAFE_getAllByType(TouchableOpacity);
      continueButton = touchables[touchables.length - 1];
      expect(continueButton.props.disabled).toBe(false);
    });
  });
});
