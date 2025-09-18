import { Injectable } from "@nestjs/common";
import { Repository, Between } from "typeorm";
import { Loan } from "../loans/entities/loan.entity";
import { Payment } from "../loans/entities/payment.entity";
import { User } from "../users/entities/user.entity";
import { ActivityLog } from "../app-logs/entities/activity-log.entity";
import { LoanStatus } from "../../common/enums/loan.enum";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class DashboardService {
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

  async getOverviewStats(): Promise<any> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Loan statistics
    const totalLoans = await this.loansRepository.count();
    const activeLoans = await this.loansRepository.count({ where: { status: LoanStatus.ACTIVE } });
    const completedLoans = await this.loansRepository.count({ where: { status: LoanStatus.COMPLETED } });
    const pendingApproval = await this.loansRepository.count({
      where: [{ status: LoanStatus.CAPTURING }, { status: LoanStatus.APPROVAL }],
    });

    // Financial statistics
    const totalDisbursed = await this.loansRepository
      .createQueryBuilder("loan")
      .select("SUM(loan.approvedAmount)", "total")
      .where("loan.status IN (:...statuses)", {
        statuses: [LoanStatus.ACTIVE, LoanStatus.COMPLETED, LoanStatus.DISBURSEMENT],
      })
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

    // Monthly statistics
    const monthlyLoans = await this.loansRepository.count({
      where: { createdAt: Between(startOfMonth, today) },
    });

    const monthlyPayments = await this.paymentsRepository
      .createQueryBuilder("payment")
      .select("SUM(payment.amount)", "total")
      .where("payment.paymentDate BETWEEN :start AND :end", {
        start: startOfMonth,
        end: today,
      })
      .getRawOne();

    // Weekly statistics
    const weeklyLoans = await this.loansRepository.count({
      where: { createdAt: Between(startOfWeek, today) },
    });

    const weeklyPayments = await this.paymentsRepository
      .createQueryBuilder("payment")
      .select("SUM(payment.amount)", "total")
      .where("payment.paymentDate BETWEEN :start AND :end", {
        start: startOfWeek,
        end: today,
      })
      .getRawOne();

    // User statistics
    const totalUsers = await this.usersRepository.count();
    const activeUsers = await this.usersRepository.count({ where: { isActive: true } });

    return {
      loans: {
        total: totalLoans,
        active: activeLoans,
        completed: completedLoans,
        pendingApproval,
        monthly: monthlyLoans,
        weekly: weeklyLoans,
      },
      financial: {
        totalDisbursed: Number.parseFloat(totalDisbursed.total) || 0,
        totalCollected: Number.parseFloat(totalCollected.total) || 0,
        outstandingBalance: Number.parseFloat(outstandingBalance.total) || 0,
        monthlyCollection: Number.parseFloat(monthlyPayments.total) || 0,
        weeklyCollection: Number.parseFloat(weeklyPayments.total) || 0,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
      },
    };
  }

  async getRecentActivity(limit = 10): Promise<ActivityLog[]> {
    return this.activityLogsRepository.find({
      relations: ["user"],
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  async getUpcomingPayments(days = 7): Promise<Loan[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.loansRepository.find({
      where: {
        status: LoanStatus.ACTIVE,
        nextPaymentDate: Between(today, futureDate),
      },
      order: { nextPaymentDate: "ASC" },
      take: 10,
    });
  }

  async getOverduePayments(): Promise<Loan[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.loansRepository
      .createQueryBuilder("loan")
      .where("loan.status = :status", { status: LoanStatus.ACTIVE })
      .andWhere("loan.nextPaymentDate < :today", { today })
      .orderBy("loan.nextPaymentDate", "ASC")
      .take(10)
      .getMany();
  }

  async getLoanStatusDistribution(): Promise<any[]> {
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

  async getMonthlyTrends(months = 6): Promise<Array<{ month: string; loans: number; payments: number }>> {
    const trends: Array<{ month: string; loans: number; payments: number }> = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

      const loanCount = await this.loansRepository.count({
        where: { createdAt: Between(monthStart, monthEnd) },
      });

      const paymentSum = await this.paymentsRepository
        .createQueryBuilder("payment")
        .select("SUM(payment.amount)", "total")
        .where("payment.paymentDate BETWEEN :start AND :end", {
          start: monthStart,
          end: monthEnd,
        })
        .getRawOne();

      trends.push({
        month: monthStart.toISOString().substring(0, 7), // YYYY-MM format
        loans: loanCount,
        payments: Number.parseFloat(paymentSum.total) || 0,
      });
    }

    return trends;
  }

  async getTopPerformers(limit = 5): Promise<any[]> {
    const performers = await this.loansRepository
      .createQueryBuilder("loan")
      .leftJoin("loan.createdBy", "user")
      .select("user.fullname", "name")
      .addSelect("user.id", "userId")
      .addSelect("COUNT(*)", "loanCount")
      .addSelect("SUM(loan.approvedAmount)", "totalAmount")
      .where("loan.status != :status", { status: LoanStatus.REGISTRATION })
      .groupBy("user.id")
      .orderBy("loanCount", "DESC")
      .limit(limit)
      .getRawMany();

    return performers.map(item => ({
      userId: item.userId,
      name: item.name,
      loanCount: Number.parseInt(item.loanCount),
      totalAmount: Number.parseFloat(item.totalAmount) || 0,
    }));
  }

  async getSystemHealth(): Promise<any> {
    const totalLogs = await this.activityLogsRepository.count();
    const recentErrors = await this.activityLogsRepository.count({
      where: {
        action: "ERROR",
        createdAt: Between(
          new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          new Date(),
        ),
      },
    });

    const activeUsers = await this.usersRepository.count({ where: { isActive: true } });
    const totalUsers = await this.usersRepository.count();

    return {
      totalLogs,
      recentErrors,
      userActivity: {
        active: activeUsers,
        total: totalUsers,
        percentage: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
      },
      systemStatus: recentErrors < 10 ? "healthy" : "warning",
    };
  }
}
