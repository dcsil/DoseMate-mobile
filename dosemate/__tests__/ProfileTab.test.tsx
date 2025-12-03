// __tests__/ProfileTab.test.tsx
import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import { Alert } from "react-native";
import ProfileTab from "@/components/main-navigation/tabs/ProfileTab";
import * as SecureStore from "expo-secure-store";

declare const global: any;

jest.mock("@/config", () => ({
  BACKEND_BASE_URL: "https://example.com",
}));

// Mock Card as a simple container
jest.mock("@/components/main-navigation/Card", () => {
  const React = require("react");
  const { View } = require("react-native");
  return ({ children, ...props }: any) => <View {...props}>{children}</View>;
});

// Mock Ionicons → render icon name as text
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

// Mock SecureStore
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
}));

let mockFetch: jest.Mock;

describe("ProfileTab", () => {
  const alertMock = jest.spyOn(Alert, "alert").mockImplementation(() => {});

  beforeAll(() => {
    // @ts-ignore
    global.fetch = jest.fn();
    mockFetch = global.fetch as jest.Mock;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
    (SecureStore.getItemAsync as jest.Mock).mockReset();
  });

  it("shows loading state initially", () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("token123");
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ id: "1", name: "Test User" }),
    } as any);

    const { getByText } = render(<ProfileTab />);

    expect(getByText("Loading your profile...")).toBeTruthy();
  });

  it("shows error when user is not logged in (no JWT)", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    const { getByText } = render(<ProfileTab />);

    await waitFor(() => {
      expect(getByText("You're not logged in.")).toBeTruthy();
    });

    expect(
      getByText("Try logging in again or restarting the app."),
    ).toBeTruthy();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("shows error when /users/me fails with detail string", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("token123");

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ detail: "Forbidden" }),
      statusText: "Forbidden",
    } as any);

    const { getByText } = render(<ProfileTab />);

    await waitFor(() => {
      expect(getByText("Forbidden")).toBeTruthy();
    });
  });

  it("shows error when /users/me fails with detail array", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("token123");

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({
        detail: [{ msg: "Error A" }, { msg: "Error B" }],
      }),
      statusText: "Bad Request",
    } as any);

    const { getByText } = render(<ProfileTab />);

    await waitFor(() => {
      expect(getByText("Error A\nError B")).toBeTruthy();
    });
  });

  it("renders profile header, email, profile information, and premium card when data is available", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("token123");

    const mockUser = {
      id: "user-1",
      name: "Elyse Ando",
      email: "elyse@example.com",
    };

    const mockProfile = {
      age: 25,
      allergies: "Peanuts",
      conditions: ["Asthma", "Diabetes"],
      activity_level: "moderate",
      sleep_schedule: "night owl",
    };

    // First fetch: user
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockUser),
    } as any);

    // Second fetch: profile
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockProfile),
    } as any);

    const { getByText } = render(<ProfileTab />);

    await waitFor(() => {
      expect(getByText("Elyse Ando")).toBeTruthy();
    });

    // Email under name
    expect(getByText("elyse@example.com")).toBeTruthy();

    // Profile Information section
    expect(getByText("Profile Information")).toBeTruthy();

    // Age
    expect(getByText("Age")).toBeTruthy();
    expect(getByText("25 years old")).toBeTruthy();

    // Activity Level (capitalized)
    expect(getByText("Activity Level")).toBeTruthy();
    expect(getByText("Moderate")).toBeTruthy();

    // Sleep Schedule (capitalized)
    expect(getByText("Sleep Schedule")).toBeTruthy();
    expect(getByText("Night owl")).toBeTruthy();

    // Medical Conditions
    expect(getByText("Medical Conditions")).toBeTruthy();
    expect(getByText("Asthma, Diabetes")).toBeTruthy();

    // Allergies
    expect(getByText("Allergies")).toBeTruthy();
    expect(getByText("Peanuts")).toBeTruthy();

    // Premium card
    expect(getByText("DoseMate Premium")).toBeTruthy();
    expect(getByText("Get advanced analytics and family sharing")).toBeTruthy();
    expect(getByText("Learn More")).toBeTruthy();
  });

  it("falls back to email as display name when name is null", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("token123");

    const mockUser = {
      id: "user-2",
      name: null,
      email: "fallback@example.com",
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUser),
      } as any)
      .mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue({ detail: "No profile" }),
        statusText: "Not Found",
      } as any);

    const { getAllByText, queryByText } = render(<ProfileTab />);

    await waitFor(() => {
      const allEmailOccurrences = getAllByText("fallback@example.com");
      expect(allEmailOccurrences.length).toBeGreaterThanOrEqual(1);
    });

    expect(queryByText("Your Profile")).toBeNull();
  });

  it("uses 'Your Profile' when neither name nor email is present", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("token123");

    const mockUser = {
      id: "user-3",
      name: null,
      // no email
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUser),
      } as any)
      .mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue({ detail: "No profile" }),
        statusText: "Not Found",
      } as any);

    const { getByText, queryByText } = render(<ProfileTab />);

    await waitFor(() => {
      expect(getByText("Your Profile")).toBeTruthy();
    });

    // No email text in this scenario
    expect(queryByText(/@/)).toBeNull();

    // Empty profile card should show
    expect(getByText("No profile information yet")).toBeTruthy();
  });

  it("shows empty profile card when profile is missing (profile fetch fails) but user loads", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("token123");

    const mockUser = {
      id: "user-4",
      name: "Only User",
      email: "user4@example.com",
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUser),
      } as any)
      .mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue({ detail: "No profile found" }),
        statusText: "Not Found",
      } as any);

    const { getByText } = render(<ProfileTab />);

    await waitFor(() => {
      expect(getByText("Only User")).toBeTruthy();
    });

    expect(getByText("No profile information yet")).toBeTruthy();
    expect(
      getByText(
        "Add your health information to get personalized medication reminders",
      ),
    ).toBeTruthy();
  });

  it("shows generic error when an exception occurs while loading profile", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("token123");

    mockFetch.mockRejectedValueOnce(new Error("Network failure"));

    const { getByText } = render(<ProfileTab />);

    await waitFor(() => {
      expect(
        getByText("Something went wrong while loading your profile."),
      ).toBeTruthy();
    });
  });

  it("triggers DoseMate Premium alert when Learn More is pressed", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("token123");

    const mockUser = {
      id: "user-5",
      name: "Premium User",
      email: "premium@example.com",
    };

    const mockProfile = {
      age: null,
      allergies: null,
      conditions: null,
      activity_level: null,
      sleep_schedule: null,
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUser),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockProfile),
      } as any);

    const { getByText } = render(<ProfileTab />);

    await waitFor(() => {
      expect(getByText("Premium User")).toBeTruthy();
    });

    const learnMoreButton = getByText("Learn More");
    fireEvent.press(learnMoreButton);

    expect(alertMock).toHaveBeenCalled();

    const [title, message, buttons] =
      alertMock.mock.calls[alertMock.mock.calls.length - 1];

    expect(title).toBe("DoseMate Premium");
    expect(message).toContain("Advanced analytics");
    expect(message).toContain("Unlimited medications");
    expect(Array.isArray(buttons)).toBe(true);
    expect(buttons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: "stay tuned!", style: "cancel" }),
      ]),
    );
  });
});
