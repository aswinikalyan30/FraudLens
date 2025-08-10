// Simple API client with mock + real endpoint capability
export interface ApiClientOptions {
  baseUrl?: string;
  mock?: boolean;
  latency?: number;
}

const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiClient {
  private baseUrl: string;
  private mock: boolean;
  private latency: number;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || DEFAULT_BASE_URL;
    this.mock = options.mock ?? true; // default to mock until backend ready
    this.latency = options.latency ?? 600;
  }

  async get<T>(path: string, mockFn?: () => T | Promise<T>): Promise<T> {
    if (this.mock && mockFn) {
      await new Promise(r => setTimeout(r, this.latency));
      return await mockFn();
    }
    const res = await fetch(`${this.baseUrl}${path}`);
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return res.json();
  }

  async post<T, B = unknown>(path: string, body: B, mockFn?: () => T | Promise<T>): Promise<T> {
    if (this.mock && mockFn) {
      await new Promise(r => setTimeout(r, this.latency));
      return await mockFn();
    }
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
    return res.json();
  }
}

export const apiClient = new ApiClient();
