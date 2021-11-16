import { Column, Entity } from 'typeorm';
import { ExternalTransactionBase } from './ExternalTransactionBase';

@Entity()
export class ExternalTransactionLog extends ExternalTransactionBase {
  @Column({ nullable: true })
  symbol: string;

  @Column({ nullable: true })
  sender: string;

  @Column({ nullable: true })
  receiver: string;

  @Column({ type: 'decimal', nullable: true })
  amount: string;
}
