import type { APIRequestContext } from '@playwright/test';
import { BaseApiClient, type ApiResult } from './baseApiClient';
import type { AuthResponse, AuthUser, LoginRequest } from '../models/auth.model';

/** Login and authenticated-user operations for the DummyJSON API. */
export class AuthApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, baseUrl: string) {
    super(request, baseUrl);
  }

  /** Authenticates credentials and returns the user profile and access tokens. */
  login(credentials: LoginRequest): Promise<ApiResult<AuthResponse>> {
    return this.post<AuthResponse>('/auth/login', credentials);
  }

  /** Retrieves the authenticated user's profile with the supplied access token. */
  getCurrentUser(accessToken: string): Promise<ApiResult<AuthUser>> {
    return this.get<AuthUser>('/auth/me', { Authorization: `Bearer ${accessToken}` });
  }
}
