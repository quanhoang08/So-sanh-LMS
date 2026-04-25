import { AuditAction } from './audit-log.enum';

export class CreateAuditLogDto {
  userId!: number;
  email!: string;
  action!: AuditAction;
  ipAddress!: string;
  userAgent!: string;
  details!: Record<string, any>;
}