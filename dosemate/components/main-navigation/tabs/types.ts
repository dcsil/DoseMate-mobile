export interface Medication {
  id: string;
  name: string;
  strength: string;
  lastTaken: string;
  time: string;
  status: "taken";
}

export interface FullMedication {
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
  id: string;
  name: string;
  strength: string;
  time: string;
  isUrgent: boolean;
}

export interface User {
  id: string;
  name: string;
}

export interface MedicationData {
  today: {
    taken: number;
    total: number;
  };
  recent: Medication[];
  allMedications: FullMedication[];
}

export interface ReminderData {
  summary: {
    pending: number;
    completed: number;
    overdue: number;
  };
  upcoming: Reminder[];
}

export interface ProgressData {
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
  weeklyData: Array<{
    day: string;
    score: number;
  }>;
}

export interface MotivationData {
  title: string;
  message: string;
  badgeText: string;
  type: "positive";
}

export interface NavigationData {
  user: User;
  medications: MedicationData;
  reminders: ReminderData;
  progress: ProgressData;
  motivation: MotivationData;
}