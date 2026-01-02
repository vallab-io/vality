import { apiClient } from "./client";
import type { ApiResponse } from "./types";

// Newsletter 타입 정의
export interface Newsletter {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

// 뉴스레터 생성 요청
export interface CreateNewsletterRequest {
  name: string;
  slug: string;
  description?: string;
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

// 뉴스레터 조회
export async function getNewsletterById(
  newsletterId: string
): Promise<Newsletter> {
  const response = await apiClient.get<ApiResponse<Newsletter>>(
    `/newsletters/${newsletterId}`
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to get newsletter");
  }
  return response.data.data;
}

// 뉴스레터 업데이트 요청
export interface UpdateNewsletterRequest {
  name: string;
  slug: string;
  description?: string;
  timezone: string;
}

// 뉴스레터 업데이트
export async function updateNewsletter(
  newsletterId: string,
  data: UpdateNewsletterRequest
): Promise<Newsletter> {
  const response = await apiClient.patch<ApiResponse<Newsletter>>(
    `/newsletters/${newsletterId}`,
    data
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to update newsletter");
  }
  return response.data.data;
}

