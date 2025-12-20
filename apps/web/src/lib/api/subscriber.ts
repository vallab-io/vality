import { apiClient } from "./client";
import type { ApiResponse } from "./types";

// Subscriber 타입 정의
export interface Subscriber {
  id: string;
  email: string;
  status: "PENDING" | "ACTIVE" | "UNSUBSCRIBED";
  subscribedAt: string;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
  newsletterId: string;
}

// 구독 확인 API 전용 응답
export interface SubscribeConfirmResponse {
  id: string;
  email: string;
  status: "ACTIVE";
  newsletterId: string;
  username: string; // 뉴스레터 소유자 username
  newsletterSlug: string; // 뉴스레터 slug
}

// 구독자 생성 요청
export interface CreateSubscriberRequest {
  email: string;
}

// 구독자 목록 조회
export async function getSubscribers(
  newsletterId: string
): Promise<Subscriber[]> {
  const response = await apiClient.get<ApiResponse<Subscriber[]>>(
    `/newsletters/${newsletterId}/subscribers`
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to get subscribers");
  }
  return response.data.data;
}

// 구독자 추가
export async function createSubscriber(
  newsletterId: string,
  data: CreateSubscriberRequest
): Promise<Subscriber> {
  const response = await apiClient.post<ApiResponse<Subscriber>>(
    `/newsletters/${newsletterId}/subscribers`,
    data
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to create subscriber");
  }
  return response.data.data;
}

// 구독자 삭제
export async function deleteSubscriber(
  newsletterId: string,
  subscriberId: string
): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/newsletters/${newsletterId}/subscribers/${subscriberId}`
  );
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to delete subscriber");
  }
}

// Public API for subscribe (no JWT required)
export interface PublicSubscribeRequest {
  email: string;
}

export async function publicSubscribe(
  newsletterId: string,
  data: PublicSubscribeRequest
): Promise<Subscriber> {
  const response = await apiClient.post<ApiResponse<Subscriber>>(
    `/public/newsletter/${newsletterId}/subscribe`,
    data
  );
  if (!response.data.data) {
    const error = new Error(response.data.message || "Failed to subscribe");
    (error as any).response = response;
    throw error;
  }
  return response.data.data;
}

export async function confirmSubscribe(
  token: string
): Promise<SubscribeConfirmResponse> {
  const response = await apiClient.get<ApiResponse<SubscribeConfirmResponse>>(
    `/public/subscribe/confirm?token=${token}`
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to confirm subscribe");
  }
  return response.data.data;
}

