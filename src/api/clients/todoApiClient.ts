import type { APIRequestContext } from '@playwright/test';
import { BaseApiClient, type ApiResult } from './baseApiClient';
import type { TodoListResponse } from '../models/todo.model';

/** API operations for retrieving a user's DummyJSON todos. */
export class TodoApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, baseUrl: string) {
    super(request, baseUrl);
  }

  /** Retrieves todos for a user, optionally sending an access token. */
  getTodosForUser(userId: number, accessToken?: string): Promise<ApiResult<TodoListResponse>> {
    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
    return this.get<TodoListResponse>(`/todos/user/${userId}`, headers);
  }
}
