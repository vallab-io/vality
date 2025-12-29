import { apiClient } from "./client";
import type { ApiResponse } from "./types";

// 대시보드 통계 타입
export interface DashboardStats {
  totalSubscribers: number;
  publishedIssues: number;
  draftIssues: number;
}

// 최근 이슈 타입
export interface RecentIssue {
  id: string;
  title: string | null;
  slug: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  newsletterId: string;
  newsletterSlug: string;
  newsletterName: string;
  ownerUsername: string;
  createdAt: string;
}

// 대시보드 통계 조회
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get<ApiResponse<DashboardStats>>(
    "/dashboard/stats"
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to get dashboard stats");
  }
  return response.data.data;
}

// 최근 이슈 목록 조회
export async function getRecentIssues(limit: number = 5): Promise<RecentIssue[]> {
  const response = await apiClient.get<ApiResponse<RecentIssue[]>>(
    `/dashboard/recent-issues?limit=${limit}`
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to get recent issues");
  }
  return response.data.data;
}

