import { notificationService } from "@/components/services/notificationService";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  AndroidImportance: { MAX: "max" },
  AndroidNotificationPriority: { HIGH: "high" },
  SchedulableTriggerInputTypes: {
    DAILY: "daily",
    WEEKLY: "weekly",
    TIME_INTERVAL: "timeInterval",
  },
}));

describe("notificationService", () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  // --- requestPermissions ---

  it("returns true when permissions already granted (iOS) and does not request again", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    const result = await notificationService.requestPermissions();

    expect(result).toBe(true);
    expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
  });

  it("requests permissions and sets Android channel when granted", async () => {
    const originalOS = Platform.OS;

    // Force Android for this test
    // @ts-ignore - overriding read-only type in tests is ok
    Object.defineProperty(Platform, "OS", {
      value: "android",
    });

    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "undetermined",
    });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });

    const result = await notificationService.requestPermissions();

    expect(result).toBe(true);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
      "medication-reminders",
      expect.objectContaining({
        name: "Medication Reminders",
        importance: Notifications.AndroidImportance.MAX,
      }),
    );

    // Restore original platform
    // @ts-ignore
    Object.defineProperty(Platform, "OS", {
      value: originalOS,
    });
  });

  it("returns false when permissions are denied", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    const result = await notificationService.requestPermissions();

    expect(result).toBe(false);
    expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith("Notification permissions not granted");
  });

  // --- parseTime ---

  it("parses valid AM time strings correctly", () => {
    const res = notificationService.parseTime("8:05 AM");
    expect(res).toEqual({ hour: 8, minute: 5 });
  });

  it("parses valid PM time strings and converts to 24h format", () => {
    const res = notificationService.parseTime("7:30 PM");
    expect(res).toEqual({ hour: 19, minute: 30 });
  });

  it("handles 12 AM and 12 PM correctly", () => {
    const midnight = notificationService.parseTime("12:00 AM");
    const noon = notificationService.parseTime("12:00 PM");

    expect(midnight).toEqual({ hour: 0, minute: 0 });
    expect(noon).toEqual({ hour: 12, minute: 0 });
  });

  it("falls back to default time when format is invalid", () => {
    const res = notificationService.parseTime("bad time string");
    expect(res).toEqual({ hour: 9, minute: 0 });
    expect(errorSpy).toHaveBeenCalled();
  });

  // --- dayToNumber ---

  it("maps weekday names to correct numbers and defaults to Monday", () => {
    expect(notificationService.dayToNumber("Sunday")).toBe(1);
    expect(notificationService.dayToNumber("Monday")).toBe(2);
    expect(notificationService.dayToNumber("Saturday")).toBe(7);
    // Unknown -> defaults to Monday (2)
    expect(notificationService.dayToNumber("Blursday" as any)).toBe(2);
  });

  // --- isDateInRange ---

  it("returns true when no start/end dates are provided", () => {
    const today = new Date();
    expect(notificationService.isDateInRange(today)).toBe(true);
  });

  it("respects startDate and endDate boundaries", () => {
    // Fixed midnight UTC to avoid timezone surprises
    const date = new Date("2025-01-10T00:00:00Z");

    // Inside range
    expect(
      notificationService.isDateInRange(date, "2025-01-01", "2025-01-31"),
    ).toBe(true);

    // Start date after the date -> should be false
    expect(
      notificationService.isDateInRange(date, "2025-02-01", "2025-02-28"),
    ).toBe(false);

    // End date before the date -> should be false
    expect(
      notificationService.isDateInRange(date, "2025-01-01", "2025-01-09"),
    ).toBe(false);
  });

  // --- scheduleMedicationNotifications ---

  it('does not schedule notifications for "As Needed" medications', async () => {
    const med = {
      medicationId: 1,
      name: "TestMed",
      strength: "10 mg",
      quantity: "1 tablet",
      times: ["8:00 AM"],
      days: [],
      frequency: "As Needed",
      instructions: "With water",
    };

    const result =
      await notificationService.scheduleMedicationNotifications(med);

    expect(result).toEqual([]);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("schedules daily notifications when no specific days are provided", async () => {
    (Notifications.scheduleNotificationAsync as jest.Mock)
      .mockResolvedValueOnce("notif-1")
      .mockResolvedValueOnce("notif-2");

    const med = {
      medicationId: 1,
      name: "DailyMed",
      strength: "20 mg",
      quantity: "1 tablet",
      times: ["8:00 AM", "10:00 PM"],
      days: [],
      frequency: "Daily",
      instructions: "With water",
    };

    const result =
      await notificationService.scheduleMedicationNotifications(med);

    expect(result).toEqual(["notif-1", "notif-2"]);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);

    const firstCall = (Notifications.scheduleNotificationAsync as jest.Mock)
      .mock.calls[0][0];
    expect(firstCall.trigger).toEqual({
      type: "daily",
      hour: 8,
      minute: 0,
    });
  });

  it("schedules weekly notifications for specific days", async () => {
    (Notifications.scheduleNotificationAsync as jest.Mock)
      .mockResolvedValueOnce("notif-mon")
      .mockResolvedValueOnce("notif-wed");

    const med = {
      medicationId: 2,
      name: "SpecificDaysMed",
      strength: "5 mg",
      quantity: "1 tablet",
      times: ["9:00 AM"],
      days: ["Monday", "Wednesday"],
      frequency: "Specific Days",
      instructions: "",
    };

    const result =
      await notificationService.scheduleMedicationNotifications(med);

    expect(result).toEqual(["notif-mon", "notif-wed"]);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);

    const firstTrigger = (Notifications.scheduleNotificationAsync as jest.Mock)
      .mock.calls[0][0].trigger;
    const secondTrigger = (Notifications.scheduleNotificationAsync as jest.Mock)
      .mock.calls[1][0].trigger;

    expect(firstTrigger).toEqual({
      type: "weekly",
      weekday: notificationService.dayToNumber("Monday"),
      hour: 9,
      minute: 0,
    });
    expect(secondTrigger.weekday).toBe(
      notificationService.dayToNumber("Wednesday"),
    );
  });

  it('schedules notifications for "Every Other Day" frequency', async () => {
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
      "notif-eod",
    );

    const med = {
      medicationId: 3,
      name: "EODMed",
      strength: "10 mg",
      quantity: "1 tablet",
      times: ["8:00 AM"],
      days: [],
      frequency: "Every Other Day",
      startDate: new Date().toISOString(),
      // no endDate -> internal 90-day window
    };

    const result =
      await notificationService.scheduleMedicationNotifications(med);

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    expect(result.length).toBeGreaterThan(0);

    const trigger = (Notifications.scheduleNotificationAsync as jest.Mock).mock
      .calls[0][0].trigger;
    expect(trigger.type).toBe("timeInterval");
    expect(typeof trigger.seconds).toBe("number");
  });

  // --- scheduleMedicationWithMultipleTimes ---

  it("scheduleMedicationWithMultipleTimes uses 'Specific Days' when a subset of days is provided", async () => {
    const spy = jest
      .spyOn(notificationService as any, "scheduleMedicationNotifications")
      .mockResolvedValue(["id-1"]);

    const result =
      await notificationService.scheduleMedicationWithMultipleTimes(
        10,
        "MultiMed",
        "25 mg",
        "1 tablet",
        ["8:00 AM"],
        ["Monday", "Wednesday"],
        "With food",
      );

    // 👇 derive the real arg type from the function
    type ScheduleMedArg = Parameters<
      typeof notificationService.scheduleMedicationNotifications
    >[0];

    const arg = spy.mock.calls[0][0] as ScheduleMedArg;

    expect(arg.frequency).toBe("Specific Days");
    expect(arg.days).toEqual(["Monday", "Wednesday"]);
    expect(result).toEqual(["id-1"]);

    spy.mockRestore();
  });

  it("scheduleMedicationWithMultipleTimes uses 'Daily' when no days provided", async () => {
    const spy = jest
      .spyOn(notificationService as any, "scheduleMedicationNotifications")
      .mockResolvedValue(["id-2"]);

    await notificationService.scheduleMedicationWithMultipleTimes(
      11,
      "DailyMultiMed",
      "10 mg",
      "1 tablet",
      ["9:00 AM"],
      undefined,
      "With water",
    );

    type ScheduleMedArg = Parameters<
      typeof notificationService.scheduleMedicationNotifications
    >[0];

    const arg = spy.mock.calls[0][0] as ScheduleMedArg;

    expect(arg.frequency).toBe("Daily");
    expect(arg.days).toEqual([]);
    spy.mockRestore();
  });

  // --- cancel / get notifications ---

  it("cancelNotifications cancels each provided id", async () => {
    (
      Notifications.cancelScheduledNotificationAsync as jest.Mock
    ).mockResolvedValue(undefined);

    await notificationService.cancelNotifications(["id-1", "id-2"]);

    expect(
      Notifications.cancelScheduledNotificationAsync,
    ).toHaveBeenCalledTimes(2);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      "id-1",
    );
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      "id-2",
    );
  });

  it("cancelMedicationNotifications cancels only notifications for that medicationId", async () => {
    (
      Notifications.getAllScheduledNotificationsAsync as jest.Mock
    ).mockResolvedValue([
      {
        identifier: "a",
        content: { data: { medicationId: 1 } },
      },
      {
        identifier: "b",
        content: { data: { medicationId: 2 } },
      },
      {
        identifier: "c",
        content: { data: { medicationId: 1 } },
      },
    ]);

    (
      Notifications.cancelScheduledNotificationAsync as jest.Mock
    ).mockResolvedValue(undefined);

    await notificationService.cancelMedicationNotifications(1);

    expect(
      Notifications.cancelScheduledNotificationAsync,
    ).toHaveBeenCalledTimes(2);
    const calls = (
      Notifications.cancelScheduledNotificationAsync as jest.Mock
    ).mock.calls.map((c) => c[0]);
    expect(calls.sort()).toEqual(["a", "c"]);
  });

  it("getMedicationNotifications filters by medicationId", async () => {
    (
      Notifications.getAllScheduledNotificationsAsync as jest.Mock
    ).mockResolvedValue([
      {
        identifier: "a",
        content: { data: { medicationId: 1 } },
      },
      {
        identifier: "b",
        content: { data: { medicationId: 2 } },
      },
    ]);

    const result = await notificationService.getMedicationNotifications(2);

    expect(result).toHaveLength(1);
    expect(result[0].identifier).toBe("b");
  });

  it("getNotificationsSummary groups notifications by medication", async () => {
    (
      Notifications.getAllScheduledNotificationsAsync as jest.Mock
    ).mockResolvedValue([
      {
        identifier: "a",
        content: { data: { medicationId: 1 } },
      },
      {
        identifier: "b",
        content: { data: { medicationId: "1" } },
      },
      {
        identifier: "c",
        content: { data: { medicationId: 2 } },
      },
      {
        identifier: "d",
        content: { data: { foo: "no med id" } },
      },
    ]);

    const summary = await notificationService.getNotificationsSummary();

    expect(summary.total).toBe(4);
    expect(summary.byMedication.get(1)).toBe(2);
    expect(summary.byMedication.get(2)).toBe(1);
  });

  // --- setupNotificationListeners ---

  it("setupNotificationListeners wires up received and response listeners and returns cleanup", () => {
    const receivedRemove = jest.fn();
    const responseRemove = jest.fn();
    const receivedHandlers: any[] = [];
    const responseHandlers: any[] = [];

    (
      Notifications.addNotificationReceivedListener as jest.Mock
    ).mockImplementation((handler) => {
      receivedHandlers.push(handler);
      return { remove: receivedRemove };
    });

    (
      Notifications.addNotificationResponseReceivedListener as jest.Mock
    ).mockImplementation((handler) => {
      responseHandlers.push(handler);
      return { remove: responseRemove };
    });

    const onReceived = jest.fn();
    const onResponse = jest.fn();

    const cleanup = notificationService.setupNotificationListeners(
      onReceived,
      onResponse,
    );

    // Simulate callbacks firing
    const fakeNotification = { request: { identifier: "n1" } } as any;
    const fakeResponse = { notification: fakeNotification } as any;

    receivedHandlers[0](fakeNotification);
    responseHandlers[0](fakeResponse);

    expect(onReceived).toHaveBeenCalledWith(fakeNotification);
    expect(onResponse).toHaveBeenCalledWith(fakeResponse);

    // Cleanup removes listeners
    cleanup();
    expect(receivedRemove).toHaveBeenCalledTimes(1);
    expect(responseRemove).toHaveBeenCalledTimes(1);
  });

  // --- sendTestNotification ---

  it("sendTestNotification schedules a time-interval notification with correct content", async () => {
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
      "test-id",
    );

    await notificationService.sendTestNotification("SampleMed");

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);

    // ⬇️ add a type here instead of leaving arg as unknown
    type SchedulePayload = {
      content: { title: string; body?: string; data?: any };
      trigger: {
        type: string;
        seconds?: number;
        hour?: number;
        minute?: number;
        weekday?: number;
      };
    };

    const arg = (Notifications.scheduleNotificationAsync as jest.Mock).mock
      .calls[0][0] as SchedulePayload; // <-- cast from unknown

    expect(arg.content.title).toContain("Test: Time for SampleMed");
    expect(arg.trigger).toEqual({
      type: "timeInterval",
      seconds: 2,
    });
  });
});
