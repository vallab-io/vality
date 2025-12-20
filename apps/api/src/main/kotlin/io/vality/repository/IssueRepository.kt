package io.vality.repository

import io.vality.domain.Issue
import io.vality.domain.Issues
import io.vality.plugins.dbQuery
import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.and
import org.jetbrains.exposed.v1.core.eq
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
}

