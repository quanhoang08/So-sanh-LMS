// src/audit_logs/entities/audit-log.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { AuditAction } from './audit-log.enum';


/**
 * AuditLog Entity
 * Tracks all user actions for security & compliance
 *
 * Design Notes:
 * - userId + email: Soft reference (no FK) - can audit deleted users by email
 * - target: Hard reference (FK with CASCADE) - target user being audited
 * - action: PostgreSQL ENUM for type safety
 */
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  // ==================== SOFT REFERENCE ====================
  // No FK constraint - allows auditing even if user is deleted
  @Column({ name: 'user_id', type: 'varchar', length: 255, nullable: true })
  userId!: number;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email!: string;

  // ==================== ACTION ====================
  @Column({ type: 'enum', enum: AuditAction })
  action!: AuditAction;

  // ==================== REQUEST DETAILS ====================
  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress!: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string;

  // ==================== AUDIT DATA ====================
  @Column({ type: 'jsonb', nullable: true })
  details!: Record<string, any>;

  // ==================== TIMESTAMP ====================
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  // ==================== HARD REFERENCE ====================
  // FK to target user (person being audited) - CASCADE delete
  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'target_user_id' })
  target!: User;
}