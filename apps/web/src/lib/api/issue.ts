import { apiClient } from "./client";
import type { ApiResponse } from "./types";

// Issue 타입 정의
export interface Issue {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  scheduledAt: string | null;
  newsletterId: string;
  createdAt: string;
  updatedAt: string;
}

// 이슈 생성 요청
export interface CreateIssueRequest {
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  status?: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  scheduledAt?: string | null;
}

// 이슈 생성
export async function createIssue(
  newsletterId: string,
  data: CreateIssueRequest
): Promise<Issue> {
  const response = await apiClient.post<ApiResponse<Issue>>(
    `/newsletters/${newsletterId}/issues`,
    data
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

