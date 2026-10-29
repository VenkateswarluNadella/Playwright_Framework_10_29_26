import { expect } from '@playwright/test';
import { apiFixture } from '../../fixtures/apiFixture';

apiFixture('DummyJSON product endpoint returns product details', async ({ productApiClient }) => {
  const response = await productApiClient.getProduct(1);

  expect(response.status).toBe(200);
  expect(response.durationMs).toBeLessThan(3_000);
  expect(response.data.id).toBe(1);
  expect(response.data.title).not.toBe('');
  expect(response.data.category).not.toBe('');
  expect(response.data.description).not.toBe('');
  expect(response.data.price).toBeGreaterThan(0);
  expect(response.data.rating).toBeGreaterThan(0);
  expect(response.data.stock).toBeGreaterThanOrEqual(0);
  expect(response.data.thumbnail).toMatch(/^https?:\/\//);
});
