/// <reference types="node" />
import type { Database } from "@carbon/database";
import type { SupabaseClient } from "@supabase/supabase-js";

type ApprovalDocumentType = Database["public"]["Enums"]["approvalDocumentType"];

export enum NotificationWorkflow {
  Approval = "approval",
  Assignment = "assignment",
  DigitalQuoteResponse = "digital-quote-response",
  Expiration = "expiration",
  GaugeCalibration = "gauge-calibration",
  JobCompleted = "job-completed",
  Message = "message",
  SuggestionResponse = "suggestion-response",
  SupplierQuoteResponse = "supplier-quote-response"
}

export enum NotificationEvent {
  ApprovalApproved = "approval-approved",
  ApprovalRejected = "approval-rejected",
  ApprovalRequested = "approval-requested",
  DigitalQuoteResponse = "digital-quote-response",
  GaugeCalibrationExpired = "gauge-calibration-expired",
  JobAssignment = "job-assignment",
  JobCompleted = "job-completed",
  JobOperationAssignment = "job-operation-assignment",
  JobOperationMessage = "job-operation-message",
  MaintenanceDispatchAssignment = "maintenance-dispatch-assignment",
  MaintenanceDispatchCreated = "maintenance-dispatch-created",
  NonConformanceAssignment = "issue-assignment",
  ProcedureAssignment = "procedure-assignment",
  PurchaseInvoiceAssignment = "purchase-invoice-assignment",
  PurchaseOrderAssignment = "purchase-order-assignment",
  QuoteAssignment = "quote-assignment",
  QuoteExpired = "quote-expired",
  RiskAssignment = "risk-assignment",
  SalesOrderAssignment = "sales-order-assignment",
  SalesRfqAssignment = "sales-rfq-assignment",
  SalesRfqReady = "sales-rfq-ready",
  StockTransferAssignment = "stock-transfer-assignment",
  SuggestionResponse = "suggestion-response",
  SupplierQuoteAssignment = "supplier-quote-assignment",
  SupplierQuoteResponse = "supplier-quote-response",
  TrainingAssignment = "training-assignment"
}

export enum NotificationType {
  ApprovalInApp = "approval-in-app",
  AssignmentInApp = "assignment-in-app",
  DigitalQuoteResponseInApp = "digital-quote-response-in-app",
  JobCompletedInApp = "job-completed-in-app",
  ExpirationInApp = "expiration-in-app",
  MessageInApp = "message-in-app",
  SuggestionResponseInApp = "suggestion-response-in-app",
  SupplierQuoteResponseInApp = "supplier-quote-response-in-app"
}

export type NotificationPayload = {
  recordId: string;
  description: string;
  event: NotificationEvent;
  from?: string;
  documentType?: ApprovalDocumentType;
};

export type NotificationInsert = {
  companyId: string;
  userId: string;
  event: NotificationEvent;
  recordId: string;
  description: string;
  from?: string;
  documentType?: string;
};

export async function insertNotification(
  client: SupabaseClient,
  notification: NotificationInsert
) {
  const { error } = await client.from("notification").insert(notification);
  if (error) {
    console.error("Failed to insert notification", error);
    throw error;
  }
}

export async function insertNotificationBulk(
  client: SupabaseClient,
  notifications: NotificationInsert[]
) {
  if (notifications.length === 0) return;
  const { error } = await client.from("notification").insert(notifications);
  if (error) {
    console.error("Failed to insert bulk notifications", error);
    throw error;
  }
}

export async function markNotificationRead(
  client: SupabaseClient,
  notificationId: string
) {
  const { error } = await client
    .from("notification")
    .update({ read: true })
    .eq("id", notificationId);
  if (error) {
    console.error("Failed to mark notification as read", error);
    throw error;
  }
}

export async function markAllNotificationsRead(
  client: SupabaseClient,
  userId: string,
  companyId: string
) {
  const { error } = await client
    .from("notification")
    .update({ read: true })
    .eq("userId", userId)
    .eq("companyId", companyId)
    .eq("read", false);
  if (error) {
    console.error("Failed to mark all notifications as read", error);
    throw error;
  }
}

export async function markAllNotificationsSeen(
  client: SupabaseClient,
  userId: string,
  companyId: string
) {
  const { error } = await client
    .from("notification")
    .update({ seen: true })
    .eq("userId", userId)
    .eq("companyId", companyId)
    .eq("seen", false);
  if (error) {
    console.error("Failed to mark all notifications as seen", error);
    throw error;
  }
}
