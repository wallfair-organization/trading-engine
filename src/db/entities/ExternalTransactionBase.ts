import {
  Column,
  CreateDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  assignAttributes(attributes) {
    this.originator = attributes.originator;
    this.external_system = attributes.external_system;
    this.status = attributes.status;
    this.external_transaction_id = attributes.external_transaction_id;
  }
}
