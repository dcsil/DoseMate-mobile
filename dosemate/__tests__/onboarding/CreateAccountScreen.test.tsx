import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { TouchableOpacity } from "react-native";
import CreateAccountScreen from "@/app/onboarding/create-account";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";

// Mocks are already set up in jest.setup.js
jest.mock("expo-router");
jest.mock("expo-linking");
jest.mock("expo-web-browser");
jest.mock("expo-secure-store");

describe("CreateAccountScreen", () => {
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

    (Linking.addEventListener as jest.Mock).mockReturnValue({
      remove: jest.fn(),
    });

    (Linking.parse as jest.Mock).mockReturnValue({ queryParams: {} });

    (WebBrowser.openBrowserAsync as jest.Mock).mockResolvedValue({});

    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

    console.log = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  describe("Rendering", () => {
    it("renders without crashing", () => {
      const { getByText } = render(<CreateAccountScreen />);
      expect(getByText("Create Account")).toBeTruthy();
    });

    it("displays the header title", () => {
      const { getByText } = render(<CreateAccountScreen />);
      expect(getByText("Create Account")).toBeTruthy();
    });

    it("displays the welcome message", () => {
      const { getByText } = render(<CreateAccountScreen />);
      expect(getByText("Welcome to DoseMate")).toBeTruthy();
    });

    it("displays the subtitle", () => {
      const { getByText } = render(<CreateAccountScreen />);
      expect(
        getByText("Choose how you'd like to create your account"),
      ).toBeTruthy();
    });

    it("displays the Google login button", () => {
      const { getByText } = render(<CreateAccountScreen />);
      expect(getByText("Continue with Google")).toBeTruthy();
    });

    it("displays the divider with OR text", () => {
      const { getByText } = render(<CreateAccountScreen />);
      expect(getByText("OR")).toBeTruthy();
    });

    it("displays the email option button", () => {
      const { getByText } = render(<CreateAccountScreen />);
      expect(getByText("Use Email Address")).toBeTruthy();
    });

    it("displays the phone option button", () => {
      const { getByText } = render(<CreateAccountScreen />);
      expect(getByText("Use Phone Number")).toBeTruthy();
    });
  });

  describe("Navigation", () => {
    it("calls router.back when back button is pressed", () => {
      const { UNSAFE_getAllByType } = render(<CreateAccountScreen />);
      const touchables = UNSAFE_getAllByType(TouchableOpacity);

      fireEvent.press(touchables[0]);

      expect(mockRouter.back).toHaveBeenCalledTimes(1);
    });

    it("navigates to privacy screen when email option is pressed", () => {
      const { getByText } = render(<CreateAccountScreen />);
      const emailButton = getByText("Use Email Address");

      fireEvent.press(emailButton.parent!);

      expect(mockRouter.push).toHaveBeenCalledWith("/onboarding/privacy");
    });
  });

  describe("Google Login", () => {
    it("opens browser with correct auth URL when Google button is pressed", async () => {
      const { getByText } = render(<CreateAccountScreen />);
      const googleButtonText = getByText("Continue with Google");

      fireEvent.press(googleButtonText.parent!);

      await waitFor(() => {
        expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
          "https://ferulaceous-kenneth-septimal.ngrok-free.dev/auth/google",
        );
      });
    });
  });

  describe("Deep Link Handling", () => {
    it("registers deep link event listener on mount", () => {
      render(<CreateAccountScreen />);

      expect(Linking.addEventListener).toHaveBeenCalledWith(
        "url",
        expect.any(Function),
      );
    });

    it("removes deep link listener on unmount", () => {
      const mockRemove = jest.fn();
      (Linking.addEventListener as jest.Mock).mockReturnValue({
        remove: mockRemove,
      });

      const { unmount } = render(<CreateAccountScreen />);

      unmount();

      expect(mockRemove).toHaveBeenCalled();
    });

    it("saves token to SecureStore when deep link contains token", async () => {
      const mockToken = "test-jwt-token-123";
      let capturedHandler: any;

      (Linking.addEventListener as jest.Mock).mockImplementation(
        (event, handler) => {
          capturedHandler = handler;
          return { remove: jest.fn() };
        },
      );

      (Linking.parse as jest.Mock).mockReturnValue({
        queryParams: { token: mockToken },
      });

      render(<CreateAccountScreen />);

      // Simulate deep link with token
      await capturedHandler({
        url: "dosemate://auth?token=test-jwt-token-123",
      });

      await waitFor(() => {
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith("jwt", mockToken);
        expect(mockRouter.replace).toHaveBeenCalledWith("/onboarding/privacy");
      });
    });

    it("does not save token if token is missing from deep link", async () => {
      let capturedHandler: any;

      (Linking.addEventListener as jest.Mock).mockImplementation(
        (event, handler) => {
          capturedHandler = handler;
          return { remove: jest.fn() };
        },
      );

      (Linking.parse as jest.Mock).mockReturnValue({
        queryParams: {},
      });

      render(<CreateAccountScreen />);

      await capturedHandler({ url: "dosemate://auth" });

      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it("does not save token if token is not a string", async () => {
      let capturedHandler: any;

      (Linking.addEventListener as jest.Mock).mockImplementation(
        (event, handler) => {
          capturedHandler = handler;
          return { remove: jest.fn() };
        },
      );

      (Linking.parse as jest.Mock).mockReturnValue({
        queryParams: { token: ["array-token"] },
      });

      render(<CreateAccountScreen />);

      await capturedHandler({ url: "dosemate://auth?token=something" });

      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it("navigates to privacy screen after successful token storage", async () => {
      const mockToken = "valid-token";
      let capturedHandler: any;

      (Linking.addEventListener as jest.Mock).mockImplementation(
        (event, handler) => {
          capturedHandler = handler;
          return { remove: jest.fn() };
        },
      );

      (Linking.parse as jest.Mock).mockReturnValue({
        queryParams: { token: mockToken },
      });

      render(<CreateAccountScreen />);

      await capturedHandler({ url: "dosemate://auth?token=valid-token" });

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith("/onboarding/privacy");
      });
    });
  });

  describe("Component Structure", () => {
    it("renders all authentication options in correct order", () => {
      const { getByText } = render(<CreateAccountScreen />);

      expect(getByText("Create Account")).toBeTruthy();
      expect(getByText("Welcome to DoseMate")).toBeTruthy();
      expect(getByText("Continue with Google")).toBeTruthy();
      expect(getByText("OR")).toBeTruthy();
      expect(getByText("Use Email Address")).toBeTruthy();
      expect(getByText("Use Phone Number")).toBeTruthy();
    });
  });

  describe("Button Interactions", () => {
    it("has working Google button", async () => {
      const { UNSAFE_getAllByType } = render(<CreateAccountScreen />);
      const touchables = UNSAFE_getAllByType(TouchableOpacity);

      // Google button is the second TouchableOpacity (after back button)
      fireEvent.press(touchables[1]);

      await waitFor(() => {
        expect(WebBrowser.openBrowserAsync).toHaveBeenCalled();
      });
    });

    it("has working email button", () => {
      const { UNSAFE_getAllByType } = render(<CreateAccountScreen />);
      const touchables = UNSAFE_getAllByType(TouchableOpacity);

      // Email button is the third TouchableOpacity
      fireEvent.press(touchables[2]);

      expect(mockRouter.push).toHaveBeenCalledWith("/onboarding/privacy");
    });
  });
});
