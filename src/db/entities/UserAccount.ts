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

  @ManyToOne(() => Account, (accounts) => accounts.user_accounts, {
    nullable: false,
  })
  @JoinColumn([
    { name: 'owner_account', referencedColumnName: 'owner_account' },
    { name: 'account_namespace', referencedColumnName: 'account_namespace' },
    { name: 'symbol', referencedColumnName: 'symbol' },
  ])
  account: Account;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
