import { apiClient } from "./client";
import type { ApiResponse } from "./types";

// 공개 사용자 프로필
export interface PublicUserProfile {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  imageUrl: string | null;
}

// 공개 뉴스레터 정보
export interface PublicNewsletter {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  subscriberCount: number;
}

// 공개 이슈 정보
export interface PublicIssue {
  id: string;
  slug: string;
  title: string | null;
  excerpt: string | null;
  publishedAt: string;
  newsletterId: string;
  newsletterSlug: string;
  newsletterName: string;
}

// 공개 사용자 프로필 조회
export async function getPublicUserProfile(
  username: string
): Promise<PublicUserProfile> {
  const response = await apiClient.get<ApiResponse<PublicUserProfile>>(
    `/public/users/${username}`
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to get user profile");
  }
  return response.data.data;
}

// 사용자의 뉴스레터 목록 조회
export async function getPublicUserNewsletters(
  username: string
): Promise<PublicNewsletter[]> {
  const response = await apiClient.get<ApiResponse<PublicNewsletter[]>>(
    `/public/users/${username}/newsletters`
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to get newsletters");
  }
  return response.data.data;
}

// 사용자의 발행된 이슈 목록 조회
export async function getPublicUserIssues(
  username: string,
  options?: { limit?: number; offset?: number }
): Promise<PublicIssue[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.offset) params.append("offset", options.offset.toString());

  const queryString = params.toString();
  const url = `/public/users/${username}/issues${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<ApiResponse<PublicIssue[]>>(url);
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to get issues");
  }
  return response.data.data;
}

// 특정 뉴스레터 조회 (username + slug)
export async function getPublicNewsletter(
  username: string,
  newsletterSlug: string
): Promise<PublicNewsletter> {
  const response = await apiClient.get<ApiResponse<PublicNewsletter>>(
    `/public/users/${username}/newsletters/${newsletterSlug}`
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to get newsletter");
  }
  return response.data.data;
}

// 특정 뉴스레터의 발행된 이슈 목록 조회
export async function getPublicNewsletterIssues(
  username: string,
  newsletterSlug: string,
  options?: { limit?: number; offset?: number }
): Promise<PublicIssue[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.offset) params.append("offset", options.offset.toString());

  const queryString = params.toString();
  const url = `/public/users/${username}/newsletters/${newsletterSlug}/issues${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<ApiResponse<PublicIssue[]>>(url);
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to get newsletter issues");
  }
  return response.data.data;
}

