import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
@Index('IDX_orderitem_order', ['orderId'])
@Index('IDX_orderitem_product', ['productId'])
export class OrderItem {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;
  @Column() orderId: number;
  @Column() productId: number;
  @Column() quantity: number;
  @Column('decimal', { precision: 10, scale: 2 }) price: number;
}
