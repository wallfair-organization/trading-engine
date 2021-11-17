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
@Check('"amount" >= 0')
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

  @Column({
    nullable: false,
  })
  @Index()
  namespace: string;

  @Column({ nullable: false })
  @Index()
  symbol: string;

  // REV: please add scale=0 to the decimal we want only integers to be stored
  @Column({ type: 'decimal', nullable: false })
  amount: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  assignAttributes(attributes) {
    this.network_code = attributes.network_code;
    this.receiver = attributes.receiver;
    this.amount = attributes.amount;
    this.symbol = attributes.symbol;
    this.namespace = attributes.namespace;
  }
}
