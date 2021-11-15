import { AccountNamespace } from './enums/AccountNamespace';

export interface Beneficiary {
  owner: string;
  namespace: AccountNamespace;
  symbol: string;
}
