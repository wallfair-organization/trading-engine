import {
  Column,
  CreateDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NetworkCode } from '../../lib/models/enums/NetworkCode';

export abstract class ExternalTransactionBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
  })
  @Index()
  originator: string;

  @Column({ nullable: false })
  external_system: string;

  @Column({
    nullable: false,
  })
  @Index()
  status: string;

  @Column({ nullable: true })
  external_transaction_id: string;

  @Column({ nullable: true })
  transaction_hash: string;

  @Column({ nullable: false })
  network_code: string = NetworkCode.ETH;

  @Column({ nullable: true })
  block_number: number;

  @Column({ nullable: true })
  internal_user_id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  assignAttributes(attributes) {
    this.originator = attributes.originator;
    this.external_system = attributes.external_system;
    this.status = attributes.status;
    this.external_transaction_id = attributes.external_transaction_id;
    this.network_code = attributes.network_code;
  }
}
