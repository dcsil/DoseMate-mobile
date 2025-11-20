import React from 'react';
import { listProgress, createProgress, ProgressEntry } from './progressService';

interface UseProgressOptions {
    userId: string | null;
    pollMs?: number; // optional polling interval
}

export function useProgress({ userId, pollMs }: UseProgressOptions) {
    const [entries, setEntries] = React.useState<ProgressEntry[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const refresh = React.useCallback(async () => {
        if (userId == null) return;
        setLoading(true);
        setError(null);
        try {
            const data = await listProgress(userId);
            setEntries(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    React.useEffect(() => {
        refresh();
    }, [refresh]);

    React.useEffect(() => {
        if (!pollMs || pollMs <= 0) return;
        const id = setInterval(refresh, pollMs);
        return () => clearInterval(id);
    }, [pollMs, refresh]);

    const addProgress = React.useCallback(
        async (data: { metric_name: string; value?: number; int_value?: number }) => {
            if (userId == null) throw new Error('No userId');
            const created = await createProgress(userId, data);
            setEntries(prev => [created, ...prev]);
            return created;
        },
        [userId]
    );

    const latestFor = React.useCallback(
        (metricName: string) => {
            return [...entries]
                .filter(e => e.metric_name === metricName)
                .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0] || null;
        },
        [entries]
    );

    return { entries, loading, error, refresh, addProgress, latestFor };
}
