package io.vality.dto.issue

import java.time.Instant

/**
 * 이슈 생성 명령 (비즈니스 로직용)
 */
data class CreateIssueCommand(
    val userId: String,
    val newsletterId: String,
    val title: String?,
    val slug: String?,
    val content: String,
    val excerpt: String?,
    val coverImageUrl: String?,
    val status: String?, // "DRAFT", "SCHEDULED", "PUBLISHED"
    val scheduledAt: Instant?,
)

/**
 * 이슈 수정 명령 (비즈니스 로직용)
 */
data class UpdateIssueCommand(
    val userId: String,
    val newsletterId: String,
    val issueId: String,
    val title: String?,
    val slug: String?,
    val content: String,
    val excerpt: String?,
    val coverImageUrl: String?,
    val status: String?,
    val scheduledAt: Instant?,
)

/**
 * 이슈 삭제 명령 (비즈니스 로직용)
 */
data class DeleteIssueCommand(
    val userId: String,
    val newsletterId: String,
    val issueId: String,
)

/**
 * 이슈 목록 조회 쿼리 (비즈니스 로직용)
 */
data class GetIssuesQuery(
    val userId: String,
    val newsletterId: String,
)

/**
 * 개별 이슈 조회 쿼리 (비즈니스 로직용)
 */
data class GetIssueQuery(
    val userId: String,
    val newsletterId: String,
    val issueId: String,
)

/**
 * 비즈니스 로직 예외
 */
sealed class IssueException(message: String) : Exception(message) {
    class NotFound(message: String = "Issue not found") : IssueException(message)
    class NewsletterNotFound(message: String = "Newsletter not found") : IssueException(message)
    class Forbidden(message: String = "You don't have permission to access this resource") : IssueException(message)
    class SlugConflict(message: String = "Slug already exists") : IssueException(message)
    class ValidationError(message: String) : IssueException(message)
}

