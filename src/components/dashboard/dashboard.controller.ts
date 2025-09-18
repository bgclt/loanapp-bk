import { Controller, Get, Query, UseGuards, ParseIntPipe } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permission.decorators";
import { Permission } from "../../common/enums/permission.enum";

@ApiTags("Dashboard")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({
    summary: "Get dashboard overview statistics",
    description:
      "Retrieve comprehensive overview statistics including loan counts, financial summaries, and user statistics for the dashboard.",
  })
  @ApiResponse({
    status: 200,
    description: "Dashboard overview retrieved successfully",
    schema: {
      type: "object",
      properties: {
        loans: {
          type: "object",
          properties: {
            total: { type: "number" },
            active: { type: "number" },
            completed: { type: "number" },
            pendingApproval: { type: "number" },
            monthly: { type: "number" },
            weekly: { type: "number" },
          },
        },
        financial: {
          type: "object",
          properties: {
            totalDisbursed: { type: "number" },
            totalCollected: { type: "number" },
            outstandingBalance: { type: "number" },
            monthlyCollection: { type: "number" },
            weeklyCollection: { type: "number" },
          },
        },
        users: {
          type: "object",
          properties: {
            total: { type: "number" },
            active: { type: "number" },
          },
        },
      },
    },
  })
  @Permissions(Permission.CAN_VIEW_REPORTS)
  @Get("overview")
  getOverview() {
    return this.dashboardService.getOverviewStats();
  }

  @ApiOperation({
    summary: "Get recent system activity",
    description: "Retrieve recent system activities and user actions for the dashboard activity feed.",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of activities to retrieve (default: 10)",
  })
  @ApiResponse({
    status: 200,
    description: "Recent activities retrieved successfully",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          action: { type: "string" },
          resource: { type: "string" },
          resourceId: { type: "string" },
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
  })
  @Permissions(Permission.CAN_VIEW_LOGS)
  @Get("recent-activity")
  getRecentActivity(@Query("limit", new ParseIntPipe({ optional: true })) limit?: number) {
    return this.dashboardService.getRecentActivity(limit);
  }

  @ApiOperation({
    summary: "Get upcoming payments",
    description: "Retrieve loans with upcoming payment due dates within the specified number of days.",
  })
  @ApiQuery({ name: "days", required: false, type: Number, description: "Number of days to look ahead (default: 7)" })
  @ApiResponse({
    status: 200,
    description: "Upcoming payments retrieved successfully",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          clientFullname: { type: "string" },
          clientContact: { type: "string" },
          approvedAmount: { type: "number" },
          remainingBalance: { type: "number" },
          nextPaymentDate: { type: "string", format: "date" },
        },
      },
    },
  })
  @Permissions(Permission.CAN_VIEW_LOANS)
  @Get("upcoming-payments")
  getUpcomingPayments(@Query("days", new ParseIntPipe({ optional: true })) days?: number) {
    return this.dashboardService.getUpcomingPayments(days);
  }

  @ApiOperation({
    summary: "Get overdue payments",
    description: "Retrieve loans with overdue payments that are past their due dates.",
  })
  @ApiResponse({
    status: 200,
    description: "Overdue payments retrieved successfully",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          clientFullname: { type: "string" },
          clientContact: { type: "string" },
          approvedAmount: { type: "number" },
          remainingBalance: { type: "number" },
          nextPaymentDate: { type: "string", format: "date" },
        },
      },
    },
  })
  @Permissions(Permission.CAN_VIEW_LOANS)
  @Get("overdue-payments")
  getOverduePayments() {
    return this.dashboardService.getOverduePayments();
  }

  @ApiOperation({
    summary: "Get loan status distribution",
    description: "Retrieve the distribution of loans across different statuses for pie chart visualization.",
  })
  @ApiResponse({
    status: 200,
    description: "Loan status distribution retrieved successfully",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          status: { type: "string" },
          count: { type: "number" },
        },
      },
    },
  })
  @Permissions(Permission.CAN_VIEW_REPORTS)
  @Get("loan-status-distribution")
  getLoanStatusDistribution() {
    return this.dashboardService.getLoanStatusDistribution();
  }

  @ApiOperation({
    summary: "Get monthly trends",
    description: "Retrieve monthly trends for loans and payments over the specified number of months.",
  })
  @ApiQuery({ name: "months", required: false, type: Number, description: "Number of months to include (default: 6)" })
  @ApiResponse({
    status: 200,
    description: "Monthly trends retrieved successfully",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          month: { type: "string" },
          loans: { type: "number" },
          payments: { type: "number" },
        },
      },
    },
  })
  @Permissions(Permission.CAN_VIEW_REPORTS)
  @Get("monthly-trends")
  getMonthlyTrends(@Query("months", new ParseIntPipe({ optional: true })) months?: number) {
    return this.dashboardService.getMonthlyTrends(months);
  }

  @ApiOperation({
    summary: "Get top performing loan officers",
    description: "Retrieve top performing loan officers based on loan count and total amounts processed.",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of top performers to retrieve (default: 5)",
  })
  @ApiResponse({
    status: 200,
    description: "Top performers retrieved successfully",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          userId: { type: "string" },
          name: { type: "string" },
          loanCount: { type: "number" },
          totalAmount: { type: "number" },
        },
      },
    },
  })
  @Permissions(Permission.CAN_VIEW_REPORTS)
  @Get("top-performers")
  getTopPerformers(@Query("limit", new ParseIntPipe({ optional: true })) limit?: number) {
    return this.dashboardService.getTopPerformers(limit);
  }

  @ApiOperation({
    summary: "Get system health status",
    description: "Retrieve system health indicators including error counts, user activity, and overall system status.",
  })
  @ApiResponse({
    status: 200,
    description: "System health status retrieved successfully",
    schema: {
      type: "object",
      properties: {
        totalLogs: { type: "number" },
        recentErrors: { type: "number" },
        userActivity: {
          type: "object",
          properties: {
            active: { type: "number" },
            total: { type: "number" },
            percentage: { type: "number" },
          },
        },
        systemStatus: { type: "string", enum: ["healthy", "warning", "error"] },
      },
    },
  })
  @Permissions(Permission.CAN_VIEW_LOGS)
  @Get("system-health")
  getSystemHealth() {
    return this.dashboardService.getSystemHealth();
  }
}
