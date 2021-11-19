import {
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from './Account';

@Entity()
export class User {
  @PrimaryColumn()
  user_id: string;

  @ManyToMany(() => Account, (account) => account.users, {
    cascade: ['insert', 'update'],
  })
  @JoinTable({
    name: 'user_accounts',
    joinColumns: [{ name: 'user_id', referencedColumnName: 'user_id' }],
    inverseJoinColumns: [
      { name: 'owner_account', referencedColumnName: 'owner_account' },
      { name: 'account_namespace', referencedColumnName: 'account_namespace' },
      { name: 'symbol', referencedColumnName: 'symbol' },
    ],
  })
  accounts: Account[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
