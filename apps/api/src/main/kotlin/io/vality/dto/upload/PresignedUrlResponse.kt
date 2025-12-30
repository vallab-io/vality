package io.vality.dto.upload

import kotlinx.serialization.Serializable

@Serializable
data class PresignedUrlResponse(
    val presignedUrl: String,
    val filename: String,
    val key: String, // S3 Key (전체 경로)
    val fullUrl: String, // DB에 저장할 full URL
)

