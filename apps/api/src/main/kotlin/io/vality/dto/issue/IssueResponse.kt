package io.vality.dto.issue

import io.vality.domain.Issue
import io.vality.domain.IssueStatus
import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.time.Instant

@Serializable
data class IssueResponse(
    val id: String,
    val title: String,
    val slug: String,
    val excerpt: String?,
    val coverImageUrl: String?,
    val status: String, // "DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"
    @Contextual
    val publishedAt: Instant?,
    @Contextual
    val scheduledAt: Instant?,
    val newsletterId: String,
    @Contextual
    val createdAt: Instant,
    @Contextual
    val updatedAt: Instant,
)

/**
 * Issue 도메인 객체를 IssueResponse로 변환
 */
fun Issue.toIssueResponse(): IssueResponse {
    return IssueResponse(
        id = id,
        title = title,
        slug = slug,
        excerpt = excerpt,
        coverImageUrl = coverImageUrl,
        status = status.name,
        publishedAt = publishedAt,
        scheduledAt = scheduledAt,
        newsletterId = newsletterId,
        createdAt = createdAt,
        updatedAt = updatedAt,
    )
}

