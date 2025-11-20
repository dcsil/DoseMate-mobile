import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface MedicationNotification {
  medicationId: number;
  name: string;
  strength: string;
  quantity: string;
  times: string[];
  days: string[];
  frequency: string;
  startDate?: string;
  endDate?: string;
  instructions?: string;
}

class NotificationService {
  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Notification permissions not granted");
      return false;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("medication-reminders", {
        name: "Medication Reminders",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: "default",
        enableVibrate: true,
      });
    }

    return true;
  }

  parseTime(timeStr: string): { hour: number; minute: number } {
    try {
      // Handle empty or invalid input
      if (!timeStr || typeof timeStr !== 'string') {
        console.error('Invalid time string:', timeStr);
        return { hour: 9, minute: 0 }; // Default to 9:00 AM
      }

      // Trim whitespace
      timeStr = timeStr.trim();

      // Debug: Log the exact string and its character codes
      console.log('Parsing time string:', JSON.stringify(timeStr));
      console.log('Character codes:', Array.from(timeStr).map(c => c.charCodeAt(0)));

      // Try to match pattern: "H:MM AM/PM" or "HH:MM AM/PM" or "H:M AM/PM"
      const timeRegex = /^(\d{1,2}):(\d{1,2})\s+(AM|PM)$/i;
      const match = timeStr.match(timeRegex);

      if (!match) {
        console.error('Time format invalid (expected "H:MM AM/PM" or "HH:MM AM/PM"):', timeStr);
        console.error('Regex failed. Attempting manual parse...');
        
        // Fallback: Try manual parsing
        try {
          // Remove any non-standard characters and normalize
          const cleaned = timeStr.replace(/[^\d:APMapm\s]/g, '').trim();
          console.log('Cleaned string:', cleaned);
          
          // Try splitting by colon
          const colonSplit = cleaned.split(':');
          if (colonSplit.length === 2) {
            const hour = parseInt(colonSplit[0].trim(), 10);
            const rest = colonSplit[1].trim().split(/\s+/);
            const minute = parseInt(rest[0], 10);
            const period = rest[1]?.toUpperCase();
            
            if (!isNaN(hour) && !isNaN(minute) && (period === 'AM' || period === 'PM')) {
              console.log('Manual parse succeeded:', { hour, minute, period });
              
              // Convert to 24-hour format
              let finalHour = hour;
              if (period === "PM" && hour !== 12) {
                finalHour += 12;
              } else if (period === "AM" && hour === 12) {
                finalHour = 0;
              }
              
              console.log(`✅ Parsed time "${timeStr}" → ${finalHour}:${minute}`);
              return { hour: finalHour, minute };
            }
          }
        } catch (fallbackError) {
          console.error('Manual parse also failed:', fallbackError);
        }
        
        return { hour: 9, minute: 0 };
      }

      let hour = parseInt(match[1], 10);
      let minute = parseInt(match[2], 10);
      const period = match[3].toUpperCase();

      // Validate parsed values
      if (isNaN(hour) || isNaN(minute)) {
        console.error('Failed to parse time components:', { hour, minute, timeStr });
        return { hour: 9, minute: 0 };
      }

      // Validate ranges
      if (hour < 1 || hour > 12) {
        console.error('Hour out of range (1-12):', hour);
        hour = 9;
      }
      if (minute < 0 || minute > 59) {
        console.error('Minute out of range (0-59):', minute);
        minute = 0;
      }

      // Convert to 24-hour format
      if (period === "PM" && hour !== 12) {
        hour += 12;
      } else if (period === "AM" && hour === 12) {
        hour = 0;
      }

      console.log(`✅ Parsed time "${timeStr}" → ${hour}:${minute}`);
      return { hour, minute };
    } catch (error) {
      console.error('Error parsing time:', timeStr, error);
      return { hour: 9, minute: 0 }; // Default fallback
    }
  }

  dayToNumber(day: string): number {
    const days = {
      Sunday: 1,
      Monday: 2,
      Tuesday: 3,
      Wednesday: 4,
      Thursday: 5,
      Friday: 6,
      Saturday: 7,
    };
    return days[day as keyof typeof days] ?? 2;
  }

  // Check if a date is within the medication's active period
  isDateInRange(date: Date, startDate?: string, endDate?: string): boolean {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (checkDate < start) return false;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (checkDate > end) return false;
    }

    return true;
  }

  // Schedule medication based on flexible frequency
  async scheduleMedicationNotifications(
    medication: MedicationNotification,
  ): Promise<string[]> {
    const notificationIds: string[] = [];

    // Handle "As Needed" medications (no scheduled notifications)
    if (medication.frequency === "As Needed") {
      console.log(`${medication.name} is "As Needed" - no notifications scheduled`);
      return notificationIds;
    }

    // Schedule for each time of day
    for (const timeStr of medication.times) {
      const { hour, minute } = this.parseTime(timeStr);

      if (medication.frequency === "Daily") {
        // Daily medication on selected days
        if (medication.days && medication.days.length > 0) {
          for (const day of medication.days) {
            const trigger: Notifications.WeeklyTriggerInput = {
              type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
              weekday: this.dayToNumber(day),
              hour,
              minute,
            };

            const id = await this.scheduleNotification(medication, trigger, timeStr);
            notificationIds.push(id);
          }
        } else {
          // Every day
          const trigger: Notifications.DailyTriggerInput = {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
          };

          const id = await this.scheduleNotification(medication, trigger, timeStr);
          notificationIds.push(id);
        }
      } else if (medication.frequency === "Specific Days") {
        // Specific days of the week
        for (const day of medication.days) {
          const trigger: Notifications.WeeklyTriggerInput = {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: this.dayToNumber(day),
            hour,
            minute,
          };

          const id = await this.scheduleNotification(medication, trigger, timeStr);
          notificationIds.push(id);
        }
      } else if (medication.frequency === "Every Other Day") {
        // For every other day, we'll use daily trigger and check date in handler
        // This is a limitation - we'll schedule daily and rely on user to skip days
        // Alternative: Schedule specific dates for next 90 days
        await this.scheduleEveryOtherDay(medication, timeStr, notificationIds);
      }
    }

    console.log(`✅ Scheduled ${notificationIds.length} notifications for ${medication.name}`);
    return notificationIds;
  }

  // Schedule notification with common content
  private async scheduleNotification(
    medication: MedicationNotification,
    trigger: Notifications.DailyTriggerInput | Notifications.WeeklyTriggerInput | Notifications.TimeIntervalTriggerInput,
    timeStr: string,
  ): Promise<string> {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `💊 Time for ${medication.name}`,
        body: `Take ${medication.quantity} (${medication.strength})${
          medication.instructions ? `\n${medication.instructions}` : ""
        }`,
        data: {
          medicationId: medication.medicationId,
          time: timeStr,
          type: "medication-reminder",
          startDate: medication.startDate,
          endDate: medication.endDate,
        },
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.HIGH,
        categoryIdentifier: "medication-reminder",
      },
      trigger,
    });

    return id;
  }

  // Handle "Every Other Day" scheduling
  private async scheduleEveryOtherDay(
    medication: MedicationNotification,
    timeStr: string,
    notificationIds: string[],
  ): Promise<void> {
    const { hour, minute } = this.parseTime(timeStr);
    const startDate = medication.startDate ? new Date(medication.startDate) : new Date();
    const endDate = medication.endDate ? new Date(medication.endDate) : new Date();
    
    // If no end date, schedule for next 90 days
    if (!medication.endDate) {
      endDate.setDate(endDate.getDate() + 90);
    }

    // Start from today or start date
    let currentDate = new Date(Math.max(startDate.getTime(), new Date().getTime()));
    currentDate.setHours(hour, minute, 0, 0);

    // Determine if today should have a dose (if it's an even/odd day from start)
    const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceStart % 2 !== 0) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Schedule every other day
    while (currentDate <= endDate) {
      const now = new Date();
      if (currentDate > now) {
        const secondsUntil = Math.floor((currentDate.getTime() - now.getTime()) / 1000);

        const trigger: Notifications.TimeIntervalTriggerInput = {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntil,
          repeats: false,
        };

        const id = await this.scheduleNotification(medication, trigger, timeStr);
        notificationIds.push(id);
      }

      // Move to next occurrence (2 days later)
      currentDate.setDate(currentDate.getDate() + 2);
    }
  }


  async scheduleMedicationWithMultipleTimes(
    medicationId: number,
    name: string,
    strength: string,
    quantity: string,
    times: string[],
    days?: string[],
    instructions?: string,
  ): Promise<string[]> {
    return this.scheduleMedicationNotifications({
      medicationId,
      name,
      strength,
      quantity,
      times,
      days: days || [],
      frequency: days && days.length > 0 && days.length < 7 ? "Specific Days" : "Daily",
      instructions,
    });
  }

  async cancelNotifications(notificationIds: string[]): Promise<void> {
    for (const id of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  }

  async cancelMedicationNotifications(medicationId: number): Promise<void> {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    const notificationIds = scheduledNotifications
      .filter((notif) => notif.content.data?.medicationId === medicationId)
      .map((notif) => notif.identifier);

    await this.cancelNotifications(notificationIds);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  async getMedicationNotifications(
    medicationId: number,
  ): Promise<Notifications.NotificationRequest[]> {
    const allNotifications = await this.getScheduledNotifications();
    return allNotifications.filter(
      (notif) => notif.content.data?.medicationId === medicationId,
    );
  }

  // Get notifications summary grouped by medication
  async getNotificationsSummary(): Promise<{
    total: number;
    byMedication: Map<number, number>;
  }> {
    const notifications = await this.getScheduledNotifications();
    const byMedication = new Map<number, number>();

    notifications.forEach((notif) => {
      const medIdRaw = notif.content.data?.medicationId;
      const medId =
        typeof medIdRaw === "number"
          ? medIdRaw
          : medIdRaw != null
          ? parseInt(String(medIdRaw), 10)
          : NaN;

      if (Number.isFinite(medId)) {
        byMedication.set(medId, (byMedication.get(medId) ?? 0) + 1);
      }
    });

    return {
      total: notifications.length,
      byMedication,
    };
  }

  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (
      response: Notifications.NotificationResponse,
    ) => void,
  ) {
    const receivedListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
        onNotificationReceived?.(notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        onNotificationResponse?.(response);
      });

    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }

  async sendTestNotification(medicationName: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `💊 Test: Time for ${medicationName}`,
        body: "This is a test notification - tap to open app",
        data: { type: "test" },
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
  }
}

export const notificationService = new NotificationService();