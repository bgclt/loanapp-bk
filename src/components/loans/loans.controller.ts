import { Controller, Get, Post, Patch, Param, Delete, UseGuards, Request, Query } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"
import { LoansService } from "./loans.service"
import { PaymentsService } from "./payments.service"
import { CreateLoanDto } from "./dto/create-loan.dto"
import { UpdateLoanCapturingDto } from "./dto/update-loan-capturing.dto"
import { ApproveLoanDto } from "./dto/approve-loan.dto"
import { DisburseLoanDto } from "./dto/disburse-loan.dto"
import { CreatePaymentDto } from "./dto/create-payment.dto"
import { UpdatePaymentDto } from "./dto/update-payment.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { PermissionsGuard } from "../../common/guards/permissions.guard"
import { Permissions } from "../../common/decorators/permission.decorators"
import { Permission } from "../../common/enums/permission.enum"
import { LoanStatus } from "../../common/enums/loan.enum"

@ApiTags("Loans")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller("loans")
export class LoansController {
  constructor(
    private readonly loansService: LoansService,
    private readonly paymentsService: PaymentsService,
  ) {}

  // Loan endpoints
  @ApiOperation({ summary: "Create a new loan (Registration Phase)" })
  @ApiResponse({ status: 201, description: "Loan created successfully" })
  @Permissions(Permission.CAN_CREATE_LOANS)
  @Post()
  create(createLoanDto: CreateLoanDto, @Request() req) {
    return this.loansService.create(createLoanDto, req.user)
  }

  @ApiOperation({ summary: 'Get all loans' })
  @ApiQuery({ name: 'status', required: false, enum: LoanStatus })
  @ApiResponse({ status: 200, description: 'Loans retrieved successfully' })
  @Permissions(Permission.CAN_LIST_LOANS)
  @Get()
  findAll(@Query('status') status?: LoanStatus) {
    return this.loansService.findAll(status);
  }

  @ApiOperation({ summary: 'Get loan by ID' })
  @ApiResponse({ status: 200, description: 'Loan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  @Permissions(Permission.CAN_GET_LOANS)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loansService.findOne(id);
  }

  @ApiOperation({ summary: "Update loan capturing phase (Phase 2)" })
  @ApiResponse({ status: 200, description: "Loan updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @Permissions(Permission.CAN_UPDATE_LOANS)
  @Patch(":id/capturing")
  updateCapturing(@Param('id') id: string, updateLoanCapturingDto: UpdateLoanCapturingDto, @Request() req) {
    return this.loansService.updateCapturing(id, updateLoanCapturingDto, req.user)
  }

  @ApiOperation({ summary: "Approve loan (Phase 3)" })
  @ApiResponse({ status: 200, description: "Loan approved successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @Permissions(Permission.CAN_APPROVE_LOANS)
  @Patch(":id/approve")
  approve(@Param('id') id: string, approveLoanDto: ApproveLoanDto, @Request() req) {
    return this.loansService.approve(id, approveLoanDto, req.user)
  }

  @ApiOperation({ summary: "Disburse loan (Phase 4)" })
  @ApiResponse({ status: 200, description: "Loan disbursed successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @Permissions(Permission.CAN_DISBURSE_LOANS)
  @Patch(":id/disburse")
  disburse(@Param('id') id: string, disburseLoanDto: DisburseLoanDto, @Request() req) {
    return this.loansService.disburse(id, disburseLoanDto, req.user)
  }

  @ApiOperation({ summary: 'Get loans by status' })
  @ApiResponse({ status: 200, description: 'Loans retrieved successfully' })
  @Permissions(Permission.CAN_LIST_LOANS)
  @Get('status/:status')
  findByStatus(@Param('status') status: LoanStatus) {
    return this.loansService.findByStatus(status);
  }

  @ApiOperation({ summary: 'Get due payments for today or specific date' })
  @ApiQuery({ name: 'date', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Due payments retrieved successfully' })
  @Permissions(Permission.CAN_VIEW_REPORTS)
  @Get('reports/due-payments')
  getDuePayments(@Query('date') date?: string) {
    const targetDate = date ? new Date(date) : undefined;
    return this.loansService.findDuePayments(targetDate);
  }

  @ApiOperation({ summary: "Get loan defaulters" })
  @ApiResponse({ status: 200, description: "Defaulters retrieved successfully" })
  @Permissions(Permission.CAN_VIEW_REPORTS)
  @Get("reports/defaulters")
  getDefaulters() {
    return this.loansService.findDefaulters()
  }

  @ApiOperation({ summary: 'Get loan statement' })
  @ApiResponse({ status: 200, description: 'Loan statement retrieved successfully' })
  @Permissions(Permission.CAN_VIEW_LOANS)
  @Get(':id/statement')
  getLoanStatement(@Param('id') id: string) {
    return this.loansService.getLoanStatement(id);
  }

  @ApiOperation({ summary: "Delete loan" })
  @ApiResponse({ status: 200, description: "Loan deleted successfully" })
  @ApiResponse({ status: 400, description: "Can only delete loans in registration phase" })
  @Permissions(Permission.CAN_DELETE_LOANS)
  @Delete(":id")
  remove(@Param('id') id: string, @Request() req) {
    return this.loansService.remove(id, req.user)
  }

  // Payment endpoints
  @ApiOperation({ summary: "Create a payment" })
  @ApiResponse({ status: 201, description: "Payment created successfully" })
  @Permissions(Permission.CAN_CREATE_PAYMENTS)
  @Post("payments")
  createPayment(createPaymentDto: CreatePaymentDto, @Request() req) {
    return this.paymentsService.create(createPaymentDto, req.user)
  }

  @ApiOperation({ summary: "Get all payments" })
  @ApiResponse({ status: 200, description: "Payments retrieved successfully" })
  @Permissions(Permission.CAN_LIST_PAYMENTS)
  @Get("payments")
  findAllPayments() {
    return this.paymentsService.findAll()
  }

  @ApiOperation({ summary: "Get payments by date range" })
  @ApiQuery({ name: "startDate", required: true, type: String })
  @ApiQuery({ name: "endDate", required: true, type: String })
  @ApiResponse({ status: 200, description: "Payments retrieved successfully" })
  @Permissions(Permission.CAN_LIST_PAYMENTS)
  @Get("payments/date-range")
  findPaymentsByDateRange(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.paymentsService.findByDateRange(new Date(startDate), new Date(endDate))
  }

  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @Permissions(Permission.CAN_GET_PAYMENTS)
  @Get('payments/:id')
  findOnePayment(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @ApiOperation({ summary: "Update payment" })
  @ApiResponse({ status: 200, description: "Payment updated successfully" })
  @Permissions(Permission.CAN_UPDATE_PAYMENTS)
  @Patch("payments/:id")
  updatePayment(@Param('id') id: string, updatePaymentDto: UpdatePaymentDto, @Request() req) {
    return this.paymentsService.update(id, updatePaymentDto, req.user)
  }

  @ApiOperation({ summary: "Delete payment" })
  @ApiResponse({ status: 200, description: "Payment deleted successfully" })
  @Permissions(Permission.CAN_DELETE_PAYMENTS)
  @Delete("payments/:id")
  removePayment(@Param('id') id: string, @Request() req) {
    return this.paymentsService.remove(id, req.user)
  }
}
