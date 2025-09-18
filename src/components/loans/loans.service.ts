import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { Repository, Between } from "typeorm";
import { Loan } from "./entities/loan.entity";
import { LoanPhase } from "./entities/loan-phase.entity";
import { Witness } from "./entities/witness.entity";
import { BusinessLocation } from "./entities/business-location.entity";
import { Residence } from "./entities/residence.entity";
import { ActivityLog } from "../app-logs/entities/activity-log.entity";
import { CreateLoanDto } from "./dto/create-loan.dto";
import { UpdateLoanCapturingDto } from "./dto/update-loan-capturing.dto";
import { ApproveLoanDto } from "./dto/approve-loan.dto";
import { DisburseLoanDto } from "./dto/disburse-loan.dto";
import { LoanStatus, PaymentSchedule } from "../../common/enums/loan.enum";
import { User } from "../users/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private loansRepository: Repository<Loan>,

    @InjectRepository(LoanPhase)
    private loanPhasesRepository: Repository<LoanPhase>,

    @InjectRepository(Witness)
    private witnessesRepository: Repository<Witness>,

    @InjectRepository(BusinessLocation)
    private businessLocationsRepository: Repository<BusinessLocation>,

    @InjectRepository(Residence)
    private residencesRepository: Repository<Residence>,

    @InjectRepository(ActivityLog)
    private activityLogsRepository: Repository<ActivityLog>,
  ) {}

  // Phase 1: Registration
  async create(createLoanDto: CreateLoanDto, user: User): Promise<Loan> {
    const loan = this.loansRepository.create({
      ...createLoanDto,
      createdById: user.id,
      status: LoanStatus.REGISTRATION,
    });

    const savedLoan = await this.loansRepository.save(loan);

    // Create phase record
    await this.createPhaseRecord(savedLoan.id, LoanStatus.REGISTRATION, "Loan registered", createLoanDto, user.id);

    // Log activity
    await this.logActivity("CREATE", "loan", savedLoan.id, null, savedLoan, user.id);

    return this.findOne(savedLoan.id);
  }

  // Phase 2: Capturing
  async updateCapturing(id: string, updateLoanCapturingDto: UpdateLoanCapturingDto, user: User): Promise<Loan> {
    const loan = await this.findOne(id);

    if (loan.status !== LoanStatus.REGISTRATION && loan.status !== LoanStatus.CAPTURING) {
      throw new BadRequestException("Loan is not in registration or capturing phase");
    }

    const oldData = { ...loan };

    // Update loan with capturing data
    await this.loansRepository.update(id, {
      ...updateLoanCapturingDto,
      status: LoanStatus.CAPTURING,
    });

    // Save witness information
    if (updateLoanCapturingDto.witness) {
      await this.witnessesRepository.save({
        ...updateLoanCapturingDto.witness,
        loanId: id,
      });
    }

    // Save business location
    if (updateLoanCapturingDto.businessLocation) {
      await this.businessLocationsRepository.save({
        ...updateLoanCapturingDto.businessLocation,
        loanId: id,
      });
    }

    // Save residence
    if (updateLoanCapturingDto.residence) {
      await this.residencesRepository.save({
        ...updateLoanCapturingDto.residence,
        loanId: id,
      });
    }

    // Create phase record
    await this.createPhaseRecord(id, LoanStatus.CAPTURING, "Loan capturing completed", updateLoanCapturingDto, user.id);

    // Log activity
    const updatedLoan = await this.findOne(id);
    await this.logActivity("UPDATE", "loan", id, oldData, updatedLoan, user.id);

    return updatedLoan;
  }

  // Phase 3: Approval
  async approve(id: string, approveLoanDto: ApproveLoanDto, user: User): Promise<Loan> {
    const loan = await this.findOne(id);

    if (loan.status !== LoanStatus.CAPTURING) {
      throw new BadRequestException("Loan is not in capturing phase");
    }

    const oldData = { ...loan };

    // Calculate next payment date based on disbursement date and schedule
    const disbursementDate = new Date();
    const nextPaymentDate = new Date(disbursementDate);

    if (approveLoanDto.paymentSchedule === PaymentSchedule.WEEKLY) {
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
    } else {
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    }

    // Update loan with approval data
    await this.loansRepository.update(id, {
      approvedAmount: approveLoanDto.approvedAmount,
      loanDuration: approveLoanDto.loanDuration,
      paymentSchedule: approveLoanDto.paymentSchedule,
      approvalDate: new Date(),
      approvalNotes: approveLoanDto.approvalNotes,
      approvedById: user.id,
      status: LoanStatus.APPROVAL,
      remainingBalance: approveLoanDto.approvedAmount,
    });

    // Create phase record
    await this.createPhaseRecord(id, LoanStatus.APPROVAL, "Loan approved", approveLoanDto, user.id);

    // Log activity
    const updatedLoan = await this.findOne(id);
    await this.logActivity("APPROVE", "loan", id, oldData, updatedLoan, user.id);

    return updatedLoan;
  }

  // Phase 4: Disbursement
  async disburse(id: string, disburseLoanDto: DisburseLoanDto, user: User): Promise<Loan> {
    const loan = await this.findOne(id);

    if (loan.status !== LoanStatus.APPROVAL) {
      throw new BadRequestException("Loan is not in approval phase");
    }

    const oldData = { ...loan };

    // Calculate next payment date based on disbursement date and schedule
    const disbursementDate = new Date();
    const nextPaymentDate = new Date(disbursementDate);

    if (loan.paymentSchedule === PaymentSchedule.WEEKLY) {
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
    } else {
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    }

    // Update loan with disbursement data
    await this.loansRepository.update(id, {
      disbursementDate,
      disbursementNotes: disburseLoanDto.disbursementNotes,
      disbursedById: user.id,
      status: LoanStatus.ACTIVE,
      nextPaymentDate,
    });

    // Create phase record
    await this.createPhaseRecord(id, LoanStatus.DISBURSEMENT, "Loan disbursed", disburseLoanDto, user.id);

    // Log activity
    const updatedLoan = await this.findOne(id);
    await this.logActivity("DISBURSE", "loan", id, oldData, updatedLoan, user.id);

    return updatedLoan;
  }

  async findAll(status?: LoanStatus): Promise<Loan[]> {
    const query = this.loansRepository
      .createQueryBuilder("loan")
      .leftJoinAndSelect("loan.createdBy", "createdBy")
      .leftJoinAndSelect("loan.approvedBy", "approvedBy")
      .leftJoinAndSelect("loan.disbursedBy", "disbursedBy")
      .orderBy("loan.createdAt", "DESC");

    if (status) {
      query.where("loan.status = :status", { status });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Loan> {
    const loan = await this.loansRepository.findOne({
      where: { id },
      relations: [
        "createdBy",
        "approvedBy",
        "disbursedBy",
        "phases",
        "phases.processedBy",
        "payments",
        "payments.receivedBy",
      ],
    });

    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    return loan;
  }

  async findByStatus(status: LoanStatus): Promise<Loan[]> {
    return this.loansRepository.find({
      where: { status },
      relations: ["createdBy", "approvedBy", "disbursedBy"],
      order: { createdAt: "DESC" },
    });
  }

  async findDuePayments(date?: Date): Promise<Loan[]> {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    return this.loansRepository.find({
      where: {
        status: LoanStatus.ACTIVE,
        nextPaymentDate: Between(startOfDay, endOfDay),
      },
      relations: ["createdBy"],
      order: { nextPaymentDate: "ASC" },
    });
  }

  async findDefaulters(): Promise<Loan[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.loansRepository
      .find({
        where: {
          status: LoanStatus.ACTIVE,
        },
        relations: ["createdBy"],
      })
      .then(loans => loans.filter(loan => loan.nextPaymentDate && loan.nextPaymentDate < today));
  }

  async getLoanStatement(id: string): Promise<any> {
    const loan = await this.findOne(id);

    return {
      loan: {
        id: loan.id,
        clientFullname: loan.clientFullname,
        clientContact: loan.clientContact,
        requestedAmount: loan.requestedAmount,
        approvedAmount: loan.approvedAmount,
        loanDuration: loan.loanDuration,
        paymentSchedule: loan.paymentSchedule,
        disbursementDate: loan.disbursementDate,
        totalPaid: loan.totalPaid,
        remainingBalance: loan.remainingBalance,
        status: loan.status,
      },
      payments: loan.payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        notes: payment.notes,
        receiptNumber: payment.receiptNumber,
        receivedBy: payment.receivedBy.fullname,
      })),
      phases: loan.phases.map(phase => ({
        phase: phase.phase,
        notes: phase.notes,
        processedBy: phase.processedBy.fullname,
        createdAt: phase.createdAt,
      })),
    };
  }

  async remove(id: string, user: User): Promise<void> {
    const loan = await this.findOne(id);

    // Only allow deletion of loans in registration phase
    if (loan.status !== LoanStatus.REGISTRATION) {
      throw new BadRequestException("Can only delete loans in registration phase");
    }

    // Log activity before deletion
    await this.logActivity("DELETE", "loan", id, loan, null, user.id);

    const result = await this.loansRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }
  }

  private async createPhaseRecord(
    loanId: string,
    phase: LoanStatus,
    notes: string,
    data: any,
    processedById: string,
  ): Promise<void> {
    const phaseRecord = this.loanPhasesRepository.create({
      loanId,
      phase,
      notes,
      data,
      processedById,
    });

    await this.loanPhasesRepository.save(phaseRecord);
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
