import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as AWS from "aws-sdk";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private ses: AWS.SES;
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    // Configure AWS SES
    const awsConfig: any = {
      accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID"),
      secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY"),
      region: this.configService.get("AWS_REGION"),
      sessionToken: this.configService.get("AWS_SESSION_TOKEN"),
    };

    AWS.config.update(awsConfig);

    this.ses = new AWS.SES({ apiVersion: "2010-12-01" });
    this.fromEmail = this.configService.get<string>("SES_FROM_EMAIL") ?? "";
    if (!this.fromEmail) {
      throw new Error("SES_FROM_EMAIL is not configured in environment variables");
    }
  }

  async sendPasswordResetEmail(email: string, fullname: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.configService.get("FRONTEND_URL")}/reset-password?token=${resetToken}`;

    const params: AWS.SES.SendEmailRequest = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: this.getPasswordResetTemplate(fullname, resetUrl),
          },
          Text: {
            Charset: "UTF-8",
            Data: `Hello ${fullname},\n\nYou requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nLoan Management System`,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Password Reset Request - Loan Management System",
        },
      },
      Source: this.fromEmail,
    };

    try {
      const result = await this.ses.sendEmail(params).promise();
      this.logger.log(`Password reset email sent to ${email}. MessageId: ${result.MessageId}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, fullname: string): Promise<void> {
    const params: AWS.SES.SendEmailRequest = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: this.getWelcomeTemplate(fullname),
          },
          Text: {
            Charset: "UTF-8",
            Data: `Welcome to Loan Management System!\n\nHello ${fullname},\n\nYour account has been successfully created. You can now log in to access the system.\n\nBest regards,\nLoan Management System Team`,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Welcome to Loan Management System",
        },
      },
      Source: this.fromEmail,
    };

    try {
      const result = await this.ses.sendEmail(params).promise();
      this.logger.log(`Welcome email sent to ${email}. MessageId: ${result.MessageId}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      throw error;
    }
  }

  async sendLoanStatusNotification(
    email: string,
    clientName: string,
    loanId: string,
    status: string,
    message: string,
  ): Promise<void> {
    const params: AWS.SES.SendEmailRequest = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: this.getLoanStatusTemplate(clientName, loanId, status, message),
          },
          Text: {
            Charset: "UTF-8",
            Data: `Loan Status Update\n\nHello ${clientName},\n\nYour loan application (ID: ${loanId}) status has been updated to: ${status}\n\n${message}\n\nBest regards,\nLoan Management System Team`,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: `Loan Status Update - ${status}`,
        },
      },
      Source: this.fromEmail,
    };

    try {
      const result = await this.ses.sendEmail(params).promise();
      this.logger.log(`Loan status notification sent to ${email}. MessageId: ${result.MessageId}`);
    } catch (error) {
      this.logger.error(`Failed to send loan status notification to ${email}:`, error);
      throw error;
    }
  }

  async sendPaymentReminder(
    email: string,
    clientName: string,
    loanId: string,
    dueAmount: number,
    dueDate: Date,
  ): Promise<void> {
    const params: AWS.SES.SendEmailRequest = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: this.getPaymentReminderTemplate(clientName, loanId, dueAmount, dueDate),
          },
          Text: {
            Charset: "UTF-8",
            Data: `Payment Reminder\n\nHello ${clientName},\n\nThis is a reminder that your loan payment is due.\n\nLoan ID: ${loanId}\nDue Amount: $${dueAmount}\nDue Date: ${dueDate.toDateString()}\n\nPlease make your payment on time to avoid any penalties.\n\nBest regards,\nLoan Management System Team`,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Payment Reminder - Loan Management System",
        },
      },
      Source: this.fromEmail,
    };

    try {
      const result = await this.ses.sendEmail(params).promise();
      this.logger.log(`Payment reminder sent to ${email}. MessageId: ${result.MessageId}`);
    } catch (error) {
      this.logger.error(`Failed to send payment reminder to ${email}:`, error);
      throw error;
    }
  }

  async sendPaymentConfirmation(
    email: string,
    clientName: string,
    loanId: string,
    paymentAmount: number,
    paymentDate: Date,
    remainingBalance: number,
  ): Promise<void> {
    const params: AWS.SES.SendEmailRequest = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: this.getPaymentConfirmationTemplate(clientName, loanId, paymentAmount, paymentDate, remainingBalance),
          },
          Text: {
            Charset: "UTF-8",
            Data: `Payment Confirmation\n\nHello ${clientName},\n\nWe have received your payment.\n\nLoan ID: ${loanId}\nPayment Amount: $${paymentAmount}\nPayment Date: ${paymentDate.toDateString()}\nRemaining Balance: $${remainingBalance}\n\nThank you for your payment.\n\nBest regards,\nLoan Management System Team`,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Payment Confirmation - Loan Management System",
        },
      },
      Source: this.fromEmail,
    };

    try {
      const result = await this.ses.sendEmail(params).promise();
      this.logger.log(`Payment confirmation sent to ${email}. MessageId: ${result.MessageId}`);
    } catch (error) {
      this.logger.error(`Failed to send payment confirmation to ${email}:`, error);
      throw error;
    }
  }

  async sendBulkEmail(emails: string[], subject: string, htmlContent: string, textContent: string): Promise<void> {
    const params: AWS.SES.SendBulkTemplatedEmailRequest = {
      Source: this.fromEmail,
      Template: "BulkEmailTemplate",
      DefaultTemplateData: JSON.stringify({
        subject,
        htmlContent,
        textContent,
      }),
      Destinations: emails.map(email => ({
        Destination: {
          ToAddresses: [email],
        },
        ReplacementTemplateData: JSON.stringify({}),
      })),
    };

    try {
      const result = await this.ses.sendBulkTemplatedEmail(params).promise();
      result.Status.forEach((status, index) => {
        if (status.Status === "Success") {
          this.logger.log(`Bulk email sent to ${emails[index]}. MessageId: ${status.MessageId}`);
        } else {
          this.logger.warn(`Failed to send bulk email to ${emails[index]}: ${status.Status}`);
        }
      });
    } catch (error) {
      this.logger.error("Failed to send bulk email:", error);
      throw error;
    }
  }

  private getPasswordResetTemplate(fullname: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${fullname},</p>
            <p>You requested a password reset for your Loan Management System account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 Loan Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeTemplate(fullname: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Loan Management System!</h1>
          </div>
          <div class="content">
            <p>Hello ${fullname},</p>
            <p>Your account has been successfully created in our Loan Management System.</p>
            <p>You can now log in to access all the features available to your role.</p>
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>© 2024 Loan Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getLoanStatusTemplate(clientName: string, loanId: string, status: string, message: string): string {
    const statusColors = {
      approved: "#28a745",
      disbursed: "#007bff",
      rejected: "#dc3545",
      completed: "#6f42c1",
    };

    const color = statusColors[status.toLowerCase()] || "#007bff";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Loan Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${color}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .status-badge { display: inline-block; padding: 8px 16px; background-color: ${color}; color: white; border-radius: 20px; font-weight: bold; text-transform: uppercase; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Loan Status Update</h1>
          </div>
          <div class="content">
            <p>Hello ${clientName},</p>
            <p>Your loan application status has been updated.</p>
            <p><strong>Loan ID:</strong> ${loanId}</p>
            <p><strong>New Status:</strong> <span class="status-badge">${status}</span></p>
            <p>${message}</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>© 2024 Loan Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPaymentReminderTemplate(clientName: string, loanId: string, dueAmount: number, dueDate: Date): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ffc107; color: #212529; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .payment-details { background-color: white; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Reminder</h1>
          </div>
          <div class="content">
            <p>Hello ${clientName},</p>
            <p>This is a friendly reminder that your loan payment is due soon.</p>
            <div class="payment-details">
              <p><strong>Loan ID:</strong> ${loanId}</p>
              <p><strong>Due Amount:</strong> $${dueAmount.toFixed(2)}</p>
              <p><strong>Due Date:</strong> ${dueDate.toDateString()}</p>
            </div>
            <p>Please make your payment on time to avoid any late fees or penalties.</p>
            <p>If you have already made this payment, please disregard this reminder.</p>
          </div>
          <div class="footer">
            <p>© 2024 Loan Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPaymentConfirmationTemplate(
    clientName: string,
    loanId: string,
    paymentAmount: number,
    paymentDate: Date,
    remainingBalance: number,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .payment-details { background-color: white; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmation</h1>
          </div>
          <div class="content">
            <p>Hello ${clientName},</p>
            <p>We have successfully received your payment. Thank you!</p>
            <div class="payment-details">
              <p><strong>Loan ID:</strong> ${loanId}</p>
              <p><strong>Payment Amount:</strong> $${paymentAmount.toFixed(2)}</p>
              <p><strong>Payment Date:</strong> ${paymentDate.toDateString()}</p>
              <p><strong>Remaining Balance:</strong> $${remainingBalance.toFixed(2)}</p>
            </div>
            ${
              remainingBalance > 0
                ? "<p>Your next payment will be due according to your payment schedule.</p>"
                : "<p><strong>Congratulations!</strong> Your loan has been fully paid off.</p>"
            }
          </div>
          <div class="footer">
            <p>© 2024 Loan Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
