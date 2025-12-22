package io.vality.domain

import kotlinx.serialization.Serializable
import kotlinx.serialization.Contextual
import java.time.Instant

enum class IssueStatus {
    DRAFT,
    SCHEDULED,
    PUBLISHED,
    ARCHIVED
}

@Serializable
data class Issue(
    val id: String,
    val title: String?, // nullable, 발행 시 필수
    val slug: String,
    val content: String,
    val excerpt: String? = null,
    val coverImageUrl: String? = null,
    val status: IssueStatus = IssueStatus.DRAFT,
    @Contextual val publishedAt: Instant? = null,
    @Contextual val scheduledAt: Instant? = null,
    val likeCount: Long = 0,
    val newsletterId: String,
    @Contextual val createdAt: Instant,
    @Contextual val updatedAt: Instant
)
