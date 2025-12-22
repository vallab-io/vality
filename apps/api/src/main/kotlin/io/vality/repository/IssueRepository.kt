package io.vality.repository

import io.vality.domain.Issue
import io.vality.domain.Issues
import io.vality.domain.Newsletters
import io.vality.domain.Users
import io.vality.plugins.dbQuery
import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.SortOrder
import org.jetbrains.exposed.v1.core.and
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.core.innerJoin
import org.jetbrains.exposed.v1.core.neq
import org.jetbrains.exposed.v1.jdbc.deleteWhere
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.select
import org.jetbrains.exposed.v1.jdbc.update

class IssueRepository {

    private fun ResultRow.toIssue(): Issue {
        return Issue(
            id = this[Issues.id],
            title = this[Issues.title],
            slug = this[Issues.slug],
            content = this[Issues.content],
            excerpt = this[Issues.excerpt],
            coverImageUrl = this[Issues.coverImageUrl],
            status = io.vality.domain.IssueStatus.valueOf(this[Issues.status]),
            publishedAt = this[Issues.publishedAt],
            scheduledAt = this[Issues.scheduledAt],
            newsletterId = this[Issues.newsletterId],
            createdAt = this[Issues.createdAt],
            updatedAt = this[Issues.updatedAt]
        )
    }

    suspend fun findById(id: String): Issue? = dbQuery {
        Issues.select(
            listOf(
                Issues.id,
                Issues.title,
                Issues.slug,
                Issues.content,
                Issues.excerpt,
                Issues.coverImageUrl,
                Issues.status,
                Issues.publishedAt,
                Issues.scheduledAt,
                Issues.newsletterId,
                Issues.createdAt,
                Issues.updatedAt
            )
        )
            .where { Issues.id eq id }
            .map { it.toIssue() }
            .singleOrNull()
    }

    suspend fun findByNewsletterId(newsletterId: String): List<Issue> = dbQuery {
        Issues.select(
            listOf(
                Issues.id,
                Issues.title,
                Issues.slug,
                Issues.content,
                Issues.excerpt,
                Issues.coverImageUrl,
                Issues.status,
                Issues.publishedAt,
                Issues.scheduledAt,
                Issues.newsletterId,
                Issues.createdAt,
                Issues.updatedAt
            )
        )
            .where { Issues.newsletterId eq newsletterId }
            .orderBy(Issues.createdAt to org.jetbrains.exposed.v1.core.SortOrder.DESC)
            .map { it.toIssue() }
    }

    suspend fun findByNewsletterIdAndSlug(newsletterId: String, slug: String): Issue? = dbQuery {
        Issues.select(
            listOf(
                Issues.id,
                Issues.title,
                Issues.slug,
                Issues.content,
                Issues.excerpt,
                Issues.coverImageUrl,
                Issues.status,
                Issues.publishedAt,
                Issues.scheduledAt,
                Issues.newsletterId,
                Issues.createdAt,
                Issues.updatedAt
            )
        )
            .where { (Issues.newsletterId eq newsletterId) and (Issues.slug eq slug) }
            .map { it.toIssue() }
            .singleOrNull()
    }

    suspend fun findByNewsletterIdAndStatus(newsletterId: String, status: io.vality.domain.IssueStatus): List<Issue> = dbQuery {
        Issues.select(
            listOf(
                Issues.id,
                Issues.title,
                Issues.slug,
                Issues.content,
                Issues.excerpt,
                Issues.coverImageUrl,
                Issues.status,
                Issues.publishedAt,
                Issues.scheduledAt,
                Issues.newsletterId,
                Issues.createdAt,
                Issues.updatedAt
            )
        )
            .where { (Issues.newsletterId eq newsletterId) and (Issues.status eq status.name) }
            .map { it.toIssue() }
    }

    suspend fun findPublishedByNewsletterId(newsletterId: String): List<Issue> = dbQuery {
        Issues.select(
            listOf(
                Issues.id,
                Issues.title,
                Issues.slug,
                Issues.content,
                Issues.excerpt,
                Issues.coverImageUrl,
                Issues.status,
                Issues.publishedAt,
                Issues.scheduledAt,
                Issues.newsletterId,
                Issues.createdAt,
                Issues.updatedAt
            )
        )
            .where { (Issues.newsletterId eq newsletterId) and (Issues.status eq io.vality.domain.IssueStatus.PUBLISHED.name) }
            .map { it.toIssue() }
    }

