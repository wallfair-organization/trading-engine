import { Entity } from 'typeorm';
import { ExternalTransactionBase } from './ExternalTransactionBase';

@Entity()
export class ExternalTransaction extends ExternalTransactionBase {}
