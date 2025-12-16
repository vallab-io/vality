package io.vality.util

/**
 * S3 버킷 내 파일 경로를 생성하는 유틸리티 객체
 * 
 * S3 버킷 구조:
 * vality-resources/
 * ├── users/              # 프로필 이미지
 * │   └── {userId}/
 * │       └── {timestamp}-{filename}
 * └── issues/          # 이슈 이미지
 *     └── {issueId}/
 *         └── {timestamp}-{filename}
 */
object S3Paths {
    const val USERS = "users"
    const val ISSUES = "issues"
    
    /**
     * 프로필 이미지 경로 생성
     * 
     * @param userId 사용자 ID
     * @param filename 파일명 (타임스탬프 포함, 예: "1234567890-image.jpg")
     * @return S3 Key (예: "users/user123/1234567890-image.jpg")
     */
    fun userPath(userId: String, filename: String): String {
        return "$USERS/$userId/$filename"
    }
    
    /**
     * 이슈 이미지 경로 생성
     * 
     * @param issueId 이슈 ID
     * @param filename 파일명 (타임스탬프 포함, 예: "1234567890-image.jpg")
     * @return S3 Key (예: "issues/issue456/1234567890-image.jpg")
     */
    fun issuePath(issueId: String, filename: String): String {
        return "$ISSUES/$issueId/$filename"
    }
}

