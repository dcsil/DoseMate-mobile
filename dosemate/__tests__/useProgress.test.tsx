import React from 'react';
import { render, act } from '@testing-library/react-native';
import { useProgress } from '../components/services/useProgress';

const originalFetch = global.fetch;

function mockListResponse() {
    return {
        ok: true,
        json: async () => [
            {
                id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                user_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                metric_name: 'steps',
                value: 1000,
                int_value: 1000,
                created_at: new Date().toISOString(),
            },
        ],
    } as any;
}

beforeEach(() => {
    global.fetch = jest.fn(async () => mockListResponse());
});

afterEach(() => {
    global.fetch = originalFetch;
});

function Harness({ userId }: { userId: string }) {
    const hook = useProgress({ userId });
    // expose for test
    // @ts-ignore
    global.__hook = hook;
    return null;
}

it('loads entries on mount', async () => {
    await act(async () => {
        render(<Harness userId={'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'} />);
    });
    // @ts-ignore
    const { entries } = global.__hook;
    expect(entries.length).toBe(1);
    expect(entries[0].int_value).toBe(1000);
});
