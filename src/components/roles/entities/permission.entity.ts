import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from "typeorm"
import { Role } from "./role.entity"

@Entity("permissions")
export class Permission {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: 'varchar', unique: true })
  name: string

  @Column({ type: 'varchar' })
  description: string

  @Column({ type: 'varchar' })
  resource: string

  @Column({ type: 'varchar' })
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
