import { apiClient } from "./client";
import type { ApiResponse } from "./types";

export type PlanType = "FREE" | "STARTER" | "PRO";

export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE";

export interface Subscription {
  id: string;
  userId: string;
  lemonSqueezySubscriptionId?: string | null;
  lemonSqueezyOrderId?: string | null;
  planType: PlanType;
  status: SubscriptionStatus;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 내 구독 정보 조회
 * GET /api/subscriptions/me
 */
export async function getMySubscription(): Promise<Subscription | null> {
  const response = await apiClient.get<ApiResponse<Subscription>>("/subscriptions/me");
  return response.data.data ?? null;
}

/**
 * 사용 가능한 플랜 목록 조회
 * GET /api/subscriptions/plans
 */
export async function getAvailablePlans(): Promise<PlanType[]> {
  const response = await apiClient.get<ApiResponse<PlanType[]>>("/subscriptions/plans");
  return response.data.data ?? [];
}

