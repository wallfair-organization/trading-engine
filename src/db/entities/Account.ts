import { Check, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { UserAccount } from './UserAccount';

@Entity()
@Check('"balance" >= 0')
export class Account {
  @PrimaryColumn()
  owner_account: string;

  @PrimaryColumn()
  account_namespace: string;

  @PrimaryColumn()
  symbol: string;

  @Column({ type: 'decimal', nullable: false })
  balance: string;

  @OneToMany(() => UserAccount, (userAccount) => userAccount.account)
  user_accounts: UserAccount[];
}
