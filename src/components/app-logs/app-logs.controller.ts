import { Controller, Get, Delete, Param, Query, UseGuards, ParseIntPipe } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { LogsService } from "./app-logs.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permission.decorators";
import { Permission } from "../../common/enums/permission.enum";

@ApiTags("Logs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller("logs")
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @ApiOperation({
    summary: "Get activity logs with filtering and pagination",
    description:
      "Retrieve system activity logs with optional filtering by resource, action, user, and date range. Supports pagination.",
  })
  @ApiQuery({ name: "page", required: false, type: Number, description: "Page number (default: 1)" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Items per page (default: 50, max: 100)" })
  @ApiQuery({
    name: "resource",
    required: false,
    type: String,
    description: "Filter by resource type (e.g., loans, users)",
  })
  @ApiQuery({
    name: "action",
    required: false,
    type: String,
    description: "Filter by action type (e.g., CREATE, UPDATE, DELETE)",
  })
  @ApiQuery({ name: "userId", required: false, type: String, description: "Filter by user ID" })
  @ApiQuery({ name: "startDate", required: false, type: String, description: "Start date for filtering (ISO format)" })
  @ApiQuery({ name: "endDate", required: false, type: String, description: "End date for filtering (ISO format)" })
  @ApiResponse({
    status: 200,
    description: "Activity logs retrieved successfully",
    schema: {
      type: "object",
      properties: {
        logs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              action: { type: "string" },
              resource: { type: "string" },
              resourceId: { type: "string" },
              oldData: { type: "object" },
              newData: { type: "object" },
              user: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  fullname: { type: "string" },
                  email: { type: "string" },
                },
              },
              createdAt: { type: "string", format: "date-time" },
            },
          },
        },
        total: { type: "number" },
        page: { type: "number" },
        limit: { type: "number" },
      },
    },
  })
  @Permissions(Permission.CAN_LIST_LOGS)
  @Get()
  findAll(
    page: number,
    limit: number,
    @Query("resource") resource?: string,
    @Query("action") action?: string,
    @Query("userId") userId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const maxLimit = Math.min(limit, 100); // Limit to 100 items per page

    return this.logsService.findAll(page, maxLimit, resource, action, userId, start, end);
  }

  @ApiOperation({
    summary: "Get activity log by ID",
    description: "Retrieve detailed information about a specific activity log entry.",
  })
  @ApiResponse({
    status: 200,
    description: "Activity log retrieved successfully",
    schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        action: { type: "string" },
        resource: { type: "string" },
        resourceId: { type: "string" },
        oldData: { type: "object" },
        newData: { type: "object" },
        ipAddress: { type: "string" },
        userAgent: { type: "string" },
        user: {
          type: "object",
          properties: {
            id: { type: "string" },
            fullname: { type: "string" },
            email: { type: "string" },
          },
        },
        createdAt: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 404, description: "Activity log not found" })
  @Permissions(Permission.CAN_VIEW_LOGS)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.logsService.findOne(id);
  }

  @ApiOperation({
    summary: "Get activity log statistics",
    description:
      "Retrieve statistical information about system activity including action counts, resource usage, and top active users.",
  })
  @ApiResponse({
    status: 200,
    description: "Log statistics retrieved successfully",
    schema: {
      type: "object",
      properties: {
        totalLogs: { type: "number" },
        actionStats: {
          type: "array",
          items: {
            type: "object",
            properties: {
              action: { type: "string" },
              count: { type: "number" },
            },
          },
        },
        resourceStats: {
          type: "array",
          items: {
            type: "object",
            properties: {
              resource: { type: "string" },
              count: { type: "number" },
            },
          },
        },
        topUsers: {
          type: "array",
          items: {
            type: "object",
            properties: {
              user: { type: "string" },
              count: { type: "number" },
            },
          },
        },
      },
    },
  })
  @Permissions(Permission.CAN_VIEW_LOGS)
  @Get("statistics/overview")
  getStatistics() {
    return this.logsService.getLogStatistics();
  }

  @ApiOperation({
    summary: "Delete activity log",
    description: "Delete a specific activity log entry. This action is irreversible and should be used with caution.",
  })
  @ApiResponse({ status: 200, description: "Activity log deleted successfully" })
  @ApiResponse({ status: 404, description: "Activity log not found" })
  @Permissions(Permission.CAN_DELETE_LOGS)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.logsService.remove(id);
  }

  @ApiOperation({
    summary: "Delete old activity logs",
    description: "Delete activity logs older than the specified number of days. Returns the number of deleted records.",
  })
  @ApiQuery({ name: "days", required: true, type: Number, description: "Delete logs older than this many days" })
  @ApiResponse({
    status: 200,
    description: "Old logs deleted successfully",
    schema: {
      type: "object",
      properties: {
        deletedCount: { type: "number" },
        message: { type: "string" },
      },
    },
  })
  @Permissions(Permission.CAN_DELETE_LOGS)
  @Delete("cleanup/old")
  async deleteOldLogs(@Query("days", ParseIntPipe) days: number) {
    const deletedCount = await this.logsService.deleteOldLogs(days);
    return {
      deletedCount,
      message: `Deleted ${deletedCount} log entries older than ${days} days`,
    };
  }
}
