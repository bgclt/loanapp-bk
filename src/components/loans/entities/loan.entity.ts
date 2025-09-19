import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { LoanPhase } from "./loan-phase.entity";
import { Payment } from "./payment.entity";
import { LoanStatus, PaymentSchedule, MaritalStatus, IdType } from "../../../common/enums/loan.enum";

@Entity("loans")
export class Loan {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Registration Phase (Phase 1)
  @Column({ type: 'varchar' })
  clientFullname: string;

  @Column({ type: 'varchar' })
  clientContact: string;

  @Column({ type: 'varchar', nullable: true })
  clientEmail: string;

  @Column({ type: 'varchar' })
  clientLocation: string;

  @Column("decimal", { precision: 10, scale: 2 })
  requestedAmount: number;

  @Column({ type: 'varchar' })
  clientBusiness: string;

  // Capturing Phase (Phase 2)
  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({
    type: "enum",
    enum: MaritalStatus,
    nullable: true,
  })
  maritalStatus: MaritalStatus;

  @Column({ type: 'text', nullable: true })
  clientProfile: string;

  @Column({ type: 'varchar', nullable: true })
  clientOccupation: string;

  @Column({
    type: "enum",
    enum: IdType,
    nullable: true,
  })
  idType: IdType;

  @Column({ type: 'varchar', nullable: true })
  idNumber: string;

  // Approval Phase (Phase 3)
  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  approvedAmount: number;

  @Column({ type: 'int', nullable: true })
  loanDuration: number; // in months

  @Column({
    type: "enum",
    enum: PaymentSchedule,
    nullable: true,
  })
  paymentSchedule: PaymentSchedule;

  @Column({ type: 'timestamp', nullable: true })
  approvalDate: Date;

  @Column({ type: 'text', nullable: true })
  approvalNotes: string;

  // Disbursement Phase (Phase 4)
  @Column({ type: 'timestamp', nullable: true })
  disbursementDate: Date;

  @Column({ type: 'text', nullable: true })
  disbursementNotes: string;

  @Column({
    type: "enum",
    enum: LoanStatus,
    default: LoanStatus.REGISTRATION,
  })
  status: LoanStatus;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  totalPaid: number;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  remainingBalance: number;

  @Column({ type: "timestamp", nullable: true })
  nextPaymentDate: Date;

  @ManyToOne(() => User, user => user.createdLoans)
  @JoinColumn({ name: "createdById" })
  createdBy: User;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, user => user.approvedLoans)
  @JoinColumn({ name: "approvedById" })
  approvedBy: User;

  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @ManyToOne(() => User, user => user.disbursedLoans)
  @JoinColumn({ name: "disbursedById" })
  disbursedBy: User;

  @Column({ type: 'uuid', nullable: true })
  disbursedById: string;

  @OneToMany(() => LoanPhase, phase => phase.loan)
  phases: LoanPhase[];

  @OneToMany(() => Payment, payment => payment.loan)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
