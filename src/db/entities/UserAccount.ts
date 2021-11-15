import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from './Account';

@Entity()
export class UserAccount {
  @PrimaryColumn()
  user_id: string;

  @ManyToOne(() => Account, (account) => account.user_accounts, {
    nullable: false,
  })
  @JoinColumn([
    { name: 'owner_account', referencedColumnName: 'owner_account' },
    { name: 'account_namespace', referencedColumnName: 'account_namespace' },
    { name: 'symbol', referencedColumnName: 'symbol' },
  ])
  account: Account;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
