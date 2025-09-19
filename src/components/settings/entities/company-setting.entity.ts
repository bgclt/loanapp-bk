import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("company_settings")
export class CompanySetting {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'varchar', unique: true })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: "string" })
  type: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
