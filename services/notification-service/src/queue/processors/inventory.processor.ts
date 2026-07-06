import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { INVENTORY_QUEUE } from '../queue.constants';
import { NotificationService } from '../../notifications/notification.service';

interface InventoryJob {
  productId: number; productName: string; newStock: number;
  sellerEmail: string; sellerName: string;
}

@Processor({ name: INVENTORY_QUEUE })
export class InventoryProcessor extends WorkerHost {
  private readonly logger = new Logger(InventoryProcessor.name);
  constructor(private readonly service: NotificationService) { super(); }

  async process(job: Job<InventoryJob>): Promise<void> {
    const { productName, newStock } = job.data;
    this.logger.warn(`Low stock: "${productName}" at ${newStock}`);
  }
}
