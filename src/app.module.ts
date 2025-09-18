import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./components/auth/auth.module";
import { UsersModule } from "./components/users/users.module";
import { RolesModule } from "./components/roles/roles.module";
import { LoansModule } from "./components/loans/loans.module";
import { MailModule } from "./core/mail/mail.module";
import { DatabaseModule } from "./core/database/database.module";
import { LogsModule } from "./components/app-logs/app-logs.module";
import { ReportsModule } from "./components/reports/reports.module";
import { SettingsModule } from "./components/settings/settings.module";
import { DashboardModule } from "./components/dashboard/dashboard.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["environment/.env.development.local", ".env", ".env.example"],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    RolesModule,
    LoansModule,
    MailModule,
    LogsModule,
    ReportsModule,
    SettingsModule,
    DashboardModule,
  ],
})
export class AppModule {}
