import { World, setWorldConstructor } from '@cucumber/cucumber';
import type { APIRequestContext, Browser, BrowserContext, Page } from '@playwright/test';
import type { ApiResult } from '../api/clients/baseApiClient';
import type { Product } from '../api/models/product.model';
import type { AuthResponse, AuthUser } from '../api/models/auth.model';
import type { TodoListResponse } from '../api/models/todo.model';
import type { AuthApiClient } from '../api/clients/authApiClient';
import type { ProductApiClient } from '../api/clients/productApiClient';
import type { TodoApiClient } from '../api/clients/todoApiClient';
import type { HomePage } from '../pages/homePage';
import type { FlightSearchPage } from '../pages/flightSearchPage';
import type { FlightResultsPage } from '../pages/flightResultsPage';
import type { FlightBookingPage } from '../pages/flightBookingPage';

/** Data shapes loaded by the UI and API Cucumber scenarios. */
export interface TravelTestData {
  flight: {
    source: string;
    sourceCode: string;
    destination: string;
    destinationCode: string;
    adults: number;
    children: number;
    dateOffsetDays: number;
  };
}

export interface ApiTestData {
  productId: number;
  login: {
    username: string;
    password: string;
  };
}

/** Per-scenario dependency container shared by Cucumber steps and hooks. */
export class FrameworkWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  apiRequest?: APIRequestContext;
  testData?: TravelTestData;
  apiData?: ApiTestData;
  homePage?: HomePage;
  flightSearchPage?: FlightSearchPage;
  flightResultsPage?: FlightResultsPage;
  flightBookingPage?: FlightBookingPage;
  productResponse?: ApiResult<Product>;
  loginResponse?: ApiResult<AuthResponse>;
  userResponse?: ApiResult<AuthUser>;
  todosResponse?: ApiResult<TodoListResponse>;
  selectedFlightDate?: string;
  selectedFlightRoute?: {
    source: string;
    sourceCode: string;
    destination: string;
    destinationCode: string;
  };
  productApiClient?: ProductApiClient;
  authApiClient?: AuthApiClient;
  todoApiClient?: TodoApiClient;
}

setWorldConstructor(FrameworkWorld);

/** Returns initialized scenario state or fails with the missing field name. */
export function required<T>(value: T | undefined, name: string): T {
  if (value === undefined) throw new Error(`Scenario state "${name}" was not initialized.`);
  return value;
}
