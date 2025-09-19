import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { Loan } from "./loan.entity"
import { User } from "../../users/entities/user.entity"
import { LoanStatus } from "../../../common/enums/loan.enum"

@Entity("loan_phases")
export class LoanPhase {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: LoanStatus,
  })
  phase: LoanStatus

  @Column({ type: 'text' })
  notes: string

  @Column({ type: 'json', nullable: true })
  data: any

  @ManyToOne(
    () => Loan,
    (loan) => loan.phases,
  )
  @JoinColumn({ name: "loanId" })
  loan: Loan

  @Column({ type: 'uuid' })
  loanId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "processedById" })
  processedBy: User

  @Column({ type: 'uuid' })
  processedById: string

  @CreateDateColumn()
  createdAt: Date
}
