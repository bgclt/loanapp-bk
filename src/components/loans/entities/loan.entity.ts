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
  @Column()
  clientFullname: string;

  @Column()
  clientContact: string;

  @Column({ nullable: true })
  clientEmail: string;

  @Column()
  clientLocation: string;

  @Column("decimal", { precision: 10, scale: 2 })
  requestedAmount: number;

  @Column()
  clientBusiness: string;

  // Capturing Phase (Phase 2)
  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({
    type: "enum",
    enum: MaritalStatus,
    nullable: true,
  })
  maritalStatus: MaritalStatus;

  @Column({ nullable: true })
  clientProfile: string;

  @Column({ nullable: true })
  clientOccupation: string;

  @Column({
    type: "enum",
    enum: IdType,
    nullable: true,
  })
  idType: IdType;

  @Column({ nullable: true })
  idNumber: string;

  // Approval Phase (Phase 3)
  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  approvedAmount: number;

  @Column({ nullable: true })
  loanDuration: number; // in months

  @Column({
    type: "enum",
    enum: PaymentSchedule,
    nullable: true,
  })
  paymentSchedule: PaymentSchedule;

  @Column({ nullable: true })
  approvalDate: Date;

  @Column({ nullable: true })
  approvalNotes: string;

  // Disbursement Phase (Phase 4)
  @Column({ nullable: true })
  disbursementDate: Date;

  @Column({ nullable: true })
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

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => User, user => user.approvedLoans)
  @JoinColumn({ name: "approvedById" })
  approvedBy: User;

  @Column({ nullable: true })
  approvedById: string;

  @ManyToOne(() => User, user => user.disbursedLoans)
  @JoinColumn({ name: "disbursedById" })
  disbursedBy: User;

  @Column({ nullable: true })
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
