import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnRequest, ReturnRequestStatus } from './entities/return-request.entity';
import { Order } from '../orders/entities/order.entity';
import { CreateReturnRequestDto } from './dto/create-return-request.dto';
import { CatalogClientService } from '../catalog-client/catalog-client.service';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(ReturnRequest) private readonly returnRepo: Repository<ReturnRequest>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    private readonly catalog: CatalogClientService,
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

    const orderIds = [...new Set(data.map((r) => r.orderId))];
    const orders = await this.orderRepo.find({
      where: orderIds.map((id) => ({ id })),
      relations: { items: true },
    });
    const ordersById = new Map(orders.map((o) => [o.id, o]));

    const productIds = [...new Set(orders.flatMap((o) => o.items.map((i) => i.productId)))];
    const products = await Promise.all(productIds.map((id) => this.catalog.getProduct(id)));
    const productsById = new Map(products.filter(Boolean).map((p) => [p!.id, p!]));

    const userIds = [...new Set(data.map((r) => r.userId))];
    const users = await Promise.all(userIds.map((id) => this.catalog.getUser(id)));
    const usersById = new Map(users.filter(Boolean).map((u) => [u!.id, u!]));

    const enriched = data.map((r) => ({
      ...r,
      user: usersById.get(r.userId) ?? null,
      items: (ordersById.get(r.orderId)?.items ?? []).map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        product: productsById.get(i.productId) ?? null,
      })),
    }));

    return { data: enriched, total, page, limit, totalPages: Math.ceil(total / limit) };
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
