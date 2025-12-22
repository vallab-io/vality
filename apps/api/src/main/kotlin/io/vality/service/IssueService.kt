package io.vality.service

import io.vality.domain.IssueStatus
import io.vality.dto.public.PublicIssueDetailResponse
import io.vality.dto.public.PublicIssueResponse
import io.vality.repository.IssueRepository
import io.vality.repository.NewsletterRepository
import io.vality.repository.UserRepository
import io.vality.service.upload.ImageUrlService

class IssueService(
    private val issueRepository: IssueRepository,
    private val newsletterRepository: NewsletterRepository,
    private val userRepository: UserRepository,
    private val imageUrlService: ImageUrlService,
) {
    /**
     * 이슈 좋아요 수 증가 (Medium clap 방식 - 중복 허용)
     * 
     * @param issueId 이슈 ID
     * @return 증가된 좋아요 수
     */
    suspend fun incrementLikeCount(issueId: String): Long {
        // 이슈 존재 확인
        val issue = issueRepository.findById(issueId)
            ?: throw IllegalArgumentException("Issue not found")
        
        // 현재 좋아요 수 조회 및 증가
        val currentCount = issue.likeCount
        val newCount = currentCount + 1
        
        // 좋아요 수 업데이트
        issueRepository.updateLikeCount(issueId, newCount)
        
        return newCount
    }

    /**
     * 모든 사용자의 발행된 이슈 목록 조회 (최신순, 페이징)
     */
    suspend fun getAllPublishedIssues(
        limit: Int = 20,
        offset: Int = 0
    ): List<PublicIssueResponse> {
        val issuesWithDetails = issueRepository.findAllPublishedWithNewsletterAndOwner(limit, offset)
        
        return issuesWithDetails.map { issue ->
            PublicIssueResponse(
                id = issue.issueId,
                slug = issue.issueSlug,
                title = issue.issueTitle,
                excerpt = issue.issueExcerpt,
                publishedAt = issue.issuePublishedAt?.toString() ?: "",
                likeCount = issue.issueLikeCount,
                newsletterId = issue.newsletterId,
                newsletterSlug = issue.newsletterSlug,
                newsletterName = issue.newsletterName,
                ownerUsername = issue.ownerUsername,
                ownerName = issue.ownerName,
                ownerImageUrl = imageUrlService.getUserImageUrl(issue.ownerImageUrl, issue.ownerId),
                coverImageUrl = issue.issueCoverImageUrl?.let { imageUrlService.getImageUrl(it) },
            )
        }
    }

    /**
     * 특정 이슈 상세 조회 (username + newsletterSlug + issueSlug)
     */
    suspend fun getIssueDetailBySlug(
        username: String,
        newsletterSlug: String,
        issueSlug: String
    ): PublicIssueDetailResponse {
        val newsletter = newsletterRepository.findByUsernameAndSlug(username, newsletterSlug)
            ?: throw IllegalArgumentException("Newsletter not found")

        val issue = issueRepository.findByNewsletterIdAndSlug(newsletter.id, issueSlug)
            ?: throw IllegalArgumentException("Issue not found")

        if (issue.status != IssueStatus.PUBLISHED) {
            throw IllegalArgumentException("Issue not found")
        }

        val user = userRepository.findById(newsletter.ownerId)
            ?: throw IllegalStateException("User not found")

        return PublicIssueDetailResponse(
            id = issue.id,
            slug = issue.slug,
            title = issue.title,
            content = issue.content,
            excerpt = issue.excerpt,
            coverImageUrl = issue.coverImageUrl?.let { imageUrlService.getImageUrl(it) },
            publishedAt = issue.publishedAt?.toString() ?: "",
            createdAt = issue.createdAt.toString(),
            updatedAt = issue.updatedAt.toString(),
            likeCount = issue.likeCount,
            newsletterId = newsletter.id,
            newsletterSlug = newsletter.slug,
            newsletterName = newsletter.name,
            newsletterDescription = newsletter.description,
            newsletterSenderName = newsletter.senderName,
            ownerId = user.id,
            ownerUsername = user.username,
            ownerName = user.name,
            ownerBio = user.bio,
            ownerImageUrl = imageUrlService.getImageUrl(user),
        )
    }

    /**
     * 특정 뉴스레터의 발행된 이슈 목록 조회 (최신순, 페이징)
     */
    suspend fun getNewsletterIssues(
        username: String,
        newsletterSlug: String,
        limit: Int = 20,
        offset: Int = 0
    ): List<PublicIssueResponse> {
        val newsletter = newsletterRepository.findByUsernameAndSlug(username, newsletterSlug)
            ?: throw IllegalArgumentException("Newsletter not found")

        val owner = userRepository.findById(newsletter.ownerId)
            ?: throw IllegalStateException("Newsletter owner not found")

        val issues = issueRepository.findPublishedByNewsletterId(newsletter.id)
            .sortedByDescending { it.publishedAt }
            .drop(offset)
            .take(limit)
            .map { issue ->
                PublicIssueResponse(
                    id = issue.id,
                    slug = issue.slug,
                    title = issue.title,
                    excerpt = issue.excerpt,
                    publishedAt = issue.publishedAt?.toString() ?: "",
                    likeCount = issue.likeCount,
                    newsletterId = newsletter.id,
                    newsletterSlug = newsletter.slug,
                    newsletterName = newsletter.name,
                    ownerUsername = owner.username,
                    ownerName = owner.name,
                    ownerImageUrl = imageUrlService.getImageUrl(owner),
                    coverImageUrl = issue.coverImageUrl?.let { imageUrlService.getImageUrl(it) },
                )
            }

        return issues
    }

    /**
     * 사용자의 발행된 이슈 목록 조회 (최신순, 페이징)
     */
    suspend fun getUserIssues(
        username: String,
        limit: Int = 20,
        offset: Int = 0
    ): List<PublicIssueResponse> {
        val user = userRepository.findByUsername(username)
            ?: throw IllegalArgumentException("User not found")

        val newsletters = newsletterRepository.findByOwnerId(user.id)
        if (newsletters.isEmpty()) {
            return emptyList()
        }

        val allIssues = newsletters.flatMap { newsletter ->
            issueRepository.findPublishedByNewsletterId(newsletter.id)
                .map { issue ->
                    PublicIssueResponse(
                        id = issue.id,
                        slug = issue.slug,
                        title = issue.title,
                        excerpt = issue.excerpt,
                        publishedAt = issue.publishedAt?.toString() ?: "",
                        likeCount = issue.likeCount,
                        newsletterId = newsletter.id,
                        newsletterSlug = newsletter.slug,
                        newsletterName = newsletter.name,
                        ownerUsername = user.username,
                        ownerName = user.name,
                        ownerImageUrl = imageUrlService.getImageUrl(user),
                        coverImageUrl = issue.coverImageUrl?.let { imageUrlService.getImageUrl(it) },
                    )
                }
        }

        return allIssues
            .sortedByDescending { it.publishedAt }
            .drop(offset)
            .take(limit)
    }
}

