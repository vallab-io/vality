import { apiClient } from "./client";
import type { ApiResponse } from "./types";

// Newsletter 타입 정의
export interface Newsletter {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  senderName: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

// 뉴스레터 생성 요청
export interface CreateNewsletterRequest {
  name: string;
  slug: string;
  description?: string;
  senderName?: string;
}

// 뉴스레터 생성
export async function createNewsletter(
  data: CreateNewsletterRequest
): Promise<Newsletter> {
  const response = await apiClient.post<ApiResponse<Newsletter>>(
    "/newsletters",
    data,
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to create newsletter");
  }
  return response.data.data;
}

// 내 뉴스레터 목록 조회
export async function getMyNewsletters(): Promise<Newsletter[]> {
  const response = await apiClient.get<ApiResponse<Newsletter[]>>(
    "/newsletters"
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to get newsletters");
  }
  return response.data.data;
}

