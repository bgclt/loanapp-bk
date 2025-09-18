import { PartialType, OmitType } from "@nestjs/swagger";
import { CreatePaymentDto } from "./create-payment.dto";

export class UpdatePaymentDto extends PartialType(OmitType(CreatePaymentDto, ["loanId"] as const)) {}