    suspend fun existsByNewsletterIdAndSlug(newsletterId: String, slug: String): Boolean = dbQuery {
        Issues.select(listOf(Issues.id))
            .where { (Issues.newsletterId eq newsletterId) and (Issues.slug eq slug) }
            .limit(1)
            .firstOrNull() != null
    }

    suspend fun create(issue: Issue): Issue = dbQuery {
        Issues.insert {
            it[id] = issue.id
            it[title] = issue.title
            it[slug] = issue.slug
            it[content] = issue.content
            it[excerpt] = issue.excerpt
            it[coverImageUrl] = issue.coverImageUrl
            it[status] = issue.status.name
            it[publishedAt] = issue.publishedAt
            it[scheduledAt] = issue.scheduledAt
            it[newsletterId] = issue.newsletterId
            it[createdAt] = issue.createdAt
            it[updatedAt] = issue.updatedAt
        }
        issue
    }

    suspend fun update(issue: Issue): Issue = dbQuery {
        Issues.update({ Issues.id eq issue.id }) {
            it[title] = issue.title
            it[slug] = issue.slug
            it[content] = issue.content
            it[excerpt] = issue.excerpt
            it[coverImageUrl] = issue.coverImageUrl
            it[status] = issue.status.name
            it[publishedAt] = issue.publishedAt
            it[scheduledAt] = issue.scheduledAt
            it[updatedAt] = issue.updatedAt
        }
        issue
    }

    suspend fun delete(id: String): Boolean = dbQuery {
        Issues.deleteWhere { Issues.id eq id } > 0
    }

    /**
     * 모든 발행된 이슈를 Newsletter와 Owner(User) 정보와 함께 조회 (페이징)
     * Inner join을 사용하여 한 번의 쿼리로 모든 정보를 가져옴
     */
    suspend fun findAllPublishedWithNewsletterAndOwner(
        limit: Int,
        offset: Int
    ): List<IssueWithNewsletterAndOwner> = dbQuery {
        (Issues innerJoin Newsletters).innerJoin(Users)
            .select(
                listOf(
                    Issues.id,
                    Issues.slug,
                    Issues.title,
                    Issues.excerpt,
                    Issues.publishedAt,
                    Newsletters.id,
                    Newsletters.slug,
                    Newsletters.name,
                    Users.id,
                    Users.username,
                    Users.name,
                    Users.imageUrl,
                )
            )
            .where {
                (Issues.newsletterId eq Newsletters.id) and
                        (Newsletters.ownerId eq Users.id) and
                        (Issues.status eq io.vality.domain.IssueStatus.PUBLISHED.name) and
                        (Issues.publishedAt neq null)
            }
            .orderBy(Issues.publishedAt to SortOrder.DESC)
            .limit(limit)
            .drop(offset)
            .map { row ->
                IssueWithNewsletterAndOwner(
                    issueId = row[Issues.id],
                    issueSlug = row[Issues.slug],
                    issueTitle = row[Issues.title],
                    issueExcerpt = row[Issues.excerpt],
                    issuePublishedAt = row[Issues.publishedAt],
                    newsletterId = row[Newsletters.id],
                    newsletterSlug = row[Newsletters.slug],
                    newsletterName = row[Newsletters.name],
                    ownerId = row[Users.id],
                    ownerUsername = row[Users.username],
                    ownerName = row[Users.name],
                    ownerImageUrl = row[Users.imageUrl],
                )
            }
    }
}

/**
 * Issue와 Newsletter, Owner 정보를 함께 담는 데이터 클래스
 */
data class IssueWithNewsletterAndOwner(
    val issueId: String,
    val issueSlug: String,
    val issueTitle: String?,
    val issueExcerpt: String?,
    val issuePublishedAt: java.time.Instant?,
    val newsletterId: String,
    val newsletterSlug: String,
    val newsletterName: String,
    val ownerId: String,
    val ownerUsername: String?,
    val ownerName: String?,
    val ownerImageUrl: String?,
)

