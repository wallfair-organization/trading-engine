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

  @Column({ nullable: false })
  @Index('sender_account_idx')
  sender_account: string;

  @Column({
    nullable: false,
  })
  receiver_namespace: string;

  @Column({ nullable: false })
  @Index('receiver_account_idx')
  receiver_account: string;

  @Column({ nullable: false })
  symbol: string;

  // REV: please add scale=0 to the decimal we want only integers to be stored
  @Column({ type: 'decimal', nullable: false })
  amount: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  executed_at: Date;

  assignAttributes(attributes) {
    this.sender_namespace = attributes.sender_namespace;
    this.sender_account = attributes.sender_account;
    this.receiver_namespace = attributes.receiver_namespace;
    this.receiver_account = attributes.receiver_account;
    this.symbol = attributes.symbol;
    this.amount = attributes.amount;
  }
}
