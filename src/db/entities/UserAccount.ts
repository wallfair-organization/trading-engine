import { Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity()
@Unique('owner_namespace', ['owner_account', 'account_namespace'])
export class UserAccount {
  @PrimaryColumn()
  user_id: string;

  @PrimaryColumn()
  owner_account: string;

  @PrimaryColumn()
  account_namespace: string;
}
