import { ExternalTransaction } from './ExternalTransaction';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NetworkCode } from '../enums/NetworkCode';

@Entity()
export class TransactionQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(
    () => ExternalTransaction,
    (externalTransaction) => externalTransaction.transaction_queue
  )
  @JoinColumn()
  external_transaction: ExternalTransaction;

  @Column({
    nullable: false,
    type: 'enum',
    enumName: 'network_code',
    enum: NetworkCode,
  })
  network_code: string;

  @Column({ nullable: false })
  @Index()
  receiver: string;

  @Column({ type: 'decimal', nullable: false })
  amount: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
