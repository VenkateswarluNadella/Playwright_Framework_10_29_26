import type { APIRequestContext, APIResponse } from '@playwright/test';

export interface ApiResult<T> {
  status: number;
  durationMs: number;
  data: T;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  data?: unknown;
}

/** Shared HTTP methods, response parsing, and timing for API clients. */
export class BaseApiClient {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly baseUrl: string,
  ) {}

  /** Sends a GET request and returns its status, elapsed time, and JSON body. */
  protected get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResult<T>> {
    return this.send<T>('GET', endpoint, { headers });
  }

  /** Sends a POST request with a JSON body. */
  protected post<T>(
    endpoint: string,
    data: unknown,
    headers?: Record<string, string>,
  ): Promise<ApiResult<T>> {
    return this.send<T>('POST', endpoint, { data, headers });
  }

  /** Sends a PUT request with a JSON body. */
  protected put<T>(
    endpoint: string,
    data: unknown,
    headers?: Record<string, string>,
  ): Promise<ApiResult<T>> {
    return this.send<T>('PUT', endpoint, { data, headers });
  }

  /** Sends a DELETE request. */
  protected delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResult<T>> {
    return this.send<T>('DELETE', endpoint, { headers });
  }

  /** Executes a request and rejects responses that cannot be parsed as JSON. */
  private async send<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<ApiResult<T>> {
    const url = new URL(endpoint.replace(/^\//, ''), `${this.baseUrl}/`).toString();
    const startedAt = performance.now();
    let response: APIResponse;

    switch (method) {
      case 'GET':
        response = await this.request.get(url, { headers: options.headers });
        break;
      case 'POST':
        response = await this.request.post(url, {
          data: options.data,
          headers: options.headers,
        });
        break;
      case 'PUT':
        response = await this.request.put(url, {
          data: options.data,
          headers: options.headers,
        });
        break;
      case 'DELETE':
        response = await this.request.delete(url, { headers: options.headers });
        break;
    }

    const durationMs = Math.round(performance.now() - startedAt);
    let data: T;
    try {
      data = (await response.json()) as T;
    } catch (error) {
      throw new Error(
        `${method} ${url} returned a non-JSON response (HTTP ${response.status()}).`,
        { cause: error },
      );
    }

    return { status: response.status(), durationMs, data };
  }
}
