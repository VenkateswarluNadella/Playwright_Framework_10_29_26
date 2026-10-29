import { request as playwrightRequest } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { baseFixture } from './baseFixture';
import { ProductApiClient } from '../api/clients/productApiClient';
import { AuthApiClient } from '../api/clients/authApiClient';
import { TodoApiClient } from '../api/clients/todoApiClient';

/** Provides one shared API request context and typed clients to Playwright API tests. */
export const apiFixture = baseFixture.extend<{
  apiRequest: APIRequestContext;
  productApiClient: ProductApiClient;
  authApiClient: AuthApiClient;
  todoApiClient: TodoApiClient;
}>({
  apiRequest: async ({ environment }, use) => {
    const apiRequest = await playwrightRequest.newContext({
      baseURL: environment.apiBaseUrl,
      extraHTTPHeaders: { Accept: 'application/json' },
    });
    try {
      await use(apiRequest);
    } finally {
      await apiRequest.dispose();
    }
  },
  productApiClient: async ({ apiRequest, environment }, use) =>
    use(new ProductApiClient(apiRequest, environment.apiBaseUrl)),
  authApiClient: async ({ apiRequest, environment }, use) =>
    use(new AuthApiClient(apiRequest, environment.apiBaseUrl)),
  todoApiClient: async ({ apiRequest, environment }, use) =>
    use(new TodoApiClient(apiRequest, environment.apiBaseUrl)),
});
