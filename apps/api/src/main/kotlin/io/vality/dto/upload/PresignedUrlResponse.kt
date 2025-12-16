package io.vality.dto.upload

import kotlinx.serialization.Serializable

@Serializable
data class PresignedUrlResponse(
    val presignedUrl: String,
    val filename: String, // DB에 저장할 파일명
    val key: String, // S3 Key (전체 경로)
)

