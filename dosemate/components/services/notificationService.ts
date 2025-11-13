import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
  time: string;
  days?: string[]; 
  instructions?: string;
}

class NotificationService {
  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('medication-reminders', {
        name: 'Medication Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
        enableVibrate: true,
      });
    }

    return true;
  }


  parseTime(timeStr: string): { hour: number; minute: number } {
    const [time, period] = timeStr.split(' ');
    let [hour, minute] = time.split(':').map(Number);

    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }

    return { hour, minute };
  }


  dayToNumber(day: string): number {
    const days = {
      'Sunday': 1,
      'Monday': 2,
      'Tuesday': 3,
      'Wednesday': 4,
      'Thursday': 5,
      'Friday': 6,
      'Saturday': 7,
    };
    return days[day as keyof typeof days] ?? 2;
  }

  // Schedule a single medication reminder
  async scheduleMedicationReminder(
    medication: MedicationNotification
  ): Promise<string[]> {
    const { hour, minute } = this.parseTime(medication.time);
    const notificationIds: string[] = [];

    // If specific days are provided, schedule for those days
    if (medication.days && medication.days.length > 0) {
      for (const day of medication.days) {
        const trigger: Notifications.WeeklyTriggerInput = {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: this.dayToNumber(day),
          hour,
          minute,
        };

        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `Time for ${medication.name}`,
            body: `Take ${medication.quantity} (${medication.strength})${
              medication.instructions ? `\n${medication.instructions}` : ''
            }`,
            data: {
              medicationId: medication.medicationId,
              type: 'medication-reminder',
            },
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            categoryIdentifier: 'medication-reminder',
          },
          trigger,
        });

        notificationIds.push(id);
      }
    } else {
      
      const trigger: Notifications.DailyTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      };

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time for ${medication.name}`,
          body: `Take ${medication.quantity} (${medication.strength})${
            medication.instructions ? `\n${medication.instructions}` : ''
          }`,
          data: {
            medicationId: medication.medicationId,
            type: 'medication-reminder',
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'medication-reminder',
        },
        trigger,
      });

      notificationIds.push(id);
    }

    return notificationIds;
  }

  
  async scheduleMedicationWithMultipleTimes(
    medicationId: number,
    name: string,
    strength: string,
    quantity: string,
    times: string[],
    days?: string[],
    instructions?: string
  ): Promise<string[]> {
    const allNotificationIds: string[] = [];

    for (const time of times) {
      const ids = await this.scheduleMedicationReminder({
        medicationId,
        name,
        strength,
        quantity,
        time,
        days,
        instructions,
      });
      allNotificationIds.push(...ids);
    }

    return allNotificationIds;
  }

  
  async cancelNotifications(notificationIds: string[]): Promise<void> {
    for (const id of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  }


  async cancelMedicationNotifications(medicationId: number): Promise<void> {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    const notificationIds = scheduledNotifications
      .filter((notif) => notif.content.data?.medicationId === medicationId)
      .map((notif) => notif.identifier);

    await this.cancelNotifications(notificationIds);
  }


  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  async getMedicationNotifications(
    medicationId: number
  ): Promise<Notifications.NotificationRequest[]> {
    const allNotifications = await this.getScheduledNotifications();
    return allNotifications.filter(
      (notif) => notif.content.data?.medicationId === medicationId
    );
  }


  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
  ) {
    
    const receivedListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        onNotificationReceived?.(notification);
      }
    );

   
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        onNotificationResponse?.(response);
      }
    );

    
    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }

 
  async sendTestNotification(medicationName: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Test: Time for ${medicationName}`,
        body: 'This is a test notification',
        data: { type: 'test' },
        sound: 'default',
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },
    });
  }
}

export const notificationService = new NotificationService();