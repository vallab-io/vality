package io.vality.service.upload

import io.vality.domain.User
import io.vality.util.S3Paths

/**
 * 이미지 URL 생성 서비스
 * 
 * DB에는 파일명만 저장하고, API 응답에서는 완성된 URL을 생성합니다.
 */
class ImageUrlService(
    private val baseUrl: String // 환경 변수에서 주입 (RESOURCE_BASE_URL)
) {
    /**
     * 파일명과 userId를 받아서 완성된 이미지 URL 생성
     * 
     * @param filename 파일명 (예: "1234567890-avatar.jpg")
     * @param userId 사용자 ID
     * @return 완성된 URL (예: "https://cdn.vality.io/users/user123/1234567890-avatar.jpg")
     */
    fun getUserImageUrl(filename: String?, userId: String): String? {
        if (filename == null || filename.isBlank()) {
            return null
        }
        
        // 이미 절대 URL인 경우 그대로 반환 (마이그레이션 전 호환성)
        if (filename.startsWith("http://") || filename.startsWith("https://")) {
            return filename
        }
        
        // 파일명만 있는 경우 경로 생성
        val key = S3Paths.userPath(userId, filename)
        return getImageUrl(key)
    }
    
    /**
     * S3 Key (상대 경로)를 절대 URL로 변환
     * 
     * @param key S3 Key (예: "users/user123/1234567890-avatar.jpg")
     * @return 절대 URL (예: "https://cdn.vality.io/users/user123/1234567890-avatar.jpg")
     */
    fun getImageUrl(key: String?): String? {
        if (key == null || key.isBlank()) {
            return null
        }
        
        // 이미 절대 URL인 경우 그대로 반환 (마이그레이션 전 호환성)
        if (key.startsWith("http://") || key.startsWith("https://")) {
            return key
        }
        
        // 상대 경로인 경우 Base URL과 조합
        val normalizedBaseUrl = baseUrl.removeSuffix("/")
        val normalizedKey = key.removePrefix("/")
        return "$normalizedBaseUrl/$normalizedKey"
    }
    
    /**
     * 사용자 이미지 URL 반환
     * 
     * @param user User 객체
     * @return 완성된 이미지 URL 또는 null
     */
    fun getImageUrl(user: User): String? {
        return getUserImageUrl(user.imageUrl, user.id)
    }
}

