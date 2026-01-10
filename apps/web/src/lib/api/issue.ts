import { apiClient } from "./client";
import type { ApiResponse } from "./types";

// Issue 타입 정의
export interface Issue {
  id: string;
  title: string | null; // nullable
  slug: string | null; // nullable, PUBLISHED 상태일 때만 필수
  content: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  scheduledAt: string | null;
  newsletterId: string;
  createdAt: string;
  updatedAt: string;
}

// 이슈 생성 요청 (더 이상 사용하지 않음 - API는 body를 받지 않음)
// @deprecated API는 이제 body를 받지 않고 빈 이슈만 생성합니다
export interface CreateIssueRequest {
  title?: string | null; // nullable
  slug?: string | null; // nullable, 자동 생성 가능
  content?: string; // 기본값: 빈 문자열
  excerpt?: string | null;
  coverImageUrl?: string | null;
  status?: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  scheduledAt?: string | null;
}

// 이슈 수정 요청
export interface UpdateIssueRequest {
  title?: string | null;
  slug?: string;
  content?: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  status?: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  scheduledAt?: string | null;
}

// 이슈 생성 (빈 DRAFT 이슈만 생성, body 없음)
export async function createIssue(
  newsletterId: string
): Promise<Issue> {
  const response = await apiClient.post<ApiResponse<Issue>>(
    `/newsletters/${newsletterId}/issues`
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to create issue");
  }
  return response.data.data;
}

// 이슈 목록 조회
export async function getIssues(
  newsletterId: string
): Promise<Issue[]> {
  const response = await apiClient.get<ApiResponse<Issue[]>>(
    `/newsletters/${newsletterId}/issues`
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to get issues");
  }
  return response.data.data;
}

// 개별 이슈 조회
export async function getIssueById(
  newsletterId: string,
  issueId: string
): Promise<Issue> {
  const response = await apiClient.get<ApiResponse<Issue>>(
    `/newsletters/${newsletterId}/issues/${issueId}`
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to get issue");
  }
  return response.data.data;
}

// 이슈 수정
export async function updateIssue(
  newsletterId: string,
  issueId: string,
  data: UpdateIssueRequest
): Promise<Issue> {
  const response = await apiClient.patch<ApiResponse<Issue>>(
    `/newsletters/${newsletterId}/issues/${issueId}`,
    data
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to update issue");
  }
  return response.data.data;
}

// 이슈 삭제
export async function deleteIssue(
  newsletterId: string,
  issueId: string
): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/newsletters/${newsletterId}/issues/${issueId}`
  );
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to delete issue");
  }
}

