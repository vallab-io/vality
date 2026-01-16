import { apiClient } from "./client";
import type { ApiResponse } from "./types";

// 문의하기 요청
export interface ContactRequest {
  name: string;
  email: string;
  message: string;
  privacyAgreed: boolean;
}

// 문의하기 응답
export interface ContactResponse {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

// 문의하기 API 호출
export async function createContact(
  data: ContactRequest
): Promise<ContactResponse> {
  const response = await apiClient.post<ApiResponse<ContactResponse>>(
    "/contact",
    data
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to submit contact");
  }
  return response.data.data;
}
