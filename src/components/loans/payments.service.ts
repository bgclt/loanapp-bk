import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { Repository, Between } from "typeorm";
import { Payment } from "./entities/payment.entity";
import { Loan } from "./entities/loan.entity";
import { ActivityLog } from "../app-logs/entities/activity-log.entity";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { LoanStatus, PaymentSchedule } from "../../common/enums/loan.enum";
import { User } from "../users/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,

    @InjectRepository(Loan)
    private loansRepository: Repository<Loan>,

    @InjectRepository(ActivityLog)
    private activityLogsRepository: Repository<ActivityLog>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, user: User): Promise<Payment> {
    const loan = await this.loansRepository.findOne({
      where: { id: createPaymentDto.loanId },
    });

    if (!loan) {
      throw new NotFoundException(`Loan with ID ${createPaymentDto.loanId} not found`);
    }

    if (loan.status !== LoanStatus.ACTIVE) {
      throw new BadRequestException("Can only add payments to active loans");
    }

    if (createPaymentDto.amount > loan.remainingBalance) {
      throw new BadRequestException("Payment amount cannot exceed remaining balance");
    }

    // Create payment record
    const payment = this.paymentsRepository.create({
      ...createPaymentDto,
      receivedById: user.id,
    });

    const savedPayment = await this.paymentsRepository.save(payment);

    // Update loan totals
    const newTotalPaid = loan.totalPaid + createPaymentDto.amount;
    const newRemainingBalance = loan.remainingBalance - createPaymentDto.amount;

    // Calculate next payment date
    let nextPaymentDate: Date | null = null;
    let status: LoanStatus = loan.status;

    if (newRemainingBalance > 0) {
      nextPaymentDate = new Date(createPaymentDto.paymentDate);
      if (loan.paymentSchedule === PaymentSchedule.WEEKLY) {
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
      } else {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }
    } else {
      // Loan is fully paid
      status = LoanStatus.COMPLETED;
    }

    await this.loansRepository.update(loan.id, {
      totalPaid: newTotalPaid,
      remainingBalance: newRemainingBalance,
      nextPaymentDate: nextPaymentDate ?? undefined, // ✅ fix
      status,
    });

    // Log activity
    await this.logActivity("CREATE", "payment", savedPayment.id, null, savedPayment, user.id);

    return this.findOne(savedPayment.id);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentsRepository.find({
      relations: ["loan", "receivedBy"],
      order: { createdAt: "DESC" },
    });
  }

  async findByLoan(loanId: string): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { loanId },
      relations: ["receivedBy"],
      order: { paymentDate: "DESC" },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Payment[]> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return this.paymentsRepository.find({
      where: {
        paymentDate: Between(start, end),
      },
      relations: ["loan", "receivedBy"],
      order: { paymentDate: "DESC" },
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ["loan", "receivedBy"],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto, user: User): Promise<Payment> {
    const payment = await this.findOne(id);
    const oldData = { ...payment };

    await this.paymentsRepository.update(id, updatePaymentDto);

    // Log activity
    const updatedPayment = await this.findOne(id);
    await this.logActivity("UPDATE", "payment", id, oldData, updatedPayment, user.id);

    return updatedPayment;
  }

  async remove(id: string, user: User): Promise<void> {
    const payment = await this.findOne(id);

    // Revert loan totals
    const loan = await this.loansRepository.findOne({
      where: { id: payment.loanId },
    });

    if (loan) {
      const newTotalPaid = loan.totalPaid - payment.amount;
      const newRemainingBalance = loan.remainingBalance + payment.amount;

      await this.loansRepository.update(loan.id, {
        totalPaid: newTotalPaid,
        remainingBalance: newRemainingBalance,
        status: LoanStatus.ACTIVE, // Revert to active if it was completed
      });
    }

    // Log activity before deletion
    await this.logActivity("DELETE", "payment", id, payment, null, user.id);

    const result = await this.paymentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
  }

  private async logActivity(
    action: string,
    resource: string,
    resourceId: string,
    oldData: any,
    newData: any,
    userId: string,
  ): Promise<void> {
    const log = this.activityLogsRepository.create({
      action,
      resource,
      resourceId,
      oldData,
      newData,
      userId,
    });

    await this.activityLogsRepository.save(log);
  }
}
