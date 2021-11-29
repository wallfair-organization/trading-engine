import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Account {
  @PrimaryColumn()
  owner_account: string;

  @PrimaryColumn()
  account_namespace: string;

  @PrimaryColumn()
  symbol: string;

  @Column({ type: 'decimal', nullable: false })
  balance: string;

  @ManyToMany(() => User, (user) => user.accounts, {
    cascade: ['insert'],
  })
  users: User[];
}
