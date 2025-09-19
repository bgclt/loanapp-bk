import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Permission } from "./permission.entity"

@Entity("roles")
export class Role {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: 'varchar', unique: true })
  name: string

  @Column({ type: 'varchar' })
  description: string

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @ManyToMany(
    () => User,
    (user) => user.roles,
  )
  users: User[]

  @ManyToMany(
    () => Permission,
    (permission) => permission.roles,
  )
  @JoinTable({
    name: "role_permissions",
    joinColumn: { name: "roleId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "permissionId", referencedColumnName: "id" },
  })
  permissions: Permission[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
