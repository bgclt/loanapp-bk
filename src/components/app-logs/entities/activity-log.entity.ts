import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("activity_logs")
export class ActivityLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  action: string;

  @Column({ type: "varchar" })
  resource: string;

  @Column({ type: "uuid", nullable: true })
  resourceId: string | null;

  @Column({ type: "jsonb", nullable: true })
  oldData: Record<string, any> | null;

  @Column({ type: "jsonb", nullable: true })
  newData: Record<string, any> | null;

  @Column({ type: "varchar", nullable: true })
  ipAddress: string | null;

  @Column({ type: "varchar", nullable: true })
  userAgent: string | null;

  @ManyToOne(() => User, user => user.activityLogs, { onDelete: "SET NULL" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "uuid", nullable: true })
  userId: string | null;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt: Date;
}
