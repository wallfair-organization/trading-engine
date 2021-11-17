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

  // REV: please add scale=0 to the decimal we want only integers to be stored
  @Column({ type: 'decimal', nullable: true })
  amount: string;
}
