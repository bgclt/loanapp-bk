import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";
import { CompanySetting } from "./entities/company-setting.entity";

@Module({
  imports: [TypeOrmModule.forFeature([CompanySetting])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
