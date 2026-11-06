import { fetchData } from './fetchData';

describe('fetchData', () => {
  const originalFetch = global.fetch;
  const originalUrl = process.env.REACT_APP_API_BASE_URL;

  beforeEach(() => {
    process.env.REACT_APP_API_BASE_URL = 'http://api.test';
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.REACT_APP_API_BASE_URL = originalUrl;
    jest.restoreAllMocks();
  });

  test('returns null (not []) when the request fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
    expect(await fetchData()).toBeNull();
  });

  test('returns null when the network throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    expect(await fetchData()).toBeNull();
  });

  test('returns an empty array when the space is genuinely empty', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => [],
    });
    expect(await fetchData()).toEqual([]);
  });
});
