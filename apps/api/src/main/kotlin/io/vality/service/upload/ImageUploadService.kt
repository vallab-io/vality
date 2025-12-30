package io.vality.service.upload

import io.vality.util.S3Paths
import org.slf4j.LoggerFactory
import java.util.Locale

/**
 * 이미지 업로드 서비스
 * 
 * Presigned URL 생성 및 파일명 생성 로직을 담당합니다.
 */
class ImageUploadService(
    private val s3Service: S3Service,
    private val imageUrlService: ImageUrlService,
) {
    private val logger = LoggerFactory.getLogger(ImageUploadService::class.java)

    // 허용된 이미지 MIME 타입
    private val allowedContentTypes = setOf(
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp"
    )

    // 최대 파일 크기 (5MB)
    private val maxFileSize = 5 * 1024 * 1024 // 5MB

    /**
     * 프로필 이미지용 Presigned URL 생성
     * 
     * @param userId 사용자 ID
     * @param filename 원본 파일명
     * @param contentType 파일 MIME 타입
     * @param fileSize 파일 크기 (바이트)
     * @return Presigned URL과 파일명 (DB에 저장할 파일명)
     */
    suspend fun generateUserAvatarPresignedUrl(
        userId: String,
        filename: String,
        contentType: String,
        fileSize: Long,
    ): PresignedUrlResult {
        // 파일 검증
        validateImageFile(contentType, fileSize)

        // 파일명 생성 (타임스탬프 + 원본 파일명)
        val sanitizedFilename = sanitizeFilename(filename)
        val timestamp = System.currentTimeMillis()
        val finalFilename = "$timestamp-$sanitizedFilename"
        val key = S3Paths.userPath(userId, finalFilename)

        // Presigned URL 생성
        val presignedUrl = s3Service.generatePresignedUrl(
            key = key,
            contentType = contentType,
            expiresIn = 3600 // 1시간
        )

        // Full URL 생성 (DB에 저장할 URL)
        val fullUrl = imageUrlService.getImageUrl(key) ?: throw ImageUploadException("Failed to generate image URL")

        logger.info("Generated presigned URL for user avatar: userId=$userId, filename=$finalFilename, fullUrl=$fullUrl")

        return PresignedUrlResult(
            presignedUrl = presignedUrl,
            filename = finalFilename,
            key = key,
            fullUrl = fullUrl, // DB에 저장할 full URL
        )
    }

    /**
     * 이슈 이미지용 Presigned URL 생성
     * 
     * @param issueId 이슈 ID
     * @param filename 원본 파일명
     * @param contentType 파일 MIME 타입
     * @param fileSize 파일 크기 (바이트)
     * @return Presigned URL과 파일명 (DB에 저장할 파일명)
     */
    suspend fun generateIssueImagePresignedUrl(
        issueId: String,
        filename: String,
        contentType: String,
        fileSize: Long,
    ): PresignedUrlResult {
        // 파일 검증
        validateImageFile(contentType, fileSize)

        // 파일명 생성 (타임스탬프 + 원본 파일명)
        val sanitizedFilename = sanitizeFilename(filename)
        val timestamp = System.currentTimeMillis()
        val finalFilename = "$timestamp-$sanitizedFilename"
        val key = S3Paths.issuePath(issueId, finalFilename)

        // Presigned URL 생성
        val presignedUrl = s3Service.generatePresignedUrl(
            key = key,
            contentType = contentType,
            expiresIn = 3600 // 1시간
        )

        // Full URL 생성 (DB에 저장할 URL)
        val fullUrl = imageUrlService.getImageUrl(key) ?: throw ImageUploadException("Failed to generate image URL")

        logger.info("Generated presigned URL for issue image: issueId=$issueId, filename=$finalFilename, fullUrl=$fullUrl")

        return PresignedUrlResult(
            presignedUrl = presignedUrl,
            filename = finalFilename,
            key = key,
            fullUrl = fullUrl, // DB에 저장할 full URL
        )
    }

    /**
     * 이슈 이미지 업로드 (서버에서 직접 처리)
     * 
     * @param issueId 이슈 ID
     * @param filename 원본 파일명
     * @param content 파일 내용 (ByteArray)
     * @param contentType 파일 MIME 타입
     * @return S3 Key (경로)
     */
    suspend fun uploadIssueImage(
        issueId: String,
        filename: String,
        content: ByteArray,
        contentType: String,
    ): String {
        // 파일 검증
        validateImageFile(contentType, content.size.toLong())

        // 파일명 생성 (타임스탬프 + 원본 파일명)
        val sanitizedFilename = sanitizeFilename(filename)
        val timestamp = System.currentTimeMillis()
        val finalFilename = "$timestamp-$sanitizedFilename"
        val key = S3Paths.issuePath(issueId, finalFilename)

        // S3에 업로드
        s3Service.putObject(
            key = key,
            content = content,
            contentType = contentType,
        )

        logger.info("Uploaded issue image: issueId=$issueId, filename=$finalFilename, key=$key")

        return key
    }

    /**
     * 이미지 파일 검증
     */
    private fun validateImageFile(contentType: String, fileSize: Long) {
        // Content-Type 검증
        val normalizedContentType = contentType.lowercase(Locale.getDefault())
        if (!allowedContentTypes.any { normalizedContentType.contains(it) }) {
            throw ImageUploadException("허용되지 않은 이미지 형식입니다. (JPEG, PNG, GIF, WebP만 가능)")
        }

        // 파일 크기 검증
        if (fileSize > maxFileSize) {
            throw ImageUploadException("파일 크기는 2MB 이하여야 합니다.")
        }

        if (fileSize <= 0) {
            throw ImageUploadException("파일 크기가 유효하지 않습니다.")
        }
    }

    /**
     * 파일명 정리 (특수문자 제거, 길이 제한)
     */
    private fun sanitizeFilename(filename: String): String {
        // 확장자 추출
        val extension = filename.substringAfterLast('.', "").lowercase(Locale.getDefault())
        val nameWithoutExt = filename.substringBeforeLast('.')

        // 파일명 정리 (특수문자 제거, 공백을 언더스코어로)
        val sanitized = nameWithoutExt
            .replace(Regex("[^a-zA-Z0-9가-힣._-]"), "_")
            .take(50) // 최대 50자

        return if (extension.isNotEmpty()) {
            "$sanitized.$extension"
        } else {
            sanitized
        }
    }
}

/**
 * Presigned URL 생성 결과
 */
data class PresignedUrlResult(
    val presignedUrl: String,
    val filename: String,
    val key: String, // S3 Key (전체 경로)
    val fullUrl: String, // DB에 저장할 full URL
)

/**
 * 이미지 업로드 예외
 */
class ImageUploadException(message: String) : Exception(message)

