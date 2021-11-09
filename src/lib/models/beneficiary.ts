export class Beneficiary {
  owner: string;
  namespace: string;
  symbol: string;

  constructor(owner: string, namespace: string, symbol:string) {
    this.owner = owner;
    this.namespace = namespace;
    this.symbol = symbol;
  }
}