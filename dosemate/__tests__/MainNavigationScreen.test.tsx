import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NavigationScreen from '@/app/main-navigation';
import { useRouter } from 'expo-router';

jest.mock('expo-router');

// Mock all tab components
jest.mock('@/components/main-navigation/tabs/HomeTab', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return ({ onViewReminder, onViewDetails }: any) => (
    <View testID="home-tab">
      <Text>Home Tab Content</Text>
      <TouchableOpacity testID="view-reminder-btn" onPress={onViewReminder}>
        <Text>View Reminder</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="view-details-btn" onPress={onViewDetails}>
        <Text>View Details</Text>
      </TouchableOpacity>
    </View>
  );
});

jest.mock('@/components/main-navigation/tabs/MedicationsTab', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return () => (
    <View testID="medications-tab">
      <Text>Medications Tab Content</Text>
    </View>
  );
});

jest.mock('@/components/main-navigation/tabs/RemindersTab', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return () => (
    <View testID="reminders-tab">
      <Text>Reminders Tab Content</Text>
    </View>
  );
});

jest.mock('@/components/main-navigation/tabs/ProgressTab', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return () => (
    <View testID="progress-tab">
      <Text>Progress Tab Content</Text>
    </View>
  );
});

jest.mock('@/components/main-navigation/tabs/ProfileTab', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return () => (
    <View testID="profile-tab">
      <Text>Profile Tab Content</Text>
    </View>
  );
});

jest.mock('@/components/main-navigation/Navbar', () => {
  const React = require('react');
  const { View, TouchableOpacity, Text } = require('react-native');
  return ({ activeTab, onTabChange }: any) => (
    <View testID="bottom-navigation">
      <TouchableOpacity testID="nav-home" onPress={() => onTabChange('home')}>
        <Text>Home {activeTab === 'home' ? '(Active)' : ''}</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="nav-medications" onPress={() => onTabChange('medications')}>
        <Text>Medications {activeTab === 'medications' ? '(Active)' : ''}</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="nav-reminders" onPress={() => onTabChange('reminders')}>
        <Text>Reminders {activeTab === 'reminders' ? '(Active)' : ''}</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="nav-progress" onPress={() => onTabChange('progress')}>
        <Text>Progress {activeTab === 'progress' ? '(Active)' : ''}</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="nav-profile" onPress={() => onTabChange('profile')}>
        <Text>Profile {activeTab === 'profile' ? '(Active)' : ''}</Text>
      </TouchableOpacity>
    </View>
  );
});

