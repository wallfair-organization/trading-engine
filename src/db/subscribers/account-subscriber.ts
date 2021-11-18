import BigNumber from 'bignumber.js';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Account } from '../entities/Account';

@EventSubscriber()
export class AccountSubscriber implements EntitySubscriberInterface {
  afterInsert(event: InsertEvent<Account>) {
    if (new BigNumber(event.entity.balance).isNegative()) {
      throw new Error('Account limit exceeded');
    }
  }
}
