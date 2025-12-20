package io.vality.repository

import io.vality.domain.SubscriberVerificationToken
import io.vality.domain.SubscriberVerificationTokens
import io.vality.plugins.dbQuery
import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.and
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.core.greater
import org.jetbrains.exposed.v1.core.less
import org.jetbrains.exposed.v1.jdbc.deleteWhere
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.select
import org.jetbrains.exposed.v1.jdbc.update
import java.time.Instant

class SubscriberVerificationTokenRepository {

    private fun ResultRow.toSubscriberVerificationToken(): SubscriberVerificationToken {
        return SubscriberVerificationToken(
            id = this[SubscriberVerificationTokens.id],
            subscriberId = this[SubscriberVerificationTokens.subscriberId],
            token = this[SubscriberVerificationTokens.token],
            expiresAt = this[SubscriberVerificationTokens.expiresAt],
            usedAt = this[SubscriberVerificationTokens.usedAt],
            createdAt = this[SubscriberVerificationTokens.createdAt],
        )
    }

    suspend fun findByToken(token: String): SubscriberVerificationToken? = dbQuery {
        SubscriberVerificationTokens.select(
            listOf(
                SubscriberVerificationTokens.id,
                SubscriberVerificationTokens.subscriberId,
                SubscriberVerificationTokens.token,
                SubscriberVerificationTokens.expiresAt,
                SubscriberVerificationTokens.usedAt,
                SubscriberVerificationTokens.createdAt,
            )
        )
            .where { SubscriberVerificationTokens.token eq token }
            .map { it.toSubscriberVerificationToken() }
            .singleOrNull()
    }

    suspend fun findValidByToken(token: String): SubscriberVerificationToken? = dbQuery {
        val now = Instant.now()
        SubscriberVerificationTokens.select(
            listOf(
                SubscriberVerificationTokens.id,
                SubscriberVerificationTokens.subscriberId,
                SubscriberVerificationTokens.token,
                SubscriberVerificationTokens.expiresAt,
                SubscriberVerificationTokens.usedAt,
                SubscriberVerificationTokens.createdAt,
            )
        )
            .where {
                (SubscriberVerificationTokens.token eq token) and
                (SubscriberVerificationTokens.expiresAt greater now) and
                (SubscriberVerificationTokens.usedAt eq null)
            }
            .map { it.toSubscriberVerificationToken() }
            .singleOrNull()
    }

    suspend fun findBySubscriberId(subscriberId: String): SubscriberVerificationToken? = dbQuery {
        val now = Instant.now()
        SubscriberVerificationTokens.select(
            listOf(
                SubscriberVerificationTokens.id,
                SubscriberVerificationTokens.subscriberId,
                SubscriberVerificationTokens.token,
                SubscriberVerificationTokens.expiresAt,
                SubscriberVerificationTokens.usedAt,
                SubscriberVerificationTokens.createdAt,
            )
        )
            .where {
                (SubscriberVerificationTokens.subscriberId eq subscriberId) and
                (SubscriberVerificationTokens.expiresAt greater now) and
                (SubscriberVerificationTokens.usedAt eq null)
            }
            .map { it.toSubscriberVerificationToken() }
            .singleOrNull()
    }

    suspend fun create(subscriberVerificationToken: SubscriberVerificationToken): SubscriberVerificationToken = dbQuery {
        SubscriberVerificationTokens.insert {
            it[id] = subscriberVerificationToken.id
            it[subscriberId] = subscriberVerificationToken.subscriberId
            it[token] = subscriberVerificationToken.token
            it[expiresAt] = subscriberVerificationToken.expiresAt
            it[usedAt] = subscriberVerificationToken.usedAt
            it[createdAt] = subscriberVerificationToken.createdAt
        }
        subscriberVerificationToken
    }

    suspend fun markAsUsed(tokenId: String): Boolean = dbQuery {
        val now = Instant.now()
        SubscriberVerificationTokens.update({ SubscriberVerificationTokens.id eq tokenId }) {
            it[usedAt] = now
        } > 0
    }

    suspend fun invalidateBySubscriberId(subscriberId: String): Int = dbQuery {
        val now = Instant.now()
        SubscriberVerificationTokens.update({
            (SubscriberVerificationTokens.subscriberId eq subscriberId) and
            (SubscriberVerificationTokens.usedAt eq null)
        }) {
            it[usedAt] = now
        }
    }

    suspend fun deleteExpiredTokens(): Int = dbQuery {
        val now = Instant.now()
        SubscriberVerificationTokens.deleteWhere {
            SubscriberVerificationTokens.expiresAt less now
        }
    }
}

