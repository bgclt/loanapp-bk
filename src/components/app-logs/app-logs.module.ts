import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LogsController } from "./app-logs.controller";
import { LogsService } from "./app-logs.service";
import { ActivityLog } from "./entities/activity-log.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog])],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
