import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnRequest, ReturnRequestStatus } from './entities/return-request.entity';
import { Order } from '../orders/entities/order.entity';
import { CreateReturnRequestDto } from './dto/create-return-request.dto';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(ReturnRequest) private readonly returnRepo: Repository<ReturnRequest>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
  ) {}

  async createReturnRequest(userId: number, orderId: number, dto: CreateReturnRequestDto) {
    const order = await this.orderRepo.findOne({ where: { id: orderId, userId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'delivered') {
      throw new BadRequestException('Only delivered orders are eligible for return');
    }

    const existing = await this.returnRepo.findOne({
      where: { orderId, status: ReturnRequestStatus.PENDING },
    });
    if (existing) throw new BadRequestException('A return request for this order is already pending');

    const request = this.returnRepo.create({
      orderId,
      userId,
      reason: dto.reason,
      details: dto.details ?? null,
    });
    return this.returnRepo.save(request);
  }

  async getReturnRequests(page: number, limit: number) {
    const [data, total] = await this.returnRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async verifyReturnRequest(id: number, status: 'approved' | 'rejected') {
    const request = await this.returnRepo.findOneBy({ id });
    if (!request) throw new NotFoundException('Return request not found');
    if (request.status !== ReturnRequestStatus.PENDING) {
      throw new BadRequestException('This return request has already been reviewed');
    }
    request.status = status === 'approved' ? ReturnRequestStatus.APPROVED : ReturnRequestStatus.REJECTED;
    return this.returnRepo.save(request);
  }
}
