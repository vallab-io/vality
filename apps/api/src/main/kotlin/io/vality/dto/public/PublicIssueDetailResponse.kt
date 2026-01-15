package io.vality.dto.public

import kotlinx.serialization.Serializable

/**
 * 이슈 상세 조회용 Response
 * /@{{username}}/{{newsletterSlug}}/{{issueSlug}}에서 사용
 * user, newsletter, issue에 대한 모든 데이터 포함
 */
@Serializable
data class PublicIssueDetailResponse(
    // Issue 정보
    val id: String,
    val slug: String,
    val title: String?,
    val content: String, // 전체 content
    val description: String?,
    val coverImageUrl: String?,
    val publishedAt: String,
    val createdAt: String,
    val updatedAt: String,
    val likeCount: Long = 0,
    
    // Newsletter 정보
    val newsletterId: String,
    val newsletterSlug: String,
    val newsletterName: String,
    val newsletterDescription: String?,
    
    // Owner (User) 정보
    val ownerId: String,
    val ownerUsername: String?,
    val ownerName: String?,
    val ownerBio: String?,
    val ownerImageUrl: String?,
)

