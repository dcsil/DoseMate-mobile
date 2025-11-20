# DoseMate-mobile

React Native mobile app for DoseMate, providing medication schedule reminders and user interactions.

---

# React Native Project Setup

Reference: [Expo Tutorial: Create Your First App](https://docs.expo.dev/tutorial/create-your-first-app/)

This guide walks you through setting up the DoseMate React Native app using **Node.js 24.x**, **npm 11.x**, and **Expo**.

---

## 1. Install Node.js and npm

### macOS / Linux (using nvm)

1. Install **nvm**:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.zshrc
```

2. Verify nvm:

```bash
nvm -v
```

3. Install Node.js:

```bash
nvm install 24
```

4. Verify Node.js and npm:

```bash
node -v   # Example: v24.9.0
npm -v    # Example: 11.6.0
```

> For non-mac devs, use WSL or another compatible terminal, or install Node.js directly.

### Windows

- Install Node.js directly from [nodejs.org](https://nodejs.org/) (check **“Add to PATH”** during installation).
- Verify with:

```bash
node -v
npm -v
```

---

## 2. Install Expo Go App

- Install **Expo Go** on your mobile device (iOS / Android) for testing the app.

---

## 3. Project Setup

From the root of the repository:

```bash
cd dosemate
npm install
```

---

## 4. Update Config

Locate config.tsx and update the BACKEND_BASE_URL to the correct URL (ngrok URL or localhost)

### Progress API Integration

Backend exposes user progress endpoints:

- `GET /users/{user_id}/progress` – list entries
- `POST /users/{user_id}/progress` – create entry `{ metric_name, value?, int_value? }`

Mobile client utilities added:

`components/services/progressService.ts`:
- `listProgress(userId)`
- `createProgress(userId, { metric_name, value?, int_value? })`
- `getLatestProgress(userId, metricName)`

`components/services/useProgress.ts` React hook:
```ts
const { entries, loading, error, refresh, addProgress, latestFor } = useProgress({ userId, pollMs: 10000 });
```

Sample component `LatestMetric.tsx` renders latest metric value with optional polling.

Quick usage example inside a screen/component:
```tsx
import { LatestMetric } from '../components/LatestMetric';
import { useProgress } from '../components/services/useProgress';
import { Button } from 'react-native';

export function Dashboard({ userId }: { userId: number }) {
	const { addProgress } = useProgress({ userId });

	return (
		<>
			<LatestMetric userId={userId} metricName="steps" pollMs={15000} />
			{/* Add a new progress entry */}
			<Button title="Add 500 steps" onPress={() => addProgress({ metric_name: 'steps', int_value: 500 })} />
		</>
	);
}
```

Testing:
- `__tests__/progressService.test.ts` covers service functions (fetch mocked).
- `__tests__/useProgress.test.tsx` validates hook initial load.

If BASE URL changes, update `config.tsx` only—services + hook consume that constant.


## 5. Run the App

```bash
npm start
```

- Opens **Expo DevTools** in your browser.
- Scan the QR code using **Expo Go** to run the app on your device.

---
