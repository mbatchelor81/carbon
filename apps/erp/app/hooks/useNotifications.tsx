import { useCarbon } from "@carbon/auth";
import type { NotificationEvent } from "@carbon/notifications";
import { useRealtimeChannel } from "@carbon/react";
import { useCallback, useEffect, useState } from "react";

export type Notification = {
  id: string;
  companyId: string;
  userId: string;
  event: NotificationEvent;
  recordId: string;
  description: string;
  from: string | null;
  documentType: string | null;
  read: boolean;
  seen: boolean;
  createdAt: string;
};

export function useNotifications({
  userId,
  companyId
}: {
  userId: string;
  companyId: string;
}) {
  const { carbon } = useCarbon();
  const [isLoading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    const { data, error } = await carbon
      .from("notification")
      .select("*")
      .eq("userId", userId)
      .eq("companyId", companyId)
      .order("createdAt", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Failed to fetch notifications", error);
    } else {
      setNotifications(data as Notification[]);
    }
    setLoading(false);
  }, [carbon, userId, companyId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useRealtimeChannel({
    topic: `notifications:${userId}:${companyId}`,
    setup: (channel) =>
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notification",
          filter: `userId=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          if (newNotification.companyId !== companyId) return;
          if (payload.eventType === "INSERT") {
            setNotifications((prev) => [newNotification, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === newNotification.id ? newNotification : n
              )
            );
          }
        }
      ),
    dependencies: [userId, companyId]
  });

  const markAllMessagesAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    carbon
      .from("notification")
      .update({ read: true })
      .eq("userId", userId)
      .eq("companyId", companyId)
      .eq("read", false)
      .then(({ error }) => {
        if (error) console.error("Failed to mark all as read", error);
      });
  }, [carbon, userId, companyId]);

  const markMessageAsRead = useCallback(
    (notificationId: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      carbon
        .from("notification")
        .update({ read: true })
        .eq("id", notificationId)
        .then(({ error }) => {
          if (error) console.error("Failed to mark as read", error);
        });
    },
    [carbon]
  );

  const markAllMessagesAsSeen = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
    carbon
      .from("notification")
      .update({ seen: true })
      .eq("userId", userId)
      .eq("companyId", companyId)
      .eq("seen", false)
      .then(({ error }) => {
        if (error) console.error("Failed to mark all as seen", error);
      });
  }, [carbon, userId, companyId]);

  return {
    isLoading,
    markAllMessagesAsRead,
    markMessageAsRead,
    markAllMessagesAsSeen,
    hasUnseenNotifications: notifications.some(
      (notification) => !notification.seen
    ),
    notifications
  };
}
