import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { User } from "../../components/users/entities/user.entity";
import { Role } from "../../components/roles/entities/role.entity";
import { Permission } from "../../components/roles/entities/permission.entity";
import { Loan } from "../../components/loans/entities/loan.entity";
import { LoanPhase } from "../../components/loans/entities/loan-phase.entity";
import { Witness } from "../../components/loans/entities/witness.entity";
import { BusinessLocation } from "../../components/loans/entities/business-location.entity";
import { Residence } from "../../components/loans/entities/residence.entity";
import { Payment } from "../../components/loans/entities/payment.entity";
import { ActivityLog } from "../../components/app-logs/entities/activity-log.entity";
import { CompanySetting } from "../../components/settings/entities/company-setting.entity";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST"),
        port: +configService.get("DB_PORT"),
        username: configService.get("DB_USERNAME"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_NAME"),
        entities: [
          User,
          Role,
          Permission,
          Loan,
          LoanPhase,
          Witness,
          BusinessLocation,
          Residence,
          Payment,
          ActivityLog,
          CompanySetting,
        ],
        synchronize: process.env.NODE_ENV === "development",
        logging: process.env.NODE_ENV === "development",
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
