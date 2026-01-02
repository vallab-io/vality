package io.vality.dto.newsletter

import io.vality.domain.Newsletter
import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.time.Instant

@Serializable
data class NewsletterResponse(
    val id: String,
    val name: String,
    val slug: String,
    val description: String?,
    val timezone: String,
    @Contextual
    val createdAt: Instant,
    @Contextual
    val updatedAt: Instant,
)

/**
 * Newsletter 도메인 객체를 NewsletterResponse로 변환
 */
fun Newsletter.toNewsletterResponse(): NewsletterResponse {
    return NewsletterResponse(
        id = id,
        name = name,
        slug = slug,
        description = description,
        timezone = timezone,
        createdAt = createdAt,
        updatedAt = updatedAt,
    )
}

