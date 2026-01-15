package io.vality.dto.public

import kotlinx.serialization.Serializable

/**
 * 이슈 목록 조회용 Response (Preview 정보)
 * 여러 이슈를 조회할 때 사용되는 간단한 정보만 포함
 */
@Serializable
data class PublicIssueResponse(
    val id: String,
    val slug: String,
    val title: String?,
    val description: String?, // Short 버전 (description)
    val coverImageUrl: String?,
    val publishedAt: String,
    val likeCount: Long = 0,
    val newsletterId: String,
    val newsletterSlug: String,
    val newsletterName: String,
    val ownerUsername: String?,
    val ownerName: String?,
    val ownerImageUrl: String?,
)

