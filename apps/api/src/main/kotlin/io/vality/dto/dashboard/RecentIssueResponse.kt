package io.vality.dto.dashboard

import kotlinx.serialization.Serializable

@Serializable
data class RecentIssueResponse(
    val id: String,
    val title: String?,
    val slug: String,
    val status: String,
    val publishedAt: String?,
    val newsletterId: String,
    val newsletterSlug: String,
    val newsletterName: String,
    val ownerUsername: String,
    val createdAt: String,
)

