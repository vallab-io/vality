package io.vality.service.upload

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.get
import io.ktor.client.request.headers
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.serialization.kotlinx.json.json
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.slf4j.LoggerFactory
import io.vality.util.S3Paths
import java.net.URL

/**
 * 외부 이미지 다운로드 및 S3 업로드 서비스
 * 
 * Google OAuth 프로필 이미지 등을 외부 URL에서 다운로드하여 S3에 업로드합니다.
 */
class ExternalImageUploadService(
    private val s3Service: S3Service,
    private val httpClient: HttpClient = HttpClient(CIO) {
        install(ContentNegotiation) {
            json()
        }
    }
) {
    private val logger = LoggerFactory.getLogger(ExternalImageUploadService::class.java)
    
    /**
     * 외부 URL에서 이미지를 다운로드하여 S3에 업로드
     * 
     * @param externalUrl 외부 이미지 URL (예: Google 프로필 이미지 URL)
     * @param userId 사용자 ID
     * @return S3 Key (경로) 또는 null (실패 시)
     */
    suspend fun uploadFromExternalUrl(
        externalUrl: String,
        userId: String
    ): String? = withContext(Dispatchers.IO) {
        try {
            logger.info("Downloading image from external URL: $externalUrl")
            
            // 1. 외부 URL에서 이미지 다운로드
            val imageBytes = httpClient.get(externalUrl) {
                headers {
                    append(HttpHeaders.Accept, "image/*")
                    append(HttpHeaders.UserAgent, "Vality-Server/1.0")
                }
            }.body<ByteArray>()
            
            if (imageBytes.isEmpty()) {
                logger.warn("Downloaded image is empty: $externalUrl")
                return@withContext null
            }
            
            // 2. Content-Type 확인 (URL에서 추출하거나 기본값 사용)
            val contentType = detectContentType(imageBytes, externalUrl)
            val extension = getExtensionFromContentType(contentType, externalUrl)
            
            // 3. 원본 파일명 추출
            val originalFilename = extractFilenameFromUrl(externalUrl)
            val baseFilename = if (originalFilename.isNotEmpty()) {
                // 확장자 제거하고 파일명만 사용
                originalFilename.substringBeforeLast('.', originalFilename)
                    .take(50) // 파일명이 너무 길면 자르기
                    .replace(Regex("[^a-zA-Z0-9가-힣._-]"), "_") // 특수문자 제거
            } else {
                "avatar" // 파일명이 없으면 기본값
            }
            
            // 4. 파일명 생성 (타임스탬프 + 원본 파일명 + 확장자)
            val timestamp = System.currentTimeMillis()
            val filename = "$timestamp-$baseFilename.$extension"
            val key = S3Paths.userPath(userId, filename)
            
            // 5. S3에 업로드
            s3Service.putObject(key, imageBytes, contentType)
            
            logger.info("Successfully uploaded external image to S3: $externalUrl -> $key")
            // 파일명만 반환 (DB에 저장)
            filename
        } catch (e: Exception) {
            logger.error("Failed to upload external image: $externalUrl", e)
            null  // 실패 시 null 반환 (원본 URL 유지)
        }
    }
    
    /**
     * 이미지 Content-Type 감지
     */
    private fun detectContentType(imageBytes: ByteArray, url: String): String {
        if (imageBytes.isEmpty()) {
            return "image/jpeg" // 기본값
        }
        
        // Magic bytes로 이미지 타입 확인
        return when {
            // JPEG: FF D8
            imageBytes.size >= 2 && imageBytes[0] == 0xFF.toByte() && imageBytes[1] == 0xD8.toByte() -> "image/jpeg"
            
            // PNG: 89 50 4E 47 0D 0A 1A 0A
            imageBytes.size >= 8 && imageBytes[0] == 0x89.toByte() && 
                imageBytes[1] == 0x50.toByte() && imageBytes[2] == 0x4E.toByte() && 
                imageBytes[3] == 0x47.toByte() -> "image/png"
            
            // GIF: 47 49 46 38 39 61 (GIF89a) or 47 49 46 38 37 61 (GIF87a)
            imageBytes.size >= 6 && imageBytes[0] == 0x47.toByte() && 
                imageBytes[1] == 0x49.toByte() && imageBytes[2] == 0x46.toByte() && 
                imageBytes[3] == 0x38.toByte() -> "image/gif"
            
            // WebP: RIFF...WEBP
            imageBytes.size >= 12 && imageBytes[0] == 0x52.toByte() && 
                imageBytes[1] == 0x49.toByte() && imageBytes[2] == 0x46.toByte() && 
                imageBytes[3] == 0x46.toByte() && imageBytes[8] == 0x57.toByte() && 
                imageBytes[9] == 0x45.toByte() && imageBytes[10] == 0x42.toByte() && 
                imageBytes[11] == 0x50.toByte() -> "image/webp"
            
            else -> {
                // URL에서 확장자로 추정
                when {
                    url.contains(".jpg", ignoreCase = true) || url.contains(".jpeg", ignoreCase = true) -> "image/jpeg"
                    url.contains(".png", ignoreCase = true) -> "image/png"
                    url.contains(".gif", ignoreCase = true) -> "image/gif"
                    url.contains(".webp", ignoreCase = true) -> "image/webp"
                    else -> "image/jpeg" // 기본값
                }
            }
        }
    }
    
    /**
     * Content-Type에서 확장자 추출
     */
    private fun getExtensionFromContentType(contentType: String, url: String): String {
        return when {
            contentType.startsWith("image/jpeg") -> "jpg"
            contentType.startsWith("image/png") -> "png"
            contentType.startsWith("image/gif") -> "gif"
            contentType.startsWith("image/webp") -> "webp"
            else -> {
                // URL에서 확장자 추출 시도
                try {
                    val urlPath = URL(url).path
                    val extension = urlPath.substringAfterLast('.', "").lowercase()
                    if (extension in listOf("jpg", "jpeg", "png", "gif", "webp")) {
                        if (extension == "jpeg") "jpg" else extension
                    } else {
                        "jpg" // 기본값
                    }
                } catch (e: Exception) {
                    "jpg" // 기본값
                }
            }
        }
    }
    
    /**
     * URL에서 파일명 추출
     * 
     * @param url 외부 이미지 URL
     * @return 파일명 (확장자 포함) 또는 빈 문자열
     */
    private fun extractFilenameFromUrl(url: String): String {
        return try {
            val urlObj = URL(url)
            val path = urlObj.path
            
            // 쿼리 파라미터 제거 후 파일명 추출
            val filename = path.substringAfterLast('/')
            
            // 파일명이 있고 확장자가 있으면 반환
            if (filename.isNotEmpty() && filename.contains('.')) {
                filename
            } else {
                // 파일명이 없거나 확장자가 없으면 빈 문자열
                ""
            }
        } catch (e: Exception) {
            logger.debug("Failed to extract filename from URL: $url", e)
            ""
        }
    }
}

