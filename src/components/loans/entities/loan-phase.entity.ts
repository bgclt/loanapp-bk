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

  @Column()
  notes: string

  @Column("json", { nullable: true })
  data: any

  @ManyToOne(
    () => Loan,
    (loan) => loan.phases,
  )
  @JoinColumn({ name: "loanId" })
  loan: Loan

  @Column()
  loanId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "processedById" })
  processedBy: User

  @Column()
  processedById: string

  @CreateDateColumn()
  createdAt: Date
}
