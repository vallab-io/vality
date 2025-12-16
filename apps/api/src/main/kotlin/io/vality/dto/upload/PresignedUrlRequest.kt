package io.vality.dto.upload

import kotlinx.serialization.Serializable

@Serializable
data class PresignedUrlRequest(
    val type: String, // "user" or "issue"
    val filename: String,
    val contentType: String,
    val fileSize: Long,
    val issueId: String? = null, // issue 타입일 때만 필요
)

