import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { Loan } from "../loans/entities/loan.entity";
import { Payment } from "../loans/entities/payment.entity";
import { User } from "../users/entities/user.entity";
import { ActivityLog } from "../app-logs/entities/activity-log.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Loan, Payment, User, ActivityLog])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