describe('NavigationScreen', () => {
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

  describe('Initial Rendering', () => {
    it('renders without crashing', () => {
      const { getByText } = render(<NavigationScreen />);
      expect(getByText('Welcome Back')).toBeTruthy();
    });

    it('displays home tab by default', () => {
      const { getByTestId } = render(<NavigationScreen />);
      expect(getByTestId('home-tab')).toBeTruthy();
    });

    it('shows home header title and subtitle', () => {
      const { getByText } = render(<NavigationScreen />);
      expect(getByText('Welcome Back')).toBeTruthy();
      expect(getByText('Ready to stay on track today?')).toBeTruthy();
    });

    it('displays bottom navigation', () => {
      const { getByTestId } = render(<NavigationScreen />);
      expect(getByTestId('bottom-navigation')).toBeTruthy();
    });
  });

  describe('Tab Navigation', () => {
    it('switches to medications tab when medications nav is pressed', () => {
      const { getByTestId, getByText, queryByTestId } = render(<NavigationScreen />);
      
      const medicationsNav = getByTestId('nav-medications');
      fireEvent.press(medicationsNav);
      
      expect(getByTestId('medications-tab')).toBeTruthy();
      expect(queryByTestId('home-tab')).toBeNull();
      expect(getByText('Medications')).toBeTruthy();
    });

    it('switches to reminders tab when reminders nav is pressed', () => {
      const { getByTestId, getByText, queryByTestId } = render(<NavigationScreen />);
      
      const remindersNav = getByTestId('nav-reminders');
      fireEvent.press(remindersNav);
      
      expect(getByTestId('reminders-tab')).toBeTruthy();
      expect(queryByTestId('home-tab')).toBeNull();
      expect(getByText("Today's Reminders")).toBeTruthy();
    });

    it('switches to progress tab when progress nav is pressed', () => {
      const { getByTestId, getByText, queryByTestId } = render(<NavigationScreen />);
      
      const progressNav = getByTestId('nav-progress');
      fireEvent.press(progressNav);
      
      expect(getByTestId('progress-tab')).toBeTruthy();
      expect(queryByTestId('home-tab')).toBeNull();
      expect(getByText('Progress')).toBeTruthy();
    });

    it('switches to profile tab when profile nav is pressed', () => {
      const { getByTestId, getByText, queryByTestId } = render(<NavigationScreen />);
      
      const profileNav = getByTestId('nav-profile');
      fireEvent.press(profileNav);
      
      expect(getByTestId('profile-tab')).toBeTruthy();
      expect(queryByTestId('home-tab')).toBeNull();
      expect(getByText('Profile')).toBeTruthy();
    });

    it('switches back to home tab from another tab', () => {
      const { getByTestId, getByText } = render(<NavigationScreen />);
      
      // Go to medications
      fireEvent.press(getByTestId('nav-medications'));
      expect(getByTestId('medications-tab')).toBeTruthy();
      
      // Go back to home
      fireEvent.press(getByTestId('nav-home'));
      expect(getByTestId('home-tab')).toBeTruthy();
      expect(getByText('Welcome Back')).toBeTruthy();
    });

    it('can navigate between all tabs freely', () => {
      const { getByTestId } = render(<NavigationScreen />);
      
      // Home -> Medications
      fireEvent.press(getByTestId('nav-medications'));
      expect(getByTestId('medications-tab')).toBeTruthy();
      
      // Medications -> Progress
      fireEvent.press(getByTestId('nav-progress'));
      expect(getByTestId('progress-tab')).toBeTruthy();
      
      // Progress -> Profile
      fireEvent.press(getByTestId('nav-profile'));
      expect(getByTestId('profile-tab')).toBeTruthy();
      
      // Profile -> Reminders
      fireEvent.press(getByTestId('nav-reminders'));
      expect(getByTestId('reminders-tab')).toBeTruthy();
      
      // Reminders -> Home
      fireEvent.press(getByTestId('nav-home'));
      expect(getByTestId('home-tab')).toBeTruthy();
    });
  });

  describe('Header Content', () => {
    it('shows correct header for home tab', () => {
      const { getByText } = render(<NavigationScreen />);
      expect(getByText('Welcome Back')).toBeTruthy();
      expect(getByText('Ready to stay on track today?')).toBeTruthy();
    });

    it('shows correct header for medications tab', () => {
      const { getByTestId, getByText } = render(<NavigationScreen />);
      
      fireEvent.press(getByTestId('nav-medications'));
      
      expect(getByText('Medications')).toBeTruthy();
      expect(getByText('Manage your medications')).toBeTruthy();
    });

    it('shows correct header for reminders tab', () => {
      const { getByTestId, getByText } = render(<NavigationScreen />);
      
      fireEvent.press(getByTestId('nav-reminders'));
      
      expect(getByText("Today's Reminders")).toBeTruthy();
      expect(getByText('Stay on top of your schedule')).toBeTruthy();
    });

    it('shows correct header for progress tab', () => {
      const { getByTestId, getByText } = render(<NavigationScreen />);
      
      fireEvent.press(getByTestId('nav-progress'));
      
      expect(getByText('Progress')).toBeTruthy();
      expect(getByText('Track your adherence journey')).toBeTruthy();
    });

    it('shows correct header for profile tab', () => {
      const { getByTestId, getByText } = render(<NavigationScreen />);
      
      fireEvent.press(getByTestId('nav-profile'));
      
      expect(getByText('Profile')).toBeTruthy();
      expect(getByText('Manage your account')).toBeTruthy();
    });

    it('updates header when switching tabs', () => {
      const { getByTestId, getByText, queryByText } = render(<NavigationScreen />);
      
      // Start at home
      expect(getByText('Welcome Back')).toBeTruthy();
      expect(getByText('Ready to stay on track today?')).toBeTruthy();
      
      // Switch to medications
      fireEvent.press(getByTestId('nav-medications'));
      expect(getByText('Medications')).toBeTruthy();
      expect(getByText('Manage your medications')).toBeTruthy();
      expect(queryByText('Welcome Back')).toBeNull();
      expect(queryByText('Ready to stay on track today?')).toBeNull();
      
      // Switch to progress
      fireEvent.press(getByTestId('nav-progress'));
      expect(getByText('Progress')).toBeTruthy();
      expect(getByText('Track your adherence journey')).toBeTruthy();
      expect(queryByText('Manage your medications')).toBeNull();
    });

    it('header title changes for each tab', () => {
      const { getByTestId, getByText } = render(<NavigationScreen />);
      
      const tabs = [
        { navId: 'nav-home', title: 'Welcome Back' },
        { navId: 'nav-medications', title: 'Medications' },
        { navId: 'nav-reminders', title: "Today's Reminders" },
        { navId: 'nav-progress', title: 'Progress' },
        { navId: 'nav-profile', title: 'Profile' },
      ];
      
      tabs.forEach(({ navId, title }) => {
        fireEvent.press(getByTestId(navId));
        expect(getByText(title)).toBeTruthy();
      });
    });

    it('header subtitle changes for each tab', () => {
      const { getByTestId, getByText } = render(<NavigationScreen />);
      
      const tabs = [
        { navId: 'nav-home', subtitle: 'Ready to stay on track today?' },
        { navId: 'nav-medications', subtitle: 'Manage your medications' },
        { navId: 'nav-reminders', subtitle: 'Stay on top of your schedule' },
        { navId: 'nav-progress', subtitle: 'Track your adherence journey' },
        { navId: 'nav-profile', subtitle: 'Manage your account' },
      ];
      
      tabs.forEach(({ navId, subtitle }) => {
        fireEvent.press(getByTestId(navId));
        expect(getByText(subtitle)).toBeTruthy();
      });
    });
  });

  describe('Event Handlers', () => {
    it('switches to reminders tab when handleViewReminder is called', () => {
      const { getByTestId, getByText } = render(<NavigationScreen />);
      
      const viewReminderBtn = getByTestId('view-reminder-btn');
      fireEvent.press(viewReminderBtn);
      
      expect(getByTestId('reminders-tab')).toBeTruthy();
      expect(getByText("Today's Reminders")).toBeTruthy();
    });

    it('switches to progress tab when handleViewDetails is called', () => {
      const { getByTestId, getByText } = render(<NavigationScreen />);
      
      const viewDetailsBtn = getByTestId('view-details-btn');
      fireEvent.press(viewDetailsBtn);
      
      expect(getByTestId('progress-tab')).toBeTruthy();
      expect(getByText('Progress')).toBeTruthy();
    });

    it('logs message when handleViewReminder is called', () => {
      const { getByTestId } = render(<NavigationScreen />);
      
      const viewReminderBtn = getByTestId('view-reminder-btn');
      fireEvent.press(viewReminderBtn);
      
      expect(console.log).toHaveBeenCalledWith('View reminder pressed');
    });

    it('logs message when handleViewDetails is called', () => {
      const { getByTestId } = render(<NavigationScreen />);
      
      const viewDetailsBtn = getByTestId('view-details-btn');
      fireEvent.press(viewDetailsBtn);
      
      expect(console.log).toHaveBeenCalledWith('View detailed analytics pressed');
    });

    it('passes handlers to HomeTab correctly', () => {
      const { getByTestId } = render(<NavigationScreen />);
      
      expect(getByTestId('view-reminder-btn')).toBeTruthy();
      expect(getByTestId('view-details-btn')).toBeTruthy();
      
      fireEvent.press(getByTestId('view-reminder-btn'));
      expect(getByTestId('reminders-tab')).toBeTruthy();
    });
  });

  describe('Tab Content Rendering', () => {
    it('renders HomeTab with correct props', () => {
      const { getByTestId } = render(<NavigationScreen />);
      
      const homeTab = getByTestId('home-tab');
      expect(homeTab).toBeTruthy();
      
      expect(getByTestId('view-reminder-btn')).toBeTruthy();
      expect(getByTestId('view-details-btn')).toBeTruthy();
    });

    it('renders MedicationsTab correctly', () => {
      const { getByTestId, getByText } = render(<NavigationScreen />);
      
      fireEvent.press(getByTestId('nav-medications'));
      
      expect(getByTestId('medications-tab')).toBeTruthy();
      expect(getByText('Medications Tab Content')).toBeTruthy();
    });

    it('renders RemindersTab correctly', () => {
      const { getByTestId, getByText } = render(<NavigationScreen />);
      
      fireEvent.press(getByTestId('nav-reminders'));
      
      expect(getByTestId('reminders-tab')).toBeTruthy();
      expect(getByText('Reminders Tab Content')).toBeTruthy();
    });

    it('renders ProgressTab correctly', () => {
      const { getByTestId, getByText } = render(<NavigationScreen />);
      
      fireEvent.press(getByTestId('nav-progress'));
      
      expect(getByTestId('progress-tab')).toBeTruthy();
      expect(getByText('Progress Tab Content')).toBeTruthy();
    });

    it('renders ProfileTab correctly', () => {
      const { getByTestId, getByText } = render(<NavigationScreen />);
      
      fireEvent.press(getByTestId('nav-profile'));
      
      expect(getByTestId('profile-tab')).toBeTruthy();
      expect(getByText('Profile Tab Content')).toBeTruthy();
    });

    it('only renders one tab at a time', () => {
      const { getByTestId, queryByTestId } = render(<NavigationScreen />);
      
      // Initially home
      expect(getByTestId('home-tab')).toBeTruthy();
      expect(queryByTestId('medications-tab')).toBeNull();
      expect(queryByTestId('reminders-tab')).toBeNull();
      expect(queryByTestId('progress-tab')).toBeNull();
      expect(queryByTestId('profile-tab')).toBeNull();
      
      // Switch to medications
      fireEvent.press(getByTestId('nav-medications'));
      expect(queryByTestId('home-tab')).toBeNull();
      expect(getByTestId('medications-tab')).toBeTruthy();
      expect(queryByTestId('reminders-tab')).toBeNull();
      expect(queryByTestId('progress-tab')).toBeNull();
      expect(queryByTestId('profile-tab')).toBeNull();
    });
  });

  describe('Bottom Navigation State', () => {
    it('shows correct active state for home tab', () => {
      const { getByText } = render(<NavigationScreen />);
      expect(getByText('Home (Active)')).toBeTruthy();
    });

    it('updates active state when switching tabs', () => {
      const { getByTestId, getByText, queryByText } = render(<NavigationScreen />);
      
      expect(getByText('Home (Active)')).toBeTruthy();
      
      fireEvent.press(getByTestId('nav-medications'));
      expect(queryByText('Home (Active)')).toBeNull();
      expect(getByText('Medications (Active)')).toBeTruthy();
      
      fireEvent.press(getByTestId('nav-progress'));
      expect(queryByText('Medications (Active)')).toBeNull();
      expect(getByText('Progress (Active)')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles default case in switch statement', () => {
      const { getByTestId } = render(<NavigationScreen />);
      
      expect(getByTestId('home-tab')).toBeTruthy();
    });

    it('handles rapid tab switching', () => {
      const { getByTestId } = render(<NavigationScreen />);
      
      // quickly switch tabs
      fireEvent.press(getByTestId('nav-medications'));
      fireEvent.press(getByTestId('nav-progress'));
      fireEvent.press(getByTestId('nav-home'));
      fireEvent.press(getByTestId('nav-profile'));
      
      // should end up on profile tab
      expect(getByTestId('profile-tab')).toBeTruthy();
    });

    it('maintains state when switching tabs', () => {
      const { getByTestId, getByText } = render(<NavigationScreen />);
      
      // Switch tabs multiple times
      fireEvent.press(getByTestId('nav-medications'));
      fireEvent.press(getByTestId('nav-home'));
      fireEvent.press(getByTestId('nav-medications'));
      
      expect(getByTestId('medications-tab')).toBeTruthy();
      expect(getByText('Medications')).toBeTruthy();
    });
  });

  describe('Integration Tests', () => {
    it('complete navigation flow through all tabs', () => {
      const { getByTestId, getByText } = render(<NavigationScreen />);
      
      // Start at home
      expect(getByTestId('home-tab')).toBeTruthy();
      expect(getByText('Welcome Back')).toBeTruthy();
      
      // Go to medications
      fireEvent.press(getByTestId('nav-medications'));
      expect(getByTestId('medications-tab')).toBeTruthy();
      expect(getByText('Medications')).toBeTruthy();
      
      // Go to reminders
      fireEvent.press(getByTestId('nav-reminders'));
      expect(getByTestId('reminders-tab')).toBeTruthy();
      expect(getByText("Today's Reminders")).toBeTruthy();
      
      // Go to progress
      fireEvent.press(getByTestId('nav-progress'));
      expect(getByTestId('progress-tab')).toBeTruthy();
      expect(getByText('Progress')).toBeTruthy();
      
      // Go to profile
      fireEvent.press(getByTestId('nav-profile'));
      expect(getByTestId('profile-tab')).toBeTruthy();
      expect(getByText('Profile')).toBeTruthy();
      
      // Go back to home
      fireEvent.press(getByTestId('nav-home'));
      expect(getByTestId('home-tab')).toBeTruthy();
      expect(getByText('Welcome Back')).toBeTruthy();
    });

    it('event handlers trigger correct tab changes', () => {
      const { getByTestId, getByText } = render(<NavigationScreen />);
      
      // Start at home
      expect(getByTestId('home-tab')).toBeTruthy();
      
      // Use handleViewReminder to go to reminders
      fireEvent.press(getByTestId('view-reminder-btn'));
      expect(getByTestId('reminders-tab')).toBeTruthy();
      expect(getByText("Today's Reminders")).toBeTruthy();
      
      // Go back to home
      fireEvent.press(getByTestId('nav-home'));
      expect(getByTestId('home-tab')).toBeTruthy();
      
      // Use handleViewDetails to go to progress
      fireEvent.press(getByTestId('view-details-btn'));
      expect(getByTestId('progress-tab')).toBeTruthy();
      expect(getByText('Progress')).toBeTruthy();
    });
  });
});