import { AccountNamespace } from './enums/AccountNamespace';

export interface Transaction {
  sender_namespace: AccountNamespace;
  sender_account: string;
  receiver_namespace: AccountNamespace;
  receiver_account: string;
  symbol: string;
  amount: string;
}
