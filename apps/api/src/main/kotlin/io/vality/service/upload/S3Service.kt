package io.vality.service.upload

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.slf4j.LoggerFactory
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest
import software.amazon.awssdk.services.s3.model.HeadObjectRequest
import software.amazon.awssdk.services.s3.model.NoSuchKeyException
import software.amazon.awssdk.services.s3.model.PutObjectRequest

/**
 * AWS S3 서비스
 *
 * 서버에서 이미지를 다운로드하여 S3에 직접 업로드할 때 사용합니다.
 * (Google OAuth 프로필 이미지 등)
 */
class S3Service(
    private val s3Client: S3Client,
    private val bucketName: String,
    private val region: String,
) {
    private val logger = LoggerFactory.getLogger(S3Service::class.java)

    /**
     * 파일 삭제
     *
     * @param key S3 Key (경로)
     */
    suspend fun deleteFile(key: String): Unit = withContext(Dispatchers.IO) {
        try {
            val deleteRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build()

            s3Client.deleteObject(deleteRequest)
            logger.info("Deleted file from S3: $key")
        } catch (e: Exception) {
            logger.error("Failed to delete file from S3: $key", e)
            throw S3ServiceException("Failed to delete file", e)
        }
    }

    /**
     * 파일 존재 확인
     *
     * @param key S3 Key (경로)
     * @return 파일이 존재하면 true, 없으면 false
     */
    suspend fun fileExists(key: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val headRequest = HeadObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build()

            s3Client.headObject(headRequest)
            true
        } catch (e: NoSuchKeyException) {
            false
        } catch (e: Exception) {
            logger.error("Failed to check file existence: $key", e)
            false
        }
    }

    /**
     * 파일 업로드 (서버에서 직접 업로드)
     *
     * Google OAuth 프로필 이미지 등을 서버에서 다운로드하여 S3에 업로드할 때 사용합니다.
     * Presigned URL이 필요 없습니다.
     *
     * @param key S3 Key (경로)
     * @param content 파일 내용 (ByteArray)
     * @param contentType 파일 MIME 타입
     */
    suspend fun putObject(
        key: String,
        content: ByteArray,
        contentType: String,
    ): Unit = withContext(Dispatchers.IO) {
        try {
            val putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .build()

            val requestBody = RequestBody.fromBytes(content)
            s3Client.putObject(putObjectRequest, requestBody)
            logger.info("Uploaded file to S3: $key (${content.size} bytes)")
        } catch (e: Exception) {
            logger.error("Failed to upload file to S3: $key", e)
            throw S3ServiceException("Failed to upload file", e)
        }
    }
}

/**
 * S3 서비스 예외
 */
class S3ServiceException(message: String, cause: Throwable? = null) : Exception(message, cause)
