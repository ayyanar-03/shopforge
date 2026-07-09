import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum ReturnRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('return_requests')
@Index('IDX_returnrequest_order', ['orderId'])
@Index('IDX_returnrequest_user', ['userId'])
export class ReturnRequest {
  @PrimaryGeneratedColumn() id: number;
  @Column() orderId: number;
  @Column() userId: number;
  @Column() reason: string;
  @Column({ nullable: true, type: 'varchar' }) details: string | null;
  @Column({ type: 'enum', enum: ReturnRequestStatus, default: ReturnRequestStatus.PENDING })
  status: ReturnRequestStatus;
  @CreateDateColumn() createdAt: Date;
}
