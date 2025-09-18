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

  @Column()
  fullname: string

  @Column()
  contact: string

  @Column({
    type: "enum",
    enum: MaritalStatus,
  })
  maritalStatus: MaritalStatus

  @Column({ nullable: true })
  email: string

  @Column()
  occupation: string

  @Column()
  residenceAddress: string

  @Column({ nullable: true })
  residenceGps: string

  @ManyToOne(() => Loan)
  @JoinColumn({ name: "loanId" })
  loan: Loan

  @Column()
  loanId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
