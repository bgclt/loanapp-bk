import { Controller, Get, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"
import type { ReportsService } from "./reports.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { PermissionsGuard } from "../../common/guards/permissions.guard"
import { Permissions } from "../../common/decorators/permission.decorators"
import { Permission } from "../../common/enums/permission.enum"

@ApiTags("Reports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({
    summary: "Get dashboard statistics",
    description:
      "Retrieve comprehensive dashboard statistics including loan counts, user statistics, and financial summaries.",
  })
  @ApiResponse({
    status: 200,
    description: "Dashboard statistics retrieved successfully",
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
          },
        },
        users: {
          type: "object",
          properties: {
            total: { type: "number" },
            active: { type: "number" },
          },
        },
        financial: {
          type: "object",
          properties: {
            totalDisbursed: { type: "number" },
            totalCollected: { type: "number" },
            outstandingBalance: { type: "number" },
          },
        },
      },
    },
  })
  @Permissions(Permission.CAN_VIEW_REPORTS)
  @Get("dashboard")
  getDashboardStats() {
    return this.reportsService.getDashboardStats()
  }

  @ApiOperation({
    summary: "Get loans by status",
    description:
      "Retrieve loan distribution across different statuses (registration, capturing, approval, disbursement, active, completed).",
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
  @Get("loans/by-status")
  getLoansByStatus() {
    return this.reportsService.getLoansByStatus()
  }

  @ApiOperation({
    summary: "Get monthly loan trends",
    description: "Retrieve monthly loan creation trends including counts and amounts over the specified period.",
  })
  @ApiQuery({ name: "months", required: false, type: Number, description: "Number of months to include (default: 12)" })
  @ApiResponse({
    status: 200,
    description: "Monthly loan trends retrieved successfully",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          month: { type: "string", format: "date" },
          count: { type: "number" },
          totalRequested: { type: "number" },
          totalApproved: { type: "number" },
        },
      },
    },
  })
  @Permissions(Permission.CAN_VIEW_REPORTS)
  @Get("loans/trends")
  getLoanTrends(months?: number) {
    return this.reportsService.getMonthlyLoanTrends(months)
  }

  @ApiOperation({
    summary: "Get payment trends",
    description: "Retrieve monthly payment trends including payment counts and total amounts collected.",
  })
  @ApiQuery({ name: "months", required: false, type: Number, description: "Number of months to include (default: 12)" })
  @ApiResponse({
    status: 200,
    description: "Payment trends retrieved successfully",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          month: { type: "string", format: "date" },
          count: { type: "number" },
          totalAmount: { type: "number" },
        },
      },
    },
  })
  @Permissions(Permission.CAN_VIEW_REPORTS)
  @Get("payments/trends")
  getPaymentTrends(months?: number) {
    return this.reportsService.getPaymentTrends(months)
  }

  @ApiOperation({
    summary: "Get top performing loan officers",
    description: "Retrieve top 10 loan officers based on number of loans created and total amounts processed.",
  })
  @ApiResponse({
    status: 200,
    description: "Top performers retrieved successfully",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          loanCount: { type: "number" },
          totalAmount: { type: "number" },
        },
      },
    },
  })
  @Permissions(Permission.CAN_VIEW_REPORTS)
  @Get("performance/top-officers")
  getTopPerformers() {
    return this.reportsService.getTopPerformers()
  }

  @ApiOperation({
    summary: "Get defaulter report",
    description: "Retrieve list of clients who have missed their payment due dates along with summary statistics.",
  })
  @ApiResponse({
    status: 200,
    description: "Defaulter report retrieved successfully",
    schema: {
      type: "object",
      properties: {
        summary: {
          type: "object",
          properties: {
            totalDefaulters: { type: "number" },
            totalOutstanding: { type: "number" },
          },
        },
        defaulters: {
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
      },
    },
  })
  @Permissions(Permission.CAN_VIEW_REPORTS)
  @Get("defaulters")
  getDefaulterReport() {
    return this.reportsService.getDefaulterReport()
  }

  @ApiOperation({
    summary: "Get collection report",
    description: "Retrieve payment collection report for a specific date range with summary statistics.",
  })
  @ApiQuery({ name: "startDate", required: true, type: String, description: "Start date (ISO format)" })
  @ApiQuery({ name: "endDate", required: true, type: String, description: "End date (ISO format)" })
  @ApiResponse({
    status: 200,
    description: "Collection report retrieved successfully",
    schema: {
      type: "object",
      properties: {
        summary: {
          type: "object",
          properties: {
            totalPayments: { type: "number" },
            totalAmount: { type: "number" },
            averagePayment: { type: "number" },
          },
        },
        payments: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              amount: { type: "number" },
              paymentDate: { type: "string", format: "date" },
              loanId: { type: "string" },
              clientName: { type: "string" },
              receivedBy: { type: "string" },
            },
          },
        },
      },
    },
  })
  @Permissions(Permission.CAN_VIEW_REPORTS)
  @Get("collections")
  getCollectionReport(startDate: string, endDate: string) {
    return this.reportsService.getCollectionReport(new Date(startDate), new Date(endDate))
  }

  @ApiOperation({
    summary: "Export report",
    description: "Export various reports in different formats (JSON, CSV, PDF). Currently supports JSON format.",
  })
  @ApiQuery({
    name: "type",
    required: true,
    type: String,
    description: "Report type (dashboard, defaulters, loan-trends, payment-trends)",
  })
  @ApiQuery({
    name: "format",
    required: false,
    type: String,
    description: "Export format (json, csv, pdf) - default: json",
  })
  @ApiResponse({
    status: 200,
    description: "Report exported successfully",
    schema: {
      type: "object",
      properties: {
        reportType: { type: "string" },
        format: { type: "string" },
        generatedAt: { type: "string", format: "date-time" },
        data: { type: "object" },
      },
    },
  })
  @Permissions(Permission.CAN_EXPORT_REPORTS)
  @Get("export")
  exportReport(type: string, format = "json") {
    return this.reportsService.exportReport(type, format)
  }
}
