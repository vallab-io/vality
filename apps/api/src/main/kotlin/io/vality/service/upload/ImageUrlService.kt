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
    
    /**
     * 절대 URL에서 S3 Key 추출
     * 
     * @param url 절대 URL (예: "https://cdn.vality.io/users/user123/1234567890-avatar.jpg")
     * @return S3 Key (예: "users/user123/1234567890-avatar.jpg") 또는 null
     */
    fun extractKeyFromUrl(url: String?): String? {
        if (url == null || url.isBlank()) {
            return null
        }
        
        // URL이 아닌 경우 (이미 key인 경우) 그대로 반환
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return url
        }
        
        // Base URL을 제거하여 key 추출
        val normalizedBaseUrl = baseUrl.removeSuffix("/")
        if (url.startsWith(normalizedBaseUrl)) {
            return url.removePrefix("$normalizedBaseUrl/")
        }
        
        // S3 URL 형식에서 key 추출 (예: https://bucket.s3.region.amazonaws.com/key)
        // 또는 https://s3.region.amazonaws.com/bucket/key
        return try {
            val urlObj = java.net.URL(url)
            val path = urlObj.path.removePrefix("/")
            
            // 버킷이 호스트에 포함된 경우 (bucket.s3.region.amazonaws.com)
            if (urlObj.host.contains(".s3.")) {
                path
            } else {
                // 버킷이 경로에 포함된 경우 (s3.region.amazonaws.com/bucket/key)
                // 첫 번째 경로 세그먼트(버킷)를 제거
                val parts = path.split("/", limit = 2)
                if (parts.size > 1) parts[1] else path
            }
        } catch (e: Exception) {
            // URL 파싱 실패 시 파일명만 추출
            url.substringAfterLast("/")
        }
    }
}

