import type { CreateReturnRequestDto } from './dto/create-return-request.dto';

export const RETURNS_SERVICE = Symbol('RETURNS_SERVICE');

export interface IReturnsService {
  createReturnRequest(userId: number, orderId: number, dto: CreateReturnRequestDto): Promise<unknown>;
  getReturnRequests(page: number, limit: number): Promise<unknown>;
  verifyReturnRequest(id: number, status: 'approved' | 'rejected'): Promise<unknown>;
}
