import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Loan } from "./loan.entity";

@Entity("business_locations")
export class BusinessLocation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  gpsAddress: string;

  @Column({ type: 'varchar' })
  region: string;

  @ManyToOne(() => Loan)
  @JoinColumn({ name: "loanId" })
  loan: Loan;

  @Column({ type: 'uuid' })
  loanId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
