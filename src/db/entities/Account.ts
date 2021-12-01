import { Column, Entity, PrimaryColumn } from 'typeorm';

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
}
