import { Controller, Post, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { MailService } from "./mail.service";
import { JwtAuthGuard } from "../../components/auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permission.decorators";
import { Permission } from "../../common/enums/permission.enum";
import { SendBulkEmailDto } from "./dto/send-bulk-email.dto";
import { SendLoanNotificationDto } from "./dto/send-loan-notification.dto";
import { SendPaymentReminderDto } from "./dto/send-payment-reminder.dto";

@ApiTags("Mail")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("mail")
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @ApiOperation({ summary: "Send bulk email to multiple recipients" })
  @ApiResponse({ status: 200, description: "Bulk email sent successfully" })
  @Permissions(Permission.ALL)
  @Post("bulk")
  async sendBulkEmail(sendBulkEmailDto: SendBulkEmailDto) {
    await this.mailService.sendBulkEmail(
      sendBulkEmailDto.emails,
      sendBulkEmailDto.subject,
      sendBulkEmailDto.htmlContent,
      sendBulkEmailDto.textContent,
    );
    return { message: "Bulk email sent successfully" };
  }

  @ApiOperation({ summary: "Send loan status notification" })
  @ApiResponse({ status: 200, description: "Loan notification sent successfully" })
  @Permissions(Permission.CAN_UPDATE_LOANS)
  @Post("loan-notification")
  async sendLoanNotification(sendLoanNotificationDto: SendLoanNotificationDto) {
    await this.mailService.sendLoanStatusNotification(
      sendLoanNotificationDto.email,
      sendLoanNotificationDto.clientName,
      sendLoanNotificationDto.loanId,
      sendLoanNotificationDto.status,
      sendLoanNotificationDto.message,
    );
    return { message: "Loan notification sent successfully" };
  }

  @ApiOperation({ summary: "Send payment reminder" })
  @ApiResponse({ status: 200, description: "Payment reminder sent successfully" })
  @Permissions(Permission.CAN_VIEW_LOANS)
  @Post("payment-reminder")
  async sendPaymentReminder(sendPaymentReminderDto: SendPaymentReminderDto) {
    await this.mailService.sendPaymentReminder(
      sendPaymentReminderDto.email,
      sendPaymentReminderDto.clientName,
      sendPaymentReminderDto.loanId,
      sendPaymentReminderDto.dueAmount,
      new Date(sendPaymentReminderDto.dueDate),
    );
    return { message: "Payment reminder sent successfully" };
  }
}
