package io.vality.repository

import io.vality.domain.RefreshToken
import io.vality.domain.RefreshTokens
import io.vality.plugins.dbQuery
import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.and
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.core.greater
import org.jetbrains.exposed.v1.core.less
import org.jetbrains.exposed.v1.jdbc.deleteWhere
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.select
import java.time.Instant

class RefreshTokenRepository {

    private fun ResultRow.toRefreshToken(): RefreshToken {
        return RefreshToken(
            id = this[RefreshTokens.id],
            userId = this[RefreshTokens.userId],
            token = this[RefreshTokens.token],
            expiresAt = this[RefreshTokens.expiresAt],
            createdAt = this[RefreshTokens.createdAt]
        )
    }

    suspend fun findByToken(token: String): RefreshToken? = dbQuery {
        val now = Instant.now()
        RefreshTokens.select(
            listOf(
                RefreshTokens.id,
                RefreshTokens.userId,
                RefreshTokens.token,
                RefreshTokens.expiresAt,
                RefreshTokens.createdAt
            )
        )
            .where {
                (RefreshTokens.token eq token) and (RefreshTokens.expiresAt greater now)
            }
            .map { it.toRefreshToken() }
            .singleOrNull()
    }

    suspend fun findByUserId(userId: String): List<RefreshToken> = dbQuery {
        val now = Instant.now()
        RefreshTokens.select(
            listOf(
                RefreshTokens.id,
                RefreshTokens.userId,
                RefreshTokens.token,
                RefreshTokens.expiresAt,
                RefreshTokens.createdAt
            )
        )
            .where {
                (RefreshTokens.userId eq userId) and (RefreshTokens.expiresAt greater now)
            }
            .map { it.toRefreshToken() }
    }

    suspend fun create(refreshToken: RefreshToken): RefreshToken = dbQuery {
        RefreshTokens.insert {
            it[id] = refreshToken.id
            it[userId] = refreshToken.userId
            it[token] = refreshToken.token
            it[expiresAt] = refreshToken.expiresAt
            it[createdAt] = refreshToken.createdAt
        }
        refreshToken
    }

    suspend fun delete(id: String): Boolean = dbQuery {
        RefreshTokens.deleteWhere { RefreshTokens.id eq id } > 0
    }

    suspend fun deleteByToken(token: String): Boolean = dbQuery {
        RefreshTokens.deleteWhere { RefreshTokens.token eq token } > 0
    }

    suspend fun deleteByUserId(userId: String): Int = dbQuery {
        RefreshTokens.deleteWhere { RefreshTokens.userId eq userId }
    }

    suspend fun deleteExpired(): Int = dbQuery {
        val now = Instant.now()
        RefreshTokens.deleteWhere { RefreshTokens.expiresAt less now }
    }
}

