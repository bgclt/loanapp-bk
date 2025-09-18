import { Injectable } from "@nestjs/common";
import { Repository, Between } from "typeorm";
import { Loan } from "../loans/entities/loan.entity";
import { Payment } from "../loans/entities/payment.entity";
import { User } from "../users/entities/user.entity";
import { ActivityLog } from "../app-logs/entities/activity-log.entity";
import { LoanStatus } from "../../common/enums/loan.enum";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Loan)
    private loansRepository: Repository<Loan>,

    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,

    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(ActivityLog)
    private activityLogsRepository: Repository<ActivityLog>,
  ) {}

  async getDashboardStats(): Promise<any> {
    const totalLoans = await this.loansRepository.count();
    const activeLoans = await this.loansRepository.count({ where: { status: LoanStatus.ACTIVE } });
    const completedLoans = await this.loansRepository.count({ where: { status: LoanStatus.COMPLETED } });
    const pendingApproval = await this.loansRepository.count({ where: { status: LoanStatus.CAPTURING } });

    const totalUsers = await this.usersRepository.count();
    const activeUsers = await this.usersRepository.count({ where: { isActive: true } });

    const totalDisbursed = await this.loansRepository
      .createQueryBuilder("loan")
      .select("SUM(loan.approvedAmount)", "total")
      .where("loan.status IN (:...statuses)", { statuses: [LoanStatus.ACTIVE, LoanStatus.COMPLETED] })
      .getRawOne();

    const totalCollected = await this.paymentsRepository
      .createQueryBuilder("payment")
      .select("SUM(payment.amount)", "total")
      .getRawOne();

    const outstandingBalance = await this.loansRepository
      .createQueryBuilder("loan")
      .select("SUM(loan.remainingBalance)", "total")
      .where("loan.status = :status", { status: LoanStatus.ACTIVE })
      .getRawOne();

    return {
      loans: {
        total: totalLoans,
        active: activeLoans,
        completed: completedLoans,
        pendingApproval,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      financial: {
        totalDisbursed: Number.parseFloat(totalDisbursed.total) || 0,
        totalCollected: Number.parseFloat(totalCollected.total) || 0,
        outstandingBalance: Number.parseFloat(outstandingBalance.total) || 0,
      },
    };
  }

  async getLoansByStatus(): Promise<any> {
    const statusCounts = await this.loansRepository
      .createQueryBuilder("loan")
      .select("loan.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("loan.status")
      .getRawMany();

    return statusCounts.map(item => ({
      status: item.status,
      count: Number.parseInt(item.count),
    }));
  }

  async getMonthlyLoanTrends(months = 12): Promise<any> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const monthlyData = await this.loansRepository
      .createQueryBuilder("loan")
      .select("DATE_TRUNC('month', loan.createdAt)", "month")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(loan.requestedAmount)", "totalRequested")
      .addSelect("SUM(loan.approvedAmount)", "totalApproved")
      .where("loan.createdAt >= :startDate", { startDate })
      .groupBy("DATE_TRUNC('month', loan.createdAt)")
      .orderBy("month", "ASC")
      .getRawMany();

    return monthlyData.map(item => ({
      month: item.month,
      count: Number.parseInt(item.count),
      totalRequested: Number.parseFloat(item.totalRequested) || 0,
      totalApproved: Number.parseFloat(item.totalApproved) || 0,
    }));
  }

  async getPaymentTrends(months = 12): Promise<any> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const monthlyPayments = await this.paymentsRepository
      .createQueryBuilder("payment")
      .select("DATE_TRUNC('month', payment.paymentDate)", "month")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(payment.amount)", "totalAmount")
      .where("payment.paymentDate >= :startDate", { startDate })
      .groupBy("DATE_TRUNC('month', payment.paymentDate)")
      .orderBy("month", "ASC")
      .getRawMany();

    return monthlyPayments.map(item => ({
      month: item.month,
      count: Number.parseInt(item.count),
      totalAmount: Number.parseFloat(item.totalAmount) || 0,
    }));
  }

  async getTopPerformers(): Promise<any> {
    const topLoanOfficers = await this.loansRepository
      .createQueryBuilder("loan")
      .leftJoin("loan.createdBy", "user")
      .select("user.fullname", "name")
      .addSelect("COUNT(*)", "loanCount")
      .addSelect("SUM(loan.approvedAmount)", "totalAmount")
      .groupBy("user.id")
      .orderBy("loanCount", "DESC")
      .limit(10)
      .getRawMany();

    return topLoanOfficers.map(item => ({
      name: item.name,
      loanCount: Number.parseInt(item.loanCount),
      totalAmount: Number.parseFloat(item.totalAmount) || 0,
    }));
  }

  async getDefaulterReport(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const defaulters = await this.loansRepository
      .createQueryBuilder("loan")
      .select([
        "loan.id",
        "loan.clientFullname",
        "loan.clientContact",
        "loan.approvedAmount",
        "loan.remainingBalance",
        "loan.nextPaymentDate",
      ])
      .where("loan.status = :status", { status: LoanStatus.ACTIVE })
      .andWhere("loan.nextPaymentDate < :today", { today })
      .orderBy("loan.nextPaymentDate", "ASC")
      .getMany();

    const summary = {
      totalDefaulters: defaulters.length,
      totalOutstanding: defaulters.reduce((sum, loan) => sum + loan.remainingBalance, 0),
    };

    return {
      summary,
      defaulters,
    };
  }

  async getCollectionReport(startDate: Date, endDate: Date): Promise<any> {
    const payments = await this.paymentsRepository.find({
      where: {
        paymentDate: Between(startDate, endDate),
      },
      relations: ["loan", "receivedBy"],
      order: { paymentDate: "DESC" },
    });

    const summary = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
      averagePayment:
        payments.length > 0 ? payments.reduce((sum, payment) => sum + payment.amount, 0) / payments.length : 0,
    };

    return {
      summary,
      payments: payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        loanId: payment.loan.id,
        clientName: payment.loan.clientFullname,
        receivedBy: payment.receivedBy.fullname,
      })),
    };
  }

  async exportReport(reportType: string, format = "json"): Promise<any> {
    // This is a placeholder for export functionality
    // In a real implementation, you would generate CSV, PDF, or Excel files
    let data: any;

    switch (reportType) {
      case "dashboard":
        data = await this.getDashboardStats();
        break;
      case "defaulters":
        data = await this.getDefaulterReport();
        break;
      case "loan-trends":
        data = await this.getMonthlyLoanTrends();
        break;
      case "payment-trends":
        data = await this.getPaymentTrends();
        break;
      default:
        throw new Error("Invalid report type");
    }

    return {
      reportType,
      format,
      generatedAt: new Date(),
      data,
    };
  }
}
