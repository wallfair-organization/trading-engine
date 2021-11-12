import { ExternalTransaction } from './ExternalTransaction';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Check('"amount" > 0')
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
  })
  network_code: string;

  @Column({ nullable: false })
  @Index()
  receiver: string;

  @Column({ type: 'decimal', nullable: false })
  amount: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
