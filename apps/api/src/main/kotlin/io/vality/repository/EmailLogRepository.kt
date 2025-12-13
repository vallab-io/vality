package io.vality.repository

import io.vality.domain.EmailLog
import io.vality.domain.EmailLogs
import io.vality.plugins.dbQuery
import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.and
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.deleteWhere
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.select
import org.jetbrains.exposed.v1.jdbc.update

class EmailLogRepository {

    private fun ResultRow.toEmailLog(): EmailLog {
        return EmailLog(
            id = this[EmailLogs.id],
            status = io.vality.domain.EmailStatus.valueOf(this[EmailLogs.status]),
            sentAt = this[EmailLogs.sentAt],
            openedAt = this[EmailLogs.openedAt],
            clickedAt = this[EmailLogs.clickedAt],
            createdAt = this[EmailLogs.createdAt],
            issueId = this[EmailLogs.issueId],
            subscriberId = this[EmailLogs.subscriberId]
        )
    }

    suspend fun findById(id: String): EmailLog? = dbQuery {
        EmailLogs.select(
            listOf(
                EmailLogs.id,
                EmailLogs.status,
                EmailLogs.sentAt,
                EmailLogs.openedAt,
                EmailLogs.clickedAt,
                EmailLogs.createdAt,
                EmailLogs.issueId,
                EmailLogs.subscriberId
            )
        )
            .where { EmailLogs.id eq id }
            .map { it.toEmailLog() }
            .singleOrNull()
    }

    suspend fun findByIssueId(issueId: String): List<EmailLog> = dbQuery {
        EmailLogs.select(
            listOf(
                EmailLogs.id,
                EmailLogs.status,
                EmailLogs.sentAt,
                EmailLogs.openedAt,
                EmailLogs.clickedAt,
                EmailLogs.createdAt,
                EmailLogs.issueId,
                EmailLogs.subscriberId
            )
        )
            .where { EmailLogs.issueId eq issueId }
            .map { it.toEmailLog() }
    }

    suspend fun findBySubscriberId(subscriberId: String): List<EmailLog> = dbQuery {
        EmailLogs.select(
            listOf(
                EmailLogs.id,
                EmailLogs.status,
                EmailLogs.sentAt,
                EmailLogs.openedAt,
                EmailLogs.clickedAt,
                EmailLogs.createdAt,
                EmailLogs.issueId,
                EmailLogs.subscriberId
            )
        )
            .where { EmailLogs.subscriberId eq subscriberId }
            .map { it.toEmailLog() }
    }

    suspend fun findByIssueIdAndStatus(issueId: String, status: io.vality.domain.EmailStatus): List<EmailLog> = dbQuery {
        EmailLogs.select(
            listOf(
                EmailLogs.id,
                EmailLogs.status,
                EmailLogs.sentAt,
                EmailLogs.openedAt,
                EmailLogs.clickedAt,
                EmailLogs.createdAt,
                EmailLogs.issueId,
                EmailLogs.subscriberId
            )
        )
            .where { (EmailLogs.issueId eq issueId) and (EmailLogs.status eq status.name) }
            .map { it.toEmailLog() }
    }

    suspend fun create(emailLog: EmailLog): EmailLog = dbQuery {
        EmailLogs.insert {
            it[id] = emailLog.id
            it[status] = emailLog.status.name
            it[sentAt] = emailLog.sentAt
            it[openedAt] = emailLog.openedAt
            it[clickedAt] = emailLog.clickedAt
            it[createdAt] = emailLog.createdAt
            it[issueId] = emailLog.issueId
            it[subscriberId] = emailLog.subscriberId
        }
        emailLog
    }

    suspend fun update(emailLog: EmailLog): EmailLog = dbQuery {
        EmailLogs.update({ EmailLogs.id eq emailLog.id }) {
            it[status] = emailLog.status.name
            it[sentAt] = emailLog.sentAt
            it[openedAt] = emailLog.openedAt
            it[clickedAt] = emailLog.clickedAt
        }
        emailLog
    }

    suspend fun delete(id: String): Boolean = dbQuery {
        EmailLogs.deleteWhere { EmailLogs.id eq id } > 0
    }
}

