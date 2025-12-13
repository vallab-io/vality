package io.vality.repository

import io.vality.domain.VerificationCode
import io.vality.domain.VerificationCodes
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

class VerificationCodeRepository {

    private fun ResultRow.toVerificationCode(): VerificationCode {
        return VerificationCode(
            id = this[VerificationCodes.id],
            email = this[VerificationCodes.email],
            code = this[VerificationCodes.code],
            expiresAt = this[VerificationCodes.expiresAt],
            createdAt = this[VerificationCodes.createdAt]
        )
    }

    suspend fun findById(id: String): VerificationCode? = dbQuery {
        VerificationCodes.select(
            listOf(
                VerificationCodes.id,
                VerificationCodes.email,
                VerificationCodes.code,
                VerificationCodes.expiresAt,
                VerificationCodes.createdAt
            )
        )
            .where { VerificationCodes.id eq id }
            .map { it.toVerificationCode() }
            .singleOrNull()
    }

    suspend fun findByEmailAndCode(email: String, code: String): VerificationCode? = dbQuery {
        VerificationCodes.select(
            listOf(
                VerificationCodes.id,
                VerificationCodes.email,
                VerificationCodes.code,
                VerificationCodes.expiresAt,
                VerificationCodes.createdAt
            )
        )
            .where { (VerificationCodes.email eq email) and (VerificationCodes.code eq code) }
            .map { it.toVerificationCode() }
            .singleOrNull()
    }

    suspend fun findValidByEmailAndCode(email: String, code: String): VerificationCode? = dbQuery {
        val now = Instant.now()
        VerificationCodes.select(
            listOf(
                VerificationCodes.id,
                VerificationCodes.email,
                VerificationCodes.code,
                VerificationCodes.expiresAt,
                VerificationCodes.createdAt
            )
        )
            .where {
                (VerificationCodes.email eq email) and (VerificationCodes.code eq code) and (VerificationCodes.expiresAt greater now)
            }
            .map { it.toVerificationCode() }
            .singleOrNull()
    }

    suspend fun create(verificationCode: VerificationCode): VerificationCode = dbQuery {
        VerificationCodes.insert {
            it[id] = verificationCode.id
            it[email] = verificationCode.email
            it[code] = verificationCode.code
            it[expiresAt] = verificationCode.expiresAt
            it[createdAt] = verificationCode.createdAt
        }
        verificationCode
    }

    suspend fun delete(id: String): Boolean = dbQuery {
        VerificationCodes.deleteWhere { VerificationCodes.id eq id } > 0
    }

    suspend fun deleteExpired(): Int = dbQuery {
        val now = Instant.now()
        VerificationCodes.deleteWhere { VerificationCodes.expiresAt less now }
    }
}

