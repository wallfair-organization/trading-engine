import {Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn} from "typeorm";
import { AccountNamespace } from "../enums/AccountNamespace";

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    type: 'enum',
    enumName: 'account_namespace_enum',
    enum: AccountNamespace
  })
  sender_namespace: AccountNamespace;

  @Column({ nullable: false })
  @Index('sender_account_idx')
  sender_account: string;

  @Column({
    nullable: false,
    type: 'enum',
    enumName: 'account_namespace_enum',
    enum: AccountNamespace
  })
  receiver_namespace: AccountNamespace;

  @Column({ nullable: false })
  @Index('receiver_account_idx')
  receiver_account: string;

  @Column({ nullable: false })
  symbol: string;

  @Column({ type: 'decimal', precision: 18, scale: 0, nullable: false })
  amount: number;

  @CreateDateColumn()
  executed_at: Date;
}
