import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from "typeorm"
import { Role } from "./role.entity"

@Entity("permissions")
export class Permission {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  name: string

  @Column()
  description: string

  @Column()
  resource: string

  @Column()
  action: string

  @ManyToMany(
    () => Role,
    (role) => role.permissions,
  )
  roles: Role[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
