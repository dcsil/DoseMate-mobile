export interface Medication {
  id: number;
  name: string;
  strength: string;
  quantity: string;
  frequency: string;
  times: string[];
  color: string;
  nextDose: string;
  adherence: number;
  foodInstructions: string;
  purpose: string;
}

export interface Reminder {
  id: number;
  name: string;
  strength: string;
  quantity: string;
  time: string;
  status: 'pending' | 'taken' | 'overdue' | 'snoozed';
  color: string;
  overdue: boolean;
  instructions: string;
}

export interface UserData {
  id: string;
  name: string;
}

export interface MedicationData {
  allMedications: Medication[];
}

export interface ReminderData {
  allReminders: Reminder[];
}

export interface ProgressData {
  progress: {
    today: {
      percentage: number;
      target: number;
      subtitle: string;
    };
    week: {
      percentage: number;
      taken: number;
      total: number;
      currentStreak: number;
      subtitle: string;
    };
    month: {
      percentage: number;
      taken: number;
      total: number;
      subtitle: string;
    };
    weeklyData: {
      day: string;
      score: number;
    };
  };
  recentActivity: {
    id: string;
    name: string;
    strength: string;
    lastTaken: string;
    time: string;
    status: "taken";
  };
}

export interface MotivationData {
  title: string;
  message: string;
  badgeText: string;
  type: "positive";
}

export interface NavigationData {
  profile: UserData;
  medications: MedicationData;
  reminders: ReminderData;
  progress: ProgressData;
  motivation: MotivationData;
}