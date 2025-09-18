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

@Entity("business_locations")
export class BusinessLocation {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column()
  address: string

  @Column({ nullable: true })
  gpsAddress: string

  @Column()
  region: string

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
