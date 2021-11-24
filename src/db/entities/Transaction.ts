import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
  })
  sender_namespace: string;

  @Column({ nullable: true })
  @Index('sender_account_idx')
  sender_account: string;

  @Column({
    nullable: false,
  })
  receiver_namespace: string;

  @Column({ nullable: true })
  @Index('receiver_account_idx')
  receiver_account: string;

  @Column({ nullable: false })
  symbol: string;

  @Column({ type: 'decimal', nullable: false })
  amount: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  executed_at: Date;
}
