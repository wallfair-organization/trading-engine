import { Column, CreateDateColumn, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ExternalTransactionOriginator } from "../enums/ExternalTransactionOriginator";
import { ExternalTransactionStatus } from "../enums/ExternalTransactionStatus";

export abstract class ExternalTransactionBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    type: 'enum',
    enumName: 'external_transaction_originator',
    enum: ExternalTransactionOriginator
  })
  @Index()
  originator: string;

  @Column({ nullable: false })
  external_system: string;

  @Column({ 
    nullable: false,
    type: 'enum',
    enumName: 'external_transaction_status',
    enum: ExternalTransactionStatus
  })
  @Index()
  status: string;

  @Column()
  external_transaction_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  assignAttributes(attributes) {
    this.originator = attributes.originator;
    this.external_system = attributes.external_system;
    this.status = attributes.status;
    this.external_transaction_id = attributes.external_transaction_id;
  }
};