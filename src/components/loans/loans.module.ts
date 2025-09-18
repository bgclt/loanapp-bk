import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoansController } from "./loans.controller";
import { LoansService } from "./loans.service";
import { PaymentsService } from "./payments.service";
import { Loan } from "./entities/loan.entity";
import { LoanPhase } from "./entities/loan-phase.entity";
import { Witness } from "./entities/witness.entity";
import { BusinessLocation } from "./entities/business-location.entity";
import { Residence } from "./entities/residence.entity";
import { Payment } from "./entities/payment.entity";
import { ActivityLog } from "../app-logs/entities/activity-log.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Loan, LoanPhase, Witness, BusinessLocation, Residence, Payment, ActivityLog])],
  controllers: [LoansController],
  providers: [LoansService, PaymentsService],
  exports: [LoansService, PaymentsService],
})
export class LoansModule {}
