package io.vality.service

import io.vality.domain.Issue
import io.vality.domain.IssueStatus
import io.vality.dto.issue.CreateIssueCommand
import io.vality.dto.issue.DeleteIssueCommand
import io.vality.dto.issue.GetIssueQuery
import io.vality.dto.issue.GetIssuesQuery
import io.vality.dto.issue.IssueException
import io.vality.dto.issue.IssueResponse
import io.vality.dto.issue.UpdateIssueCommand
import io.vality.dto.issue.toIssueResponse
import io.vality.dto.public.PublicIssueDetailResponse
import io.vality.dto.public.PublicIssueResponse
import io.vality.repository.IssueRepository
import io.vality.repository.NewsletterRepository
import io.vality.repository.UserRepository
import io.vality.service.upload.ImageUrlService
import io.vality.util.CuidGenerator
import java.time.Instant

class IssueService(
    private val issueRepository: IssueRepository,
    private val newsletterRepository: NewsletterRepository,
    private val userRepository: UserRepository,
    private val imageUrlService: ImageUrlService,
    private val issuePublishService: IssuePublishService,
) {
    // ========================================
    // CRUD 비즈니스 로직 (Dashboard용)
    // ========================================

    /**
     * 이슈 생성
     * 
     * @throws IssueException.NewsletterNotFound 뉴스레터가 없는 경우
     * @throws IssueException.Forbidden 권한이 없는 경우
     * @throws IssueException.SlugConflict Slug가 중복되는 경우
     * @throws IssueException.ValidationError 유효성 검증 실패
     */
    suspend fun createIssue(command: CreateIssueCommand): IssueResponse {
        // 1. 뉴스레터 조회 및 권한 확인
        val newsletter = newsletterRepository.findById(command.newsletterId)
            ?: throw IssueException.NewsletterNotFound()
        
        if (newsletter.ownerId != command.userId) {
            throw IssueException.Forbidden()
        }

        // 2. Slug 생성/검증
        val slug = if (command.slug.isNullOrBlank()) {
            "issue-${System.currentTimeMillis()}"
        } else {
            command.slug.trim()
        }

        if (issueRepository.existsByNewsletterIdAndSlug(command.newsletterId, slug)) {
            throw IssueException.SlugConflict("Slug already exists in this newsletter")
        }

        // 3. 상태 파싱 및 검증
        val status = parseAndValidateStatus(
            statusStr = command.status,
            title = command.title,
            scheduledAt = command.scheduledAt,
        )

        // 4. SCHEDULED 상태가 아닌데 scheduledAt이 있으면 에러
        if (status != IssueStatus.SCHEDULED && command.scheduledAt != null) {
            throw IssueException.ValidationError("scheduledAt can only be set when status is SCHEDULED")
        }

        // 5. publishedAt 설정
        val publishedAt = if (status == IssueStatus.PUBLISHED) Instant.now() else null

        // 6. 이슈 생성
        val now = Instant.now()
        val issue = Issue(
            id = CuidGenerator.generate(),
            title = command.title?.trim(),
            slug = slug,
            content = command.content,
            excerpt = command.excerpt?.trim(),
            coverImageUrl = command.coverImageUrl?.trim(),
            status = status,
            publishedAt = publishedAt,
            scheduledAt = command.scheduledAt,
            newsletterId = command.newsletterId,
            createdAt = now,
            updatedAt = now,
        )

        val createdIssue = issueRepository.create(issue)

        // 7. 발행된 경우 이메일 큐에 작업 추가
        if (createdIssue.status == IssueStatus.PUBLISHED) {
            val owner = userRepository.findById(command.userId)
            if (owner != null) {
                issuePublishService.queueIssuePublishedEmail(createdIssue, newsletter, owner)
            }
        }

        return createdIssue.toIssueResponse()
    }

    /**
     * 이슈 목록 조회
     */
    suspend fun getIssues(query: GetIssuesQuery): List<IssueResponse> {
        // 1. 뉴스레터 조회 및 권한 확인
        val newsletter = newsletterRepository.findById(query.newsletterId)
            ?: throw IssueException.NewsletterNotFound()
        
        if (newsletter.ownerId != query.userId) {
            throw IssueException.Forbidden()
        }

        // 2. 이슈 목록 조회
        return issueRepository.findByNewsletterId(query.newsletterId)
            .map { it.toIssueResponse() }
    }

    /**
     * 개별 이슈 조회
     */
    suspend fun getIssue(query: GetIssueQuery): IssueResponse {
        // 1. 뉴스레터 조회 및 권한 확인
        val newsletter = newsletterRepository.findById(query.newsletterId)
            ?: throw IssueException.NewsletterNotFound()
        
        if (newsletter.ownerId != query.userId) {
            throw IssueException.Forbidden()
        }

        // 2. 이슈 조회 및 뉴스레터 소속 확인
        val issue = issueRepository.findById(query.issueId)
            ?: throw IssueException.NotFound()

        if (issue.newsletterId != query.newsletterId) {
            throw IssueException.ValidationError("Issue does not belong to this newsletter")
        }

        return issue.toIssueResponse()
    }

    /**
     * 이슈 수정
     */
    suspend fun updateIssue(command: UpdateIssueCommand): IssueResponse {
        // 1. 뉴스레터 조회 및 권한 확인
        val newsletter = newsletterRepository.findById(command.newsletterId)
            ?: throw IssueException.NewsletterNotFound()
        
        if (newsletter.ownerId != command.userId) {
            throw IssueException.Forbidden()
        }

        // 2. 이슈 조회 및 뉴스레터 소속 확인
        val existingIssue = issueRepository.findById(command.issueId)
            ?: throw IssueException.NotFound()

        if (existingIssue.newsletterId != command.newsletterId) {
            throw IssueException.ValidationError("Issue does not belong to this newsletter")
        }

        // 3. Slug 중복 확인 (변경하는 경우)
        if (command.slug != null && command.slug != existingIssue.slug) {
            if (issueRepository.existsByNewsletterIdAndSlug(command.newsletterId, command.slug)) {
                throw IssueException.SlugConflict("Slug already exists in this newsletter")
            }
        }

        // 4. 상태 파싱 및 검증
        val newStatus = if (command.status != null) {
            val finalTitle = command.title?.trim() ?: existingIssue.title
            parseAndValidateStatus(
                statusStr = command.status,
                title = finalTitle,
                scheduledAt = command.scheduledAt,
            )
        } else {
            existingIssue.status
        }

        // 5. SCHEDULED 상태가 아닌데 scheduledAt이 있으면 에러
        if (newStatus != IssueStatus.SCHEDULED && command.scheduledAt != null) {
            throw IssueException.ValidationError("scheduledAt can only be set when status is SCHEDULED")
        }

        // 6. publishedAt 설정 (PUBLISHED로 변경할 때만)
        val publishedAt = if (newStatus == IssueStatus.PUBLISHED && existingIssue.status != IssueStatus.PUBLISHED) {
            Instant.now()
        } else {
            existingIssue.publishedAt
        }

        // 7. 이슈 업데이트
        val updatedIssue = existingIssue.copy(
            title = command.title?.trim() ?: existingIssue.title,
            slug = command.slug?.trim() ?: existingIssue.slug,
            content = command.content,
            excerpt = command.excerpt?.trim() ?: existingIssue.excerpt,
            coverImageUrl = command.coverImageUrl?.trim() ?: existingIssue.coverImageUrl,
            status = newStatus,
            publishedAt = publishedAt,
            scheduledAt = command.scheduledAt ?: existingIssue.scheduledAt,
            updatedAt = Instant.now(),
        )

        val savedIssue = issueRepository.update(updatedIssue)

        // 8. 새로 발행된 경우 이메일 큐에 작업 추가
        val isNewlyPublished = savedIssue.status == IssueStatus.PUBLISHED && 
                               existingIssue.status != IssueStatus.PUBLISHED
        if (isNewlyPublished) {
            val owner = userRepository.findById(command.userId)
            if (owner != null) {
                issuePublishService.queueIssuePublishedEmail(savedIssue, newsletter, owner)
            }
        }

        return savedIssue.toIssueResponse()
    }

    /**
     * 이슈 삭제
     */
    suspend fun deleteIssue(command: DeleteIssueCommand) {
        // 1. 뉴스레터 조회 및 권한 확인
        val newsletter = newsletterRepository.findById(command.newsletterId)
            ?: throw IssueException.NewsletterNotFound()
        
        if (newsletter.ownerId != command.userId) {
            throw IssueException.Forbidden()
        }

        // 2. 이슈 조회 및 뉴스레터 소속 확인
        val issue = issueRepository.findById(command.issueId)
            ?: throw IssueException.NotFound()

        if (issue.newsletterId != command.newsletterId) {
            throw IssueException.ValidationError("Issue does not belong to this newsletter")
        }

        // 3. 삭제
        val deleted = issueRepository.delete(command.issueId)
        if (!deleted) {
            throw IssueException.ValidationError("Failed to delete issue")
        }
    }

    /**
     * 상태 문자열을 파싱하고 유효성 검증
     */
    private fun parseAndValidateStatus(
        statusStr: String?,
        title: String?,
        scheduledAt: Instant?,
    ): IssueStatus {
        return when (statusStr?.uppercase()) {
            "DRAFT" -> IssueStatus.DRAFT
            "SCHEDULED" -> {
                if (title.isNullOrBlank()) {
                    throw IssueException.ValidationError("Title is required for scheduling")
                }
                if (scheduledAt == null) {
                    throw IssueException.ValidationError("scheduledAt is required for SCHEDULED status")
                }
                IssueStatus.SCHEDULED
            }
            "PUBLISHED" -> {
                if (title.isNullOrBlank()) {
                    throw IssueException.ValidationError("Title is required for publishing")
                }
                IssueStatus.PUBLISHED
            }
            null -> IssueStatus.DRAFT
            else -> throw IssueException.ValidationError("Invalid status. Must be DRAFT, SCHEDULED, or PUBLISHED")
        }
    }

    // ========================================
    // Public 조회 로직 (기존)
    // ========================================
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

