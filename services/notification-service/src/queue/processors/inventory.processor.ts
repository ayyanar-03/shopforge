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
    const { productName, newStock, sellerEmail, sellerName } = job.data;
    this.logger.warn(`Low stock: "${productName}" at ${newStock} — alerting seller`);
    await this.service.send(['email'], {
      type: 'low_stock_alert',
      recipient: { email: sellerEmail, name: sellerName },
      data: { productName, currentStock: newStock },
    });
  }
}
