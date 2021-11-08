import {Column, Entity, OneToMany, PrimaryColumn} from "typeorm";
import { AccountNamespace } from "../enums/AccountNamespace";
import { UserAccount } from "./UserAccount";

@Entity()
export class Account {
  @PrimaryColumn()
  owner_account: string;

  @PrimaryColumn({
    type: 'enum',
    enumName: 'account_namespace_enum',
    enum: AccountNamespace
  })
  account_namespace: AccountNamespace;

  @PrimaryColumn()
  symbol: string;

  @Column({ type: 'decimal', precision: 18, scale: 0, nullable: false })
  balance: number;

  @OneToMany(() => UserAccount, (userAccount) => userAccount.account)
  user_accounts: UserAccount[];
}
