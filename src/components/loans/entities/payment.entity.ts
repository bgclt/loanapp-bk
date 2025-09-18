import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { Loan } from "./loan.entity"
import { User } from "../../users/entities/user.entity"

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("decimal", { precision: 10, scale: 2 })
  amount: number

  @Column()
  paymentDate: Date

  @Column({ nullable: true })
  notes: string

  @Column({ nullable: true })
  receiptNumber: string

  @ManyToOne(
    () => Loan,
    (loan) => loan.payments,
  )
  @JoinColumn({ name: "loanId" })
  loan: Loan

  @Column()
  loanId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "receivedById" })
  receivedBy: User

  @Column()
  receivedById: string

  @CreateDateColumn()
  createdAt: Date
}
