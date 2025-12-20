package io.vality.dto.issue

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.time.Instant

@Serializable
data class UpdateIssueRequest(
    val title: String? = null,
    val slug: String? = null,
    val content: String? = null,
    val excerpt: String? = null,
    val coverImageUrl: String? = null,
    val status: String? = null, // "DRAFT", "SCHEDULED", "PUBLISHED"
    @Contextual
    val scheduledAt: Instant? = null, // SCHEDULED일 때만 필요
)

