import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique('request_id_status', ['request_id', 'request_status'])
export class WebhookQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'jsonb',
    array: false,
    nullable: false,
  })
  request: string;

  @Column()
  status: string;

  @Column()
  error: string;

  @Column()
  request_id: string;

  @Column()
  request_status: string;

  @Column({ default: 1 })
  attempts: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
