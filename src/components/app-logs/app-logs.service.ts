import { Injectable, NotFoundException } from "@nestjs/common";
import { Repository, Between } from "typeorm";
import { ActivityLog } from "./entities/activity-log.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogsRepository: Repository<ActivityLog>,
  ) {}

  async findAll(
    page = 1,
    limit = 50,
    resource?: string,
    action?: string,
    userId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ logs: ActivityLog[]; total: number; page: number; limit: number }> {
    const query = this.activityLogsRepository
      .createQueryBuilder("log")
      .leftJoinAndSelect("log.user", "user")
      .orderBy("log.createdAt", "DESC");

    if (resource) {
      query.andWhere("log.resource = :resource", { resource });
    }

    if (action) {
      query.andWhere("log.action = :action", { action });
    }

    if (userId) {
      query.andWhere("log.userId = :userId", { userId });
    }

    if (startDate && endDate) {
      query.andWhere("log.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      });
    }

    const total = await query.getCount();
    const logs = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { logs, total, page, limit };
  }

  async findOne(id: string): Promise<ActivityLog> {
    const log = await this.activityLogsRepository.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!log) {
      throw new NotFoundException(`Activity log with ID ${id} not found`);
    }

    return log;
  }

  async getLogStatistics(): Promise<any> {
    const totalLogs = await this.activityLogsRepository.count();

    const actionStats = await this.activityLogsRepository
      .createQueryBuilder("log")
      .select("log.action", "action")
      .addSelect("COUNT(*)", "count")
      .groupBy("log.action")
      .getRawMany();

    const resourceStats = await this.activityLogsRepository
      .createQueryBuilder("log")
      .select("log.resource", "resource")
      .addSelect("COUNT(*)", "count")
      .groupBy("log.resource")
      .getRawMany();

    const userStats = await this.activityLogsRepository
      .createQueryBuilder("log")
      .leftJoin("log.user", "user")
      .select("user.fullname", "user")
      .addSelect("COUNT(*)", "count")
      .groupBy("user.id")
      .orderBy("count", "DESC")
      .limit(10)
      .getRawMany();

    return {
      totalLogs,
      actionStats,
      resourceStats,
      topUsers: userStats,
    };
  }

  async remove(id: string): Promise<void> {
    const result = await this.activityLogsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Activity log with ID ${id} not found`);
    }
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await this.activityLogsRepository.delete(ids);
  }

  async deleteOldLogs(daysOld: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.activityLogsRepository.delete({
      createdAt: Between(new Date("1970-01-01"), cutoffDate),
    });

    return result.affected || 0;
  }
}
