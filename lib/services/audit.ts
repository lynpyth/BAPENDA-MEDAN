import prisma from "@/lib/prisma";

export class AuditService {
  /**
   * Log an action to the audit log
   */
  static async log({
    userId,
    action,
    table,
    recordId,
    oldValue,
    newValue,
  }: {
    userId: string;
    action: string;
    table: string;
    recordId: string;
    oldValue?: any;
    newValue?: any;
  }) {
    try {
      return await prisma.auditLog.create({
        data: {
          userId,
          action,
          table,
          recordId,
          oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : undefined,
          newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : undefined,
        },
      });
    } catch (error) {
      // We don't want audit log failures to crash the main operation
      console.error("[AUDIT_LOG_ERROR]", error);
    }
  }

  /**
   * Get audit logs with filters
   */
  static async getLogs({
    userId,
    table,
    action,
    recordId,
    startDate,
    endDate,
    limit = 50,
    offset = 0,
  }: {
    userId?: string;
    table?: string;
    action?: string;
    recordId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } = {}) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (table) where.table = table;
    if (action) where.action = action;
    if (recordId) where.recordId = recordId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }
}
