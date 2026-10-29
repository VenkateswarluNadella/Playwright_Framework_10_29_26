import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { logger } from '../../utils/logger';
import { required, type FrameworkWorld } from '../../hooks/frameworkWorld';

When('I request the configured product', async function (this: FrameworkWorld) {
  const { productId } = required(this.apiData, 'apiData');
  this.productResponse = await required(this.productApiClient, 'productApiClient').getProduct(productId);
  logger.info('Requested product', { productId, status: this.productResponse.status });
});

Then(
  'the product response is successful within {int} milliseconds',
  async function (this: FrameworkWorld, maxDurationMs: number) {
    const response = required(this.productResponse, 'productResponse');
    expect(response.status).toBe(200);
    expect(response.durationMs).toBeLessThan(maxDurationMs);
  },
);

Then('the product details are complete', async function (this: FrameworkWorld) {
  const product = required(this.productResponse, 'productResponse').data;
  expect(product.id).toBeGreaterThan(0);
  expect(product.title.trim().length).toBeGreaterThan(0);
  expect(product.category.trim().length).toBeGreaterThan(0);
  expect(product.description.trim().length).toBeGreaterThan(0);
  expect(product.price).toBeGreaterThan(0);
  expect(product.rating).toBeGreaterThan(0);
  expect(product.stock).toBeGreaterThanOrEqual(0);
  expect(product.thumbnail).toMatch(/^https?:\/\//);
});

When('I log in with the configured API account', async function (this: FrameworkWorld) {
  const { login } = required(this.apiData, 'apiData');
  this.loginResponse = await required(this.authApiClient, 'authApiClient').login(login);
  logger.info('Authenticated API user', {
    status: this.loginResponse.status,
    userId: this.loginResponse.data.id,
  });
});

Then('the login response contains valid tokens and user details', async function (this: FrameworkWorld) {
  const response = required(this.loginResponse, 'loginResponse');
  const user = response.data;
  expect(response.status).toBe(200);
  expect(user.accessToken).toBeTruthy();
  expect(user.refreshToken).toBeTruthy();
  expect(user.id).toBeGreaterThan(0);
  expect(user.firstName.trim()).not.toBe('');
  expect(user.lastName.trim()).not.toBe('');
  expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  expect(user.username.trim()).not.toBe('');
  for (const [key, value] of Object.entries(user)) {
    expect(value, `${key} should not be null or undefined`).not.toBeNull();
    expect(value, `${key} should not be undefined`).toBeDefined();
  }
});

When('I request the current user using the access token', async function (this: FrameworkWorld) {
  const token = required(this.loginResponse, 'loginResponse').data.accessToken;
  this.userResponse = await required(this.authApiClient, 'authApiClient').getCurrentUser(token);
});

Then('the current user response matches the authenticated user', async function (this: FrameworkWorld) {
  const response = required(this.userResponse, 'userResponse');
  const authenticatedUser = required(this.loginResponse, 'loginResponse').data;
  expect(response.status).toBe(200);
  expect(response.data.id).toBe(authenticatedUser.id);
  expect(response.data.username).toBe(authenticatedUser.username);
  expect(response.data.email).toBeTruthy();
  expect(response.data.firstName).toBeTruthy();
  expect(response.data.lastName).toBeTruthy();
});

When('I request todos for the authenticated user', async function (this: FrameworkWorld) {
  const token = required(this.loginResponse, 'loginResponse').data.accessToken;
  const userId = required(this.userResponse, 'userResponse').data.id;
  this.todosResponse = await required(this.todoApiClient, 'todoApiClient').getTodosForUser(userId, token);
});

Then('the todos response is valid for that user', async function (this: FrameworkWorld) {
  const response = required(this.todosResponse, 'todosResponse');
  const userId = required(this.userResponse, 'userResponse').data.id;
  expect(response.status).toBe(200);
  expect(Array.isArray(response.data.todos)).toBe(true);
  expect(response.data.total).toBeGreaterThanOrEqual(response.data.todos.length);
  for (const todo of response.data.todos) {
    expect(todo.id).toBeGreaterThan(0);
    expect(todo.todo.trim()).not.toBe('');
    expect(typeof todo.completed).toBe('boolean');
    expect(todo.userId).toBe(userId);
  }
});
