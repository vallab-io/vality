import axios from "axios";
import type { ApiResponse } from "./types";

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// 공개 API 클라이언트 (인증 불필요)
const publicApiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/public`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 공개 사용자 프로필
export interface PublicUserProfile {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  imageUrl: string | null;
}

// 공개 뉴스레터
export interface PublicNewsletter {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  subscriberCount: number;
}

// 공개 이슈 (목록용 - Preview 정보)
export interface PublicIssue {
  id: string;
  slug: string;
  title: string | null;
  excerpt: string | null; // Short 버전 (excerpt)
  publishedAt: string;
  newsletterId: string;
  newsletterSlug: string;
  newsletterName: string;
  ownerUsername: string | null;
  ownerName: string | null;
  ownerImageUrl: string | null;
}

// 공개 이슈 상세 (모든 정보 포함)
export interface PublicIssueDetail {
  // Issue 정보
  id: string;
  slug: string;
  title: string | null;
  content: string; // 전체 content
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  
  // Newsletter 정보
  newsletterId: string;
  newsletterSlug: string;
  newsletterName: string;
  newsletterDescription: string | null;
  newsletterSenderName: string | null;
  
  // Owner (User) 정보
  ownerId: string;
  ownerUsername: string | null;
  ownerName: string | null;
  ownerBio: string | null;
  ownerImageUrl: string | null;
}

// 공개 사용자 프로필 조회
export async function getPublicUserProfile(
  username: string
): Promise<PublicUserProfile> {
  const response = await publicApiClient.get<ApiResponse<PublicUserProfile>>(
    `/users/${username}`
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to get user profile");
  }
  return response.data.data;
}

// 공개 뉴스레터 목록 조회
export async function getPublicNewsletters(
  username: string
): Promise<PublicNewsletter[]> {
  const response = await publicApiClient.get<ApiResponse<PublicNewsletter[]>>(
    `/users/${username}/newsletters`
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to get newsletters");
  }
  return response.data.data;
}

// 공개 뉴스레터 조회
export async function getPublicNewsletter(
  username: string,
  newsletterSlug: string
): Promise<PublicNewsletter> {
  const response = await publicApiClient.get<ApiResponse<PublicNewsletter>>(
    `/users/${username}/newsletters/${newsletterSlug}`
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to get newsletter");
  }
  return response.data.data;
}

// 공개 이슈 목록 조회
export async function getPublicIssues(
  username: string,
  newsletterSlug?: string,
  limit: number = 20,
  offset: number = 0
): Promise<PublicIssue[]> {
  const url = newsletterSlug
    ? `/users/${username}/newsletters/${newsletterSlug}/issues`
    : `/users/${username}/issues`;
  const response = await publicApiClient.get<ApiResponse<PublicIssue[]>>(url, {
    params: { limit, offset },
  });
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to get issues");
  }
  return response.data.data;
}

// 공개 뉴스레터의 이슈 목록 조회 (별칭)
export async function getPublicNewsletterIssues(
  username: string,
  newsletterSlug: string,
  limit: number = 20,
  offset: number = 0
): Promise<PublicIssue[]> {
  return getPublicIssues(username, newsletterSlug, limit, offset);
}

// 공개 사용자 이슈 목록 조회 (별칭)
export async function getPublicUserIssues(
  username: string,
  options?: { limit?: number; offset?: number }
): Promise<PublicIssue[]> {
  return getPublicIssues(
    username,
    undefined,
    options?.limit ?? 20,
    options?.offset ?? 0
  );
}

// 공개 사용자 뉴스레터 목록 조회 (별칭)
export async function getPublicUserNewsletters(
  username: string
): Promise<PublicNewsletter[]> {
  return getPublicNewsletters(username);
}

// 공개 이슈 상세 조회
export async function getPublicIssueDetail(
  username: string,
  newsletterSlug: string,
  issueSlug: string
): Promise<PublicIssueDetail> {
  const response = await publicApiClient.get<ApiResponse<PublicIssueDetail>>(
    `/users/${username}/newsletters/${newsletterSlug}/issues/${issueSlug}`
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to get issue");
  }
  return response.data.data;
}

// 모든 사용자의 공개 이슈 목록 조회
export async function getAllPublicIssues(
  limit: number = 20,
  offset: number = 0
): Promise<PublicIssue[]> {
  const response = await publicApiClient.get<ApiResponse<PublicIssue[]>>("/issues", {
    params: { limit, offset },
  });
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to get all issues");
  }
  return response.data.data;
}
