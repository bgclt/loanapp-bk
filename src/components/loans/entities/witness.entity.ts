import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Loan } from "./loan.entity"
import { MaritalStatus } from "../../../common/enums/loan.enum"

@Entity("witnesses")
export class Witness {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: 'varchar' })
  fullname: string

  @Column({ type: 'varchar' })
  contact: string

  @Column({
    type: "enum",
    enum: MaritalStatus,
  })
  maritalStatus: MaritalStatus

  @Column({ type: 'varchar', nullable: true })
  email: string

  @Column({ type: 'varchar' })
  occupation: string

  @Column({ type: 'text' })
  residenceAddress: string

  @Column({ type: 'varchar', nullable: true })
  residenceGps: string

  @ManyToOne(() => Loan)
  @JoinColumn({ name: "loanId" })
  loan: Loan

  @Column({ type: 'uuid' })
  loanId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
