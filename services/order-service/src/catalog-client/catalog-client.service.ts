import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface CartItemDto {
  id: number;
  productId: number;
  quantity: number;
  product: { id: number; name: string; price: number; stock: number; sellerId: number };
}

export interface ProductDto {
  id: number;
  name: string;
  price: number;
  stock: number;
  sellerId: number;
}

export interface UserDto {
  id: number;
  email: string;
  name: string;
}

export interface CouponResultDto {
  code: string;
  discountAmount: number;
  finalTotal: number;
  type: string;
  value: number;
}

@Injectable()
export class CatalogClientService {
  private readonly logger = new Logger(CatalogClientService.name);
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(private readonly http: HttpService) {
    this.baseUrl = process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3001';
    this.token = process.env.INTERNAL_TOKEN ?? 'shopforge_internal';
  }

  private get headers() {
    return { 'x-internal-token': this.token };
  }

  async getCartItems(userId: number): Promise<CartItemDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<CartItemDto[]>(`${this.baseUrl}/api/internal/cart/${userId}`, {
        headers: this.headers,
      }),
    );
    return data;
  }

  async clearCart(userId: number): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/api/internal/cart/${userId}`, { headers: this.headers }),
    );
  }

  async getProduct(id: number): Promise<ProductDto | null> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<ProductDto>(`${this.baseUrl}/api/internal/products/${id}`, {
          headers: this.headers,
        }),
      );
      return data;
    } catch {
      return null;
    }
  }

  async decrementStock(id: number, quantity: number): Promise<ProductDto> {
    const { data } = await firstValueFrom(
      this.http.patch<ProductDto>(
        `${this.baseUrl}/api/internal/products/${id}/decrement`,
        { quantity },
        { headers: this.headers },
      ),
    );
    return data;
  }

  async getUser(id: number): Promise<UserDto | null> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<UserDto>(`${this.baseUrl}/api/internal/users/${id}`, {
          headers: this.headers,
        }),
      );
      return data;
    } catch {
      return null;
    }
  }

  async applyCoupon(code: string, total: number): Promise<CouponResultDto> {
    try {
      const { data } = await firstValueFrom(
        this.http.post<CouponResultDto>(
          `${this.baseUrl}/api/internal/coupons/apply`,
          { code, total },
          { headers: this.headers },
        ),
      );
      return data;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      throw new BadRequestException(msg ?? 'Invalid coupon code');
    }
  }

  async getCatalogStats(): Promise<{ totalUsers: number; totalProducts: number }> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<{ totalUsers: number; totalProducts: number }>(
          `${this.baseUrl}/api/internal/stats`,
          { headers: this.headers },
        ),
      );
      return data;
    } catch {
      this.logger.warn('Catalog stats unavailable');
      return { totalUsers: 0, totalProducts: 0 };
    }
  }
}
