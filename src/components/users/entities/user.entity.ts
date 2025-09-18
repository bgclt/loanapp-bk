import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { Exclude } from "class-transformer";
import { Role } from "../../roles/entities/role.entity";
import { Loan } from "../../loans/entities/loan.entity";
import { ActivityLog } from "../../app-logs/entities/activity-log.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  fullname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  companyAddress: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  emailVerifiedAt: Date;

  @Column({ nullable: true })
  resetPasswordToken: string | null;

  @Column({ nullable: true })
  resetPasswordExpires: Date | null;

  @ManyToMany(() => Role, role => role.users)
  @JoinTable({
    name: "user_roles",
    joinColumn: { name: "userId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "roleId", referencedColumnName: "id" },
  })
  roles: Role[];

  @OneToMany(() => Loan, loan => loan.createdBy)
  createdLoans: Loan[];

  @OneToMany(() => Loan, loan => loan.approvedBy)
  approvedLoans: Loan[];

  @OneToMany(() => Loan, loan => loan.disbursedBy)
  disbursedLoans: Loan[];

  @OneToMany(() => ActivityLog, log => log.user)
  activityLogs: ActivityLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
