import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountNamespace } from '../enums/AccountNamespace';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    type: 'enum',
    enumName: 'account_namespace_enum',
    enum: AccountNamespace,
  })
  sender_namespace: AccountNamespace;

  @Column({ nullable: false })
  @Index('sender_account_idx')
  sender_account: string;

  @Column({
    nullable: false,
    type: 'enum',
    enumName: 'account_namespace_enum',
    enum: AccountNamespace,
  })
  receiver_namespace: AccountNamespace;

  @Column({ nullable: false })
  @Index('receiver_account_idx')
  receiver_account: string;

  @Column({ nullable: false })
  symbol: string;

  @Column({ type: 'decimal', nullable: false })
  amount: string;

  @CreateDateColumn()
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
