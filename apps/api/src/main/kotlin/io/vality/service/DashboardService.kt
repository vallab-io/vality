package io.vality.service

import io.vality.domain.IssueStatus
import io.vality.dto.dashboard.DashboardStatsResponse
import io.vality.dto.dashboard.RecentIssueResponse
import io.vality.repository.IssueRepository
import io.vality.repository.NewsletterRepository
import io.vality.repository.SubscriberRepository
import io.vality.repository.UserRepository

class DashboardService(
    private val newsletterRepository: NewsletterRepository,
    private val issueRepository: IssueRepository,
    private val subscriberRepository: SubscriberRepository,
    private val userRepository: UserRepository,
) {
    /**
     * 사용자의 대시보드 통계 조회
     */
    suspend fun getStats(userId: String): DashboardStatsResponse {
        // 사용자의 뉴스레터 목록 조회
        val newsletters = newsletterRepository.findByOwnerId(userId)
        
        if (newsletters.isEmpty()) {
            return DashboardStatsResponse(
                totalSubscribers = 0,
                publishedIssues = 0,
                draftIssues = 0,
            )
        }

        var totalSubscribers = 0L
        var publishedIssues = 0L
        var draftIssues = 0L

        for (newsletter in newsletters) {
            // 각 뉴스레터의 활성 구독자 수 합산
            totalSubscribers += subscriberRepository.countActiveByNewsletterId(newsletter.id)

            // 각 뉴스레터의 이슈 조회
            val issues = issueRepository.findByNewsletterId(newsletter.id)
            publishedIssues += issues.count { it.status == IssueStatus.PUBLISHED }
            draftIssues += issues.count { it.status == IssueStatus.DRAFT }
        }

        return DashboardStatsResponse(
            totalSubscribers = totalSubscribers,
            publishedIssues = publishedIssues,
            draftIssues = draftIssues,
        )
    }

    /**
     * 사용자의 최근 발행된 이슈 목록 조회 (DRAFT 제외)
     */
    suspend fun getRecentIssues(userId: String, limit: Int = 5): List<RecentIssueResponse> {
        // 사용자 정보 조회
        val user = userRepository.findById(userId)
            ?: return emptyList()

        // 사용자의 뉴스레터 목록 조회
        val newsletters = newsletterRepository.findByOwnerId(userId)
        
        if (newsletters.isEmpty()) {
            return emptyList()
        }

        val newsletterMap = newsletters.associateBy { it.id }
        
        // 모든 뉴스레터의 발행된 이슈만 가져와서 최신순으로 정렬
        val allIssues = newsletters.flatMap { newsletter ->
            issueRepository.findPublishedByNewsletterId(newsletter.id)
        }

        return allIssues
            .sortedByDescending { it.publishedAt }
            .take(limit)
            .mapNotNull { issue ->
                // slug가 null인 경우 제외 (PUBLISHED 상태이지만 slug가 없는 경우)
                val slug = issue.slug ?: return@mapNotNull null
                
                // newsletter가 없으면 제외
                val newsletter = newsletterMap[issue.newsletterId] ?: return@mapNotNull null
                
                RecentIssueResponse(
                    id = issue.id,
                    title = issue.title,
                    slug = slug,
                    status = issue.status.name,
                    publishedAt = issue.publishedAt?.toString(),
                    newsletterId = newsletter.id,
                    newsletterSlug = newsletter.slug,
                    newsletterName = newsletter.name,
                    ownerUsername = user.username ?: "",
                    createdAt = issue.createdAt.toString(),
                )
            }
    }
}

