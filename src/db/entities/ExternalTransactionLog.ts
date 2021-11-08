import { Entity } from "typeorm";
import { ExternalTransactionBase } from "./ExternalTransactionBase";

@Entity()
export class ExternalTransactionLog extends ExternalTransactionBase {
}
