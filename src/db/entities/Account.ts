import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { UserAccount } from './UserAccount';

@Entity()
export class Account {
  @PrimaryColumn()
  owner_account: string;

  @PrimaryColumn()
  account_namespace: string;

  @PrimaryColumn()
  symbol: string;

  @Column({ type: 'decimal', scale: 0, nullable: false })
  balance: string;

  @OneToMany(() => UserAccount, (userAccount) => userAccount.account)
  user_accounts: UserAccount[];
}
