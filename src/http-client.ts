import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { SleeperError } from './types';

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class HttpClient {
  private client: AxiosInstance;
  private readonly retries: number;
  private readonly retryDelay: number;
  private lastRequestTime: number = 0;
  private readonly minRequestInterval: number = 60; // 60ms between requests to stay under 1000 req/min

  constructor(config: HttpClientConfig = {}) {
    const {
      baseURL = 'https://api.sleeper.app/v1',
      timeout = 10000,
      retries = 3,
      retryDelay = 1000,
    } = config;

    this.retries = retries;
    this.retryDelay = retryDelay;

    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'sleeper-sdk-ts/1.0.0',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for rate limiting
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        await this.enforceRateLimit();
        return config;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error: any) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (response: any) => response,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error: any) => {
        const sleeperError: SleeperError = {
          status: error.response?.status || 0,
          message: error.message || 'Unknown error',
          details: error.response?.data,
        };

        // Handle specific Sleeper API errors
        if (error.response?.status === 429) {
          sleeperError.message = 'Rate limit exceeded. Please slow down your requests.';
        } else if (error.response?.status === 404) {
          sleeperError.message = 'Resource not found.';
        } else if (error.response?.status >= 500) {
          sleeperError.message = 'Sleeper API server error. Please try again later.';
        }

        return Promise.reject(sleeperError);
      }
    );
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      const delay = this.minRequestInterval - timeSinceLastRequest;
      await this.sleep(delay);
    }

    this.lastRequestTime = Date.now();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      // Use NodeJS.Timeout type for setTimeout
      const timer: NodeJS.Timeout = setTimeout(resolve, ms);
      return timer;
    });
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(() => this.client.get<T>(url, config));
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.executeWithRetry(() => this.client.post<T>(url, data, config));
  }

  async put<T>(
    url: string, 
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.executeWithRetry(() => this.client.put<T>(url, data, config));
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(() => this.client.delete<T>(url, config));
  }

  private async executeWithRetry<T>(
    request: () => Promise<AxiosResponse<T>>
  ): Promise<T> {
    let lastError: SleeperError;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await request();
        return response.data;
      } catch (error) {
        lastError = error as SleeperError;

        // Don't retry on client errors (4xx) except rate limiting
        if (lastError.status >= 400 && lastError.status < 500 && lastError.status !== 429) {
          throw lastError;
        }

        // Don't retry on last attempt
        if (attempt === this.retries) {
          throw lastError;
        }

        // Exponential backoff for retries
        const delay = this.retryDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  // Utility method to build query string
  buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
    const filteredParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');

    return filteredParams ? `?${filteredParams}` : '';
  }
}
