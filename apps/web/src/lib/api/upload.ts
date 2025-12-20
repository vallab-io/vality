import { apiClient } from "./client";
import type { ApiResponse } from "./types";

export interface PresignedUrlRequest {
  type: "user" | "issue";
  filename: string;
  contentType: string;
  fileSize: number;
  issueId?: string; // issue 타입일 때만 필요
}

export interface PresignedUrlResponse {
  presignedUrl: string;
  filename: string;
  key: string; // S3 Key (전체 경로)
}

/**
 * Presigned URL 생성
 */
export async function generatePresignedUrl(
  data: PresignedUrlRequest
): Promise<PresignedUrlResponse> {
  const response = await apiClient.post<ApiResponse<PresignedUrlResponse>>(
    "/upload/presigned-url",
    data
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to generate presigned URL");
  }
  return response.data.data;
}

/**
 * S3에 이미지 업로드
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

export interface ImageUploadResponse {
  url: string; // 완성된 이미지 URL (CDN URL)
  key: string; // S3 Key (경로)
}

/**
 * 이슈 이미지 업로드 (서버를 통한 직접 업로드)
 */
export async function uploadIssueImage(
  issueId: string,
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  // FormData를 보낼 때는 Content-Type을 설정하지 않아야 브라우저가 자동으로 boundary를 추가합니다
  // axios 인터셉터에서 자동으로 처리됨
  const response = await apiClient.post<ApiResponse<ImageUploadResponse>>(
    `/upload/issues/${issueId}/images`,
    formData
  );

  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to upload image");
  }

  return response.data.data.url;
}
