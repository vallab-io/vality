import { apiClient } from "./client";

// API 응답 타입
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Presigned URL 요청
export interface PresignedUrlRequest {
  type: "user" | "issue";
  filename: string;
  contentType: string;
  fileSize: number;
  issueId?: string; // issue 타입일 때만 필요
}

// Presigned URL 응답
export interface PresignedUrlResponse {
  presignedUrl: string;
  filename: string; // DB에 저장할 파일명
  key: string; // S3 Key (전체 경로)
}

/**
 * Presigned URL 요청
 */
export async function requestPresignedUrl(
  data: PresignedUrlRequest
): Promise<PresignedUrlResponse> {
  const response = await apiClient.post<ApiResponse<PresignedUrlResponse>>(
    "/upload/presigned-url",
    data
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to get presigned URL");
  }
  return response.data.data;
}

/**
 * S3에 직접 이미지 업로드
 */
export async function uploadImageToS3(
  presignedUrl: string,
  file: File
): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.statusText}`);
  }
}

