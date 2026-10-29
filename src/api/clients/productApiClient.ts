import type { APIRequestContext } from '@playwright/test';
import { BaseApiClient, type ApiResult } from './baseApiClient';
import type { Product } from '../models/product.model';

/** API operations for DummyJSON product resources. */
export class ProductApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, baseUrl: string) {
    super(request, baseUrl);
  }

  /** Retrieves one product by its numeric ID. */
  getProduct(productId: number): Promise<ApiResult<Product>> {
    return this.get<Product>(`/products/${productId}`);
  }
}
