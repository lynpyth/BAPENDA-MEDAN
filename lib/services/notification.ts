import prisma from "@/lib/prisma";

export class NotificationService {
  /**
   * Create an in-app notification and send a mock email
   */
  static async notify({
    userId,
    title,
    message,
    type = "INFO",
    category = "SYSTEM",
  }: {
    userId: string;
    title: string;
    message: string;
    type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
    category?: "SYSTEM" | "DASHBOARD";
  }) {
    // 1. In-app notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        category,
      },
      include: { user: { select: { email: true, name: true } } },
    });

    // 2. Mock Email (Console log)
    console.info(`[MOCK_EMAIL] Sent to: ${notification.user.email}`);
    console.info(`Subject: ${title}`);
    console.info(`Body: ${message}`);

    return notification;
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(id: string, userId: string) {
    return await prisma.notification.update({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(userId: string, limit = 10) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
