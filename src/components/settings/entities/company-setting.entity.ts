import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("company_settings")
export class CompanySetting {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  key: string;

  @Column("text")
  value: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: "string" })
  type: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
