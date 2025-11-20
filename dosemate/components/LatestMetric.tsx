import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useProgress } from './services/useProgress';

interface LatestMetricProps {
    userId: string | null;
    metricName: string;
    pollMs?: number;
}

export function LatestMetric({ userId, metricName, pollMs }: LatestMetricProps) {
    const { loading, error, latestFor } = useProgress({ userId, pollMs });
    const latest = latestFor(metricName);

    if (!userId) return <Text style={styles.dim}>No user yet</Text>;
    if (loading && !latest) return <ActivityIndicator />;
    if (error) return <Text style={styles.error}>Error: {error}</Text>;
    if (!latest) return <Text style={styles.dim}>No data for {metricName}</Text>;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{metricName}</Text>
            <Text style={styles.value}>{latest.int_value ?? latest.value ?? '—'}</Text>
            <Text style={styles.timestamp}>{new Date(latest.created_at).toLocaleString()}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 12, backgroundColor: '#F7F9FA', borderRadius: 8 },
    label: { fontSize: 14, fontWeight: '600', color: '#2C3E50' },
    value: { fontSize: 24, fontWeight: '700', marginTop: 4, color: '#1A73E8' },
    timestamp: { fontSize: 11, color: '#7F8C8D', marginTop: 4 },
    error: { color: '#E53935' },
    dim: { color: '#95A5A6' },
});
