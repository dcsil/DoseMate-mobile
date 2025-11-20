import { listProgress, createProgress } from '../components/services/progressService';

// Ensure global test declarations (for TS) without relying on implicit 'global'
declare const globalThis: any;
const originalFetch = globalThis.fetch;

// A minimal Response-like helper
function makeResponse(ok: boolean, body: any): Response {
    return {
        ok,
        status: ok ? 200 : 500,
        json: async () => body,
        text: async () => JSON.stringify(body),
    } as any as Response;
}

beforeEach(() => {
    globalThis.fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString();
        if (url.includes('/progress') && init?.method === 'POST') {
            return Promise.resolve(
                makeResponse(true, {
                    id: '11111111-1111-1111-1111-111111111111',
                    user_id: '22222222-2222-2222-2222-222222222222',
                    metric_name: 'steps',
                    value: 5000,
                    int_value: 5000,
                    created_at: new Date().toISOString(),
                })
            );
        }
        if (url.includes('/progress')) {
            return Promise.resolve(
                makeResponse(true, [
                    {
                        id: '11111111-1111-1111-1111-111111111111',
                        user_id: '22222222-2222-2222-2222-222222222222',
                        metric_name: 'steps',
                        value: 5000,
                        int_value: 5000,
                        created_at: new Date().toISOString(),
                    },
                ])
            );
        }
        return Promise.resolve(makeResponse(false, { error: 'Unhandled URL' }));
    });
});

afterEach(() => {
    globalThis.fetch = originalFetch;
});

test('createProgress returns created entry', async () => {
    const entry = await createProgress('22222222-2222-2222-2222-222222222222', { metric_name: 'steps', int_value: 5000 });
    expect(entry.metric_name).toBe('steps');
    expect(entry.int_value).toBe(5000);
    expect(typeof entry.id).toBe('string');
});

test('listProgress returns array', async () => {
    const list = await listProgress('22222222-2222-2222-2222-222222222222');
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    expect(typeof list[0].user_id).toBe('string');
});
