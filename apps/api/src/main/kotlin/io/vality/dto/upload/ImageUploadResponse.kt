package io.vality.dto.upload

import kotlinx.serialization.Serializable

@Serializable
data class ImageUploadResponse(
    val url: String, // 완성된 이미지 URL (CDN URL)
    val key: String, // S3 Key (경로)
)

