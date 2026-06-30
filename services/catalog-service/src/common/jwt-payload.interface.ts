// Shared contract: keep in sync with services/order-service/src/common/jwt-payload.interface.ts
export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

export interface AuthUser {
  id: number;
  email: string;
  role: string;
}
